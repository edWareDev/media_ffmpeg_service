import { mediaQueue } from '../../infrastructure/services/jobQueueService.js';
import { JobRepositoryImpl } from '../../domain/repositories/JobRepositoryImpl.js';
import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { ArtifactRepositoryImpl } from '../../domain/repositories/ArtifactRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { validateSchema } from '../../utils/validateSchema.js';
import { createJobSchema } from '../../adapters/web/validators/jobValidators.js';

export const createJob = async (payload) => {
    const validation = validateSchema(createJobSchema, payload);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    let mediaId = validation.data.mediaId;
    let sourceId = validation.data.sourceId;

    if (validation.data.sourceType === 'artifact') {
        const artifact = await ArtifactRepositoryImpl.findById(sourceId);
        if (!artifact) return { error: ERROR_CODES.ARTIFACT_NOT_FOUND };
        mediaId = artifact.mediaId;
    }

    const media = await MediaRepositoryImpl.findById(mediaId);
    if (!media) return { error: ERROR_CODES.MEDIA_NOT_FOUND };

    const job = await JobRepositoryImpl.create({
        type: validation.data.type,
        mediaId,
        sourceType: validation.data.sourceType,
        sourceId,
        options: validation.data.options,
        status: 'queued',
        progress: 0
    });

    const queueJob = await mediaQueue.add(validation.data.type, {
        jobId: job.jobId,
        mediaId,
        sourceType: validation.data.sourceType,
        sourceId,
        type: validation.data.type,
        options: validation.data.options
    });

    const updated = await JobRepositoryImpl.updateById(job.jobId, { queueJobId: queueJob.id });
    return updated;
};
