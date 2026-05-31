import mime from 'mime-types';
import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { storageService } from '../../infrastructure/services/gridFsStorageService.js';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { validateSchema } from '../../utils/validateSchema.js';
import { uploadMediaSchema } from '../../adapters/web/validators/mediaValidators.js';

const getMediaType = (mimeType) => {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'unknown';
};

export const uploadMedia = async ({ file, body }) => {
    if (!file) return { error: ERROR_CODES.INVALID_FILE };

    const validation = validateSchema(uploadMediaSchema, body);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    const detectedMimeType = file.mimetype || mime.lookup(file.originalname) || 'application/octet-stream';
    const storage = await storageService.uploadLocalFile(file.path, {
        originalName: file.originalname,
        filename: file.filename,
        mimeType: detectedMimeType
    });

    if (storage.error) return { error: storage.error };

    return MediaRepositoryImpl.create({
        originalName: file.originalname,
        filename: storage.filename,
        mimeType: storage.mimeType,
        sizeBytes: storage.sizeBytes,
        mediaType: getMediaType(detectedMimeType),
        source: validation.data.source,
        purpose: validation.data.purpose,
        storage: {
            provider: 'gridfs',
            fileId: storage.fileId
        },
        metadata: {
            container: file.originalname.split('.').pop()
        }
    });
};
