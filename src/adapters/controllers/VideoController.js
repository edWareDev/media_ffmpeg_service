import { createVideoJob } from '../../usecases/video/CreateVideoJob.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/http_error_codes.js';
import { handleControllerError, throwIfError } from './controllerHelpers.js';

const createVideoJobController = (type) => async (req, res) => {
    try {
        const result = await createVideoJob(type, req.params.mediaId, req.body);
        throwIfError(result, 'No se pudo crear el job de video.');
        fetchResponse(res, { statusCode: HTTP_CODES._202_ACCEPTED, message: 'Job de video creado correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

const createArtifactVideoJobController = (type) => async (req, res) => {
    try {
        const result = await createVideoJob(type, undefined, req.body, {
            sourceType: 'artifact',
            sourceId: req.params.artifactId
        });
        throwIfError(result, 'No se pudo crear el job de video desde artefacto.');
        fetchResponse(res, { statusCode: HTTP_CODES._202_ACCEPTED, message: 'Job de video creado correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const extractAudioFromVideoController = createVideoJobController('video.extractAudio');
export const transcodeVideoController = createVideoJobController('video.transcode');
export const compressVideoController = createVideoJobController('video.compress');
export const splitVideoController = createVideoJobController('video.split');
export const extractFramesController = createVideoJobController('video.extractFrames');
export const detectScenesController = createVideoJobController('video.detectScenes');
export const generateThumbnailsController = createVideoJobController('video.generateThumbnails');

export const extractAudioFromArtifactVideoController = createArtifactVideoJobController('video.extractAudio');
export const transcodeArtifactVideoController = createArtifactVideoJobController('video.transcode');
export const compressArtifactVideoController = createArtifactVideoJobController('video.compress');
export const splitArtifactVideoController = createArtifactVideoJobController('video.split');
export const extractArtifactFramesController = createArtifactVideoJobController('video.extractFrames');
export const detectArtifactScenesController = createArtifactVideoJobController('video.detectScenes');
export const generateArtifactThumbnailsController = createArtifactVideoJobController('video.generateThumbnails');
