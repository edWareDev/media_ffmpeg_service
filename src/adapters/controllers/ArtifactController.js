import { deleteArtifact } from '../../usecases/artifacts/DeleteArtifact.js';
import { downloadArtifact } from '../../usecases/artifacts/DownloadArtifact.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/HTTP_CODES.js';
import { handleControllerError, throwIfError } from './controllerHelpers.js';

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
