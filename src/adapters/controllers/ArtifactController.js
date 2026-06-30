import { deleteArtifact } from '../../usecases/artifacts/DeleteArtifact.js';
import { downloadArtifact } from '../../usecases/artifacts/DownloadArtifact.js';
import { getArtifactById } from '../../usecases/artifacts/GetArtifactById.js';
import { getArtifactChildren } from '../../usecases/artifacts/GetArtifactChildren.js';
import { getArtifactJobs } from '../../usecases/artifacts/GetArtifactJobs.js';
import { getArtifacts } from '../../usecases/artifacts/GetArtifacts.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/HTTP_CODES.js';
import { handleControllerError, throwIfError } from './controllerHelpers.js';

export const getArtifactsController = async (req, res) => {
    try {
        const result = await getArtifacts(req.query);
        throwIfError(result, 'No se pudieron obtener los artefactos.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Artefactos obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getArtifactByIdController = async (req, res) => {
    try {
        const result = await getArtifactById(req.params.artifactId);
        throwIfError(result, 'Artefacto no encontrado.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Artefacto obtenido correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getArtifactChildrenController = async (req, res) => {
    try {
        const result = await getArtifactChildren(req.params.artifactId);
        throwIfError(result, 'No se pudieron obtener los artefactos hijos.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Artefactos hijos obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getArtifactJobsController = async (req, res) => {
    try {
        const result = await getArtifactJobs(req.params.artifactId, req.query);
        throwIfError(result, 'No se pudieron obtener los jobs del artefacto.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Jobs obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};


export const downloadArtifactController = async (req, res) => {
    try {
        const result = await downloadArtifact(req.params.artifactId);
        throwIfError(result, 'Artefacto no encontrado.');
        res.setHeader('Content-Type', result.artifact.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.artifact.filename}"`);
        result.stream.pipe(res);
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const deleteArtifactController = async (req, res) => {
    try {
        const result = await deleteArtifact(req.params.artifactId, req.query);
        throwIfError(result, 'No se pudo eliminar el artefacto.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Artefacto eliminado correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};
