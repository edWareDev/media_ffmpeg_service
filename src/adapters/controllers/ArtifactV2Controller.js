import { deleteArtifactController, downloadArtifactController } from './ArtifactController.js';
import { getArtifacts } from '../../usecases/artifacts/GetArtifacts.js';
import { getArtifactById } from '../../usecases/artifacts/GetArtifactById.js';
import { getArtifactChildren } from '../../usecases/artifacts/GetArtifactChildren.js';
import { getArtifactJobs } from '../../usecases/artifacts/GetArtifactJobs.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/HTTP_CODES.js';
import { handleControllerError, throwIfError } from './controllerHelpers.js';

export {
    deleteArtifactController as deleteArtifactV2Controller,
    downloadArtifactController as downloadArtifactV2Controller
};

export const getArtifactsV2Controller = async (req, res) => {
    try {
        const result = await getArtifacts(req.query);
        throwIfError(result, 'No se pudieron obtener los artefactos.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Artefactos obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getArtifactByIdV2Controller = async (req, res) => {
    try {
        const result = await getArtifactById(req.params.artifactId);
        throwIfError(result, 'Artefacto no encontrado.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Artefacto obtenido correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getArtifactChildrenV2Controller = async (req, res) => {
    try {
        const result = await getArtifactChildren(req.params.artifactId);
        throwIfError(result, 'No se pudieron obtener los artefactos hijos.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Artefactos hijos obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getArtifactJobsV2Controller = async (req, res) => {
    try {
        const result = await getArtifactJobs(req.params.artifactId, req.query);
        throwIfError(result, 'No se pudieron obtener los jobs del artefacto.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Jobs obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};
