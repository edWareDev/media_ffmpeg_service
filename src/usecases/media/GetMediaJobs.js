import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { JobRepositoryImpl } from '../../domain/repositories/JobRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { jobListQuerySchema } from '../../adapters/web/validators/jobValidators.js';
import { validateSchema } from '../../utils/validateSchema.js';

export const getMediaJobs = async (mediaId, query) => {
    const media = await MediaRepositoryImpl.findById(mediaId);
    if (!media) return { error: ERROR_CODES.MEDIA_NOT_FOUND };

    const validation = validateSchema(jobListQuerySchema, query);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    const { page, limit, ...filters } = validation.data;
    return JobRepositoryImpl.findAll({ ...filters, mediaId }, { page, limit });
};
