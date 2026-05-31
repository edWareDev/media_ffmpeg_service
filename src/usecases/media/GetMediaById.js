import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

export const getMediaById = async (mediaId) => {
    const media = await MediaRepositoryImpl.findById(mediaId);
    if (!media) return { error: ERROR_CODES.MEDIA_NOT_FOUND };
    return media;
};
