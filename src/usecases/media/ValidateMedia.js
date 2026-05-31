import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { validateSchema } from '../../utils/validateSchema.js';
import { mediaValidationSchema } from '../../adapters/web/validators/mediaValidators.js';

export const validateMedia = async (mediaId, body) => {
    const validation = validateSchema(mediaValidationSchema, body);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    const media = await MediaRepositoryImpl.findById(mediaId);
    if (!media) return { error: ERROR_CODES.MEDIA_NOT_FOUND };

    const failures = [];
    const { rules } = validation.data;
    const metadata = media.metadata || {};

    if (rules.allowedTypes?.length && !rules.allowedTypes.includes(media.mediaType)) {
        failures.push({ rule: 'allowedTypes', message: 'Tipo de media no permitido.' });
    }
    if (rules.maxSizeMb && media.sizeBytes > rules.maxSizeMb * 1024 * 1024) {
        failures.push({ rule: 'maxSizeMb', message: 'El archivo supera el tamaño máximo.' });
    }
    if (rules.maxDurationSeconds && metadata.durationSeconds > rules.maxDurationSeconds) {
        failures.push({ rule: 'maxDurationSeconds', message: 'La duración supera el máximo.' });
    }
    if (rules.allowedContainers?.length && metadata.container && !rules.allowedContainers.includes(metadata.container)) {
        failures.push({ rule: 'allowedContainers', message: 'Contenedor no permitido.' });
    }
    if (rules.maxResolution && metadata.width && metadata.height) {
        const [maxWidth, maxHeight] = rules.maxResolution.split('x').map(Number);
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
            failures.push({ rule: 'maxResolution', message: 'Resolución no permitida.' });
        }
    }

    return {
        mediaId,
        valid: failures.length === 0,
        failures
    };
};
