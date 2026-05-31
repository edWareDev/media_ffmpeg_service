import { createJob } from '../jobs/CreateJob.js';
import { validateSchema } from '../../utils/validateSchema.js';
import {
    videoCompressSchema,
    videoDetectScenesSchema,
    videoExtractAudioSchema,
    videoExtractFramesSchema,
    videoGenerateThumbnailsSchema,
    videoSplitSchema,
    videoTranscodeSchema
} from '../../adapters/web/validators/videoValidators.js';

const schemasByType = {
    'video.extractAudio': videoExtractAudioSchema,
    'video.transcode': videoTranscodeSchema,
    'video.compress': videoCompressSchema,
    'video.split': videoSplitSchema,
    'video.extractFrames': videoExtractFramesSchema,
    'video.detectScenes': videoDetectScenesSchema,
    'video.generateThumbnails': videoGenerateThumbnailsSchema
};

export const createVideoJob = async (type, mediaId, body, source = {}) => {
    const validation = validateSchema(schemasByType[type], body);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };
    return createJob({
        type,
        mediaId,
        sourceType: source.sourceType || 'media',
        sourceId: source.sourceId || mediaId,
        options: validation.data
    });
};
