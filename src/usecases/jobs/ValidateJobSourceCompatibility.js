import { OPERATION_DEFINITIONS } from '../../../config/mediaConstants.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

const hasAudioStream = (metadata = {}) => Boolean(metadata.channels || metadata.sampleRate || metadata.audioCodec);

const sourceError = (reason) => ({
    error: ERROR_CODES.UNSUPPORTED_OPERATION_SOURCE,
    reason
});

export const validateJobSourceCompatibility = ({ type, media, artifact }) => {
    const operation = OPERATION_DEFINITIONS.find((item) => item.type === type);
    if (!operation) return { error: ERROR_CODES.OPERATION_NOT_FOUND };

    if (artifact) {
        if (!operation.acceptsArtifactTypes.includes(artifact.type)) {
            return sourceError(`La operación ${type} no acepta artefactos de tipo ${artifact.type}.`);
        }

        return { operation };
    }

    if (!media) return sourceError('La fuente media es requerida.');

    if (!operation.acceptsMediaTypes.includes(media.mediaType)) {
        return sourceError(`La operación ${type} no acepta media de tipo ${media.mediaType}.`);
    }

    if (operation.requiresAudioStream && media.mediaType === 'video' && !hasAudioStream(media.metadata)) {
        return sourceError(`La operación ${type} requiere una fuente con audio.`);
    }

    return { operation };
};
