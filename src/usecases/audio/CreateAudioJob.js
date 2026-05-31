import { createJob } from '../jobs/CreateJob.js';
import { validateSchema } from '../../utils/validateSchema.js';
import {
    audioChunkSchema,
    audioNormalizeSchema,
    audioRemoveSilenceSchema,
    audioTranscodeSchema
} from '../../adapters/web/validators/audioValidators.js';

const schemasByType = {
    'audio.transcode': audioTranscodeSchema,
    'audio.chunk': audioChunkSchema,
    'audio.normalize': audioNormalizeSchema,
    'audio.removeSilence': audioRemoveSilenceSchema
};

export const createAudioJob = async (type, mediaId, body, source = {}) => {
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
