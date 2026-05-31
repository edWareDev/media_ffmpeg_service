import {
    deleteMediaController,
    downloadMediaController,
    getMediaArtifactsController,
    getMediaByIdController,
    getMediaController,
    getMediaMetadataController,
    uploadMediaController,
    validateMediaController
} from './MediaController.js';
import { getMediaJobs } from '../../usecases/media/GetMediaJobs.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/http_error_codes.js';
import { handleControllerError, throwIfError } from './controllerHelpers.js';

export {
    deleteMediaController as deleteMediaV2Controller,
    downloadMediaController as downloadMediaV2Controller,
    getMediaArtifactsController as getMediaArtifactsV2Controller,
    getMediaByIdController as getMediaByIdV2Controller,
    getMediaController as getMediaV2Controller,
    getMediaMetadataController as getMediaMetadataV2Controller,
    uploadMediaController as uploadMediaV2Controller,
    validateMediaController as validateMediaV2Controller
};

export const getMediaJobsV2Controller = async (req, res) => {
    try {
        const result = await getMediaJobs(req.params.mediaId, req.query);
        throwIfError(result, 'No se pudieron obtener los jobs del archivo.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Jobs obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};
