import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { ArtifactRepositoryImpl } from '../../domain/repositories/ArtifactRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { validateSchema } from '../../utils/validateSchema.js';
import { artifactListQuerySchema } from '../../adapters/web/validators/mediaValidators.js';

export const getMediaArtifacts = async (mediaId, query) => {
    const media = await MediaRepositoryImpl.findById(mediaId);
    if (!media) return { error: ERROR_CODES.MEDIA_NOT_FOUND };

    const validation = validateSchema(artifactListQuerySchema, query);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    const { page, limit, type } = validation.data;
    return ArtifactRepositoryImpl.findByMediaId(mediaId, { type }, { page, limit });
};
