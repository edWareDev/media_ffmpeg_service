import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

export const getMediaMetadata = async (mediaId) => {
    const media = await MediaRepositoryImpl.findById(mediaId);
    if (!media) return { error: ERROR_CODES.MEDIA_NOT_FOUND };
    return {
        mediaId: media.mediaId,
        mediaType: media.mediaType,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        metadata: media.metadata || {}
    };
};
