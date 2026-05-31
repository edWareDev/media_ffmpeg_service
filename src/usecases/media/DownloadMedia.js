import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { storageService } from '../../infrastructure/services/gridFsStorageService.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

export const downloadMedia = async (mediaId) => {
    const media = await MediaRepositoryImpl.findById(mediaId);
    if (!media) return { error: ERROR_CODES.MEDIA_NOT_FOUND };
    return {
        media,
        stream: storageService.createReadStream(media.storage.fileId)
    };
};
