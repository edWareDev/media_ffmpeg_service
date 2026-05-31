import { createAudioJob } from '../../usecases/audio/CreateAudioJob.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/http_error_codes.js';
import { handleControllerError, throwIfError } from './controllerHelpers.js';

const createAudioJobController = (type) => async (req, res) => {
    try {
        const result = await createAudioJob(type, req.params.mediaId, req.body);
        throwIfError(result, 'No se pudo crear el job de audio.');
        fetchResponse(res, { statusCode: HTTP_CODES._202_ACCEPTED, message: 'Job de audio creado correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

const createArtifactAudioJobController = (type) => async (req, res) => {
    try {
        const result = await createAudioJob(type, undefined, req.body, {
            sourceType: 'artifact',
            sourceId: req.params.artifactId
        });
        throwIfError(result, 'No se pudo crear el job de audio desde artefacto.');
        fetchResponse(res, { statusCode: HTTP_CODES._202_ACCEPTED, message: 'Job de audio creado correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const transcodeAudioController = createAudioJobController('audio.transcode');
export const chunkAudioController = createAudioJobController('audio.chunk');
export const normalizeAudioController = createAudioJobController('audio.normalize');
export const removeSilenceAudioController = createAudioJobController('audio.removeSilence');

export const transcodeArtifactAudioController = createArtifactAudioJobController('audio.transcode');
export const chunkArtifactAudioController = createArtifactAudioJobController('audio.chunk');
export const normalizeArtifactAudioController = createArtifactAudioJobController('audio.normalize');
export const removeSilenceArtifactAudioController = createArtifactAudioJobController('audio.removeSilence');
