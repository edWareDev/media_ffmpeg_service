import path from 'node:path';
import mime from 'mime-types';
import { Worker } from 'bullmq';
import { mediaQueueName } from '../infrastructure/services/jobQueueService.js';
import { redisConnection } from '../infrastructure/services/redis.client.js';
import { storageService } from '../infrastructure/services/gridFsStorageService.js';
import { ffmpegService } from '../infrastructure/services/ffmpegService.js';
import { MediaRepositoryImpl } from '../domain/repositories/MediaRepositoryImpl.js';
import { ArtifactRepositoryImpl } from '../domain/repositories/ArtifactRepositoryImpl.js';
import { JobRepositoryImpl } from '../domain/repositories/JobRepositoryImpl.js';
import { removeFileIfExists } from '../utils/fileSystem.js';
import { JOB_OUTPUT_ARTIFACT_TYPES } from '../../config/mediaConstants.js';

const processors = {
    'media.extractMetadata': null,
    'audio.transcode': ffmpegService.transcodeAudio,
    'audio.chunk': ffmpegService.chunkAudio,
    'audio.normalize': ffmpegService.normalizeAudio,
    'audio.removeSilence': ffmpegService.removeSilence,
    'video.extractAudio': ffmpegService.extractAudioFromVideo,
    'video.transcode': ffmpegService.transcodeVideo,
    'video.compress': ffmpegService.compressVideo,
    'video.split': ffmpegService.splitVideo,
    'video.extractFrames': ffmpegService.extractFrames,
    'video.detectScenes': ffmpegService.detectScenes,
    'video.generateThumbnails': ffmpegService.generateThumbnails
};

const resolveJobSource = async ({ mediaId, sourceType = 'media', sourceId }) => {
    const media = await MediaRepositoryImpl.findById(mediaId);
    if (!media) throw new Error('MEDIA_NOT_FOUND');

    if (sourceType === 'artifact') {
        const artifact = await ArtifactRepositoryImpl.findById(sourceId);
        if (!artifact) throw new Error('ARTIFACT_NOT_FOUND');
        return {
            media,
            sourceType,
            sourceId,
            sourceFileId: artifact.storage.fileId,
            sourceFilename: artifact.filename
        };
    }

    return {
        media,
        sourceType: 'media',
        sourceId: sourceId || mediaId,
        sourceFileId: media.storage.fileId,
        sourceFilename: media.filename
    };
};

const normalizeOutput = (output) => typeof output === 'string'
    ? { path: output, metadata: {} }
    : { path: output.path, metadata: output.metadata || {} };

const createArtifactFromOutput = async ({ output, mediaId, jobId, type, index, sourceType, sourceId }) => {
    const normalizedOutput = normalizeOutput(output);
    const filename = path.basename(normalizedOutput.path);
    const mimeType = mime.lookup(normalizedOutput.path) || (type === 'scene_detection' ? 'application/json' : 'application/octet-stream');
    const upload = await storageService.uploadLocalFile(normalizedOutput.path, {
        filename,
        mimeType,
        source: 'ffmpeg',
        jobId,
        mediaId,
        artifactType: type
    });

    if (upload.error) throw new Error(upload.error);

    let metadata = {};
    if (type !== 'scene_detection') {
        try {
            metadata = await ffmpegService.probe(normalizedOutput.path);
        } catch {
            metadata = {};
        }
    }

    return ArtifactRepositoryImpl.create({
        mediaId,
        sourceType,
        sourceId,
        parentArtifactId: sourceType === 'artifact' ? sourceId : undefined,
        jobId,
        type,
        filename,
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
        storage: {
            provider: 'gridfs',
            fileId: upload.fileId
        },
        metadata: {
            ...metadata,
            ...normalizedOutput.metadata,
            index
        }
    });
};

export const startMediaWorker = () => new Worker(
    mediaQueueName,
    async (queueJob) => {
        const { jobId, mediaId, sourceType = 'media', sourceId = mediaId, type, options } = queueJob.data;
        const source = await resolveJobSource({ mediaId, sourceType, sourceId });

        await JobRepositoryImpl.updateById(jobId, {
            status: 'active',
            startedAt: new Date(),
            progress: 5,
            currentStep: 'downloading_source'
        });

        const downloaded = await storageService.downloadToLocalFile(source.sourceFileId, source.sourceFilename);
        if (downloaded.error) throw new Error(downloaded.error);

        const outputPaths = [];

        try {
            await JobRepositoryImpl.updateById(jobId, { progress: 15, currentStep: 'probing_source' });
            const sourceMetadata = await ffmpegService.probe(downloaded.path);
            if (source.sourceType === 'media') {
                await MediaRepositoryImpl.updateById(mediaId, {
                mediaType: sourceMetadata.mediaType,
                metadata: sourceMetadata
                });
            }

            if (type === 'media.extractMetadata') {
                await JobRepositoryImpl.updateById(jobId, {
                    status: 'completed',
                    progress: 100,
                    currentStep: 'completed',
                    completedAt: new Date(),
                    result: {
                        metadataUpdated: true
                    }
                });
                return { metadataUpdated: true };
            }

            await JobRepositoryImpl.updateById(jobId, { progress: 20, currentStep: 'processing_ffmpeg' });
            const processor = processors[type];
            const generated = await processor(downloaded.path, options);
            outputPaths.push(...generated);

            await JobRepositoryImpl.updateById(jobId, { progress: 75, currentStep: 'saving_artifacts' });
            const artifactType = JOB_OUTPUT_ARTIFACT_TYPES[type];
            const artifacts = [];
            for (const [index, output] of outputPaths.entries()) {
                artifacts.push(await createArtifactFromOutput({
                    output,
                    mediaId,
                    jobId,
                    type: artifactType,
                    index,
                    sourceType: source.sourceType,
                    sourceId: source.sourceId
                }));
            }

            await JobRepositoryImpl.updateById(jobId, {
                status: 'completed',
                progress: 100,
                currentStep: 'completed',
                completedAt: new Date(),
                result: {
                    artifactCount: artifacts.length,
                    artifactType
                }
            });

            return { artifactCount: artifacts.length };
        } catch (error) {
            await JobRepositoryImpl.updateById(jobId, {
                status: 'failed',
                failedAt: new Date(),
                currentStep: 'failed',
                error: {
                    message: 'No se pudo procesar el archivo.',
                    code: error.message
                }
            });
            throw error;
        } finally {
            await removeFileIfExists(downloaded.path);
            await Promise.all(outputPaths.map((output) => removeFileIfExists(normalizeOutput(output).path)));
        }
    },
    { connection: redisConnection }
);
