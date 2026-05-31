import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { validateSchema } from '../../utils/validateSchema.js';
import { mediaListQuerySchema } from '../../adapters/web/validators/mediaValidators.js';

export const getMedia = async (query) => {
    const validation = validateSchema(mediaListQuerySchema, query);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    const { page, limit, ...filters } = validation.data;
    return MediaRepositoryImpl.findAll(filters, { page, limit });
};
