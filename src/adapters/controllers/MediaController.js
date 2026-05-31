import { uploadMedia } from '../../usecases/media/UploadMedia.js';
import { getMedia } from '../../usecases/media/GetMedia.js';
import { getMediaById } from '../../usecases/media/GetMediaById.js';
import { getMediaMetadata } from '../../usecases/media/GetMediaMetadata.js';
import { validateMedia } from '../../usecases/media/ValidateMedia.js';
import { getMediaArtifacts } from '../../usecases/media/GetMediaArtifacts.js';
import { deleteMedia } from '../../usecases/media/DeleteMedia.js';
import { downloadMedia } from '../../usecases/media/DownloadMedia.js';
import { removeFileIfExists } from '../../utils/fileSystem.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/HTTP_CODES.js';
import { handleControllerError, throwIfError } from './controllerHelpers.js';

export const uploadMediaController = async (req, res) => {
    try {
        const result = await uploadMedia({ file: req.file, body: req.body });
        throwIfError(result, 'No se pudo subir el archivo.');
        fetchResponse(res, {
            statusCode: HTTP_CODES._201_CREATED,
            message: 'Archivo subido correctamente.',
            data: result
        });
    } catch (error) {
        handleControllerError(res, error);
    } finally {
        await removeFileIfExists(req.file?.path);
    }
};

export const getMediaController = async (req, res) => {
    try {
        const result = await getMedia(req.query);
        throwIfError(result, 'No se pudieron obtener los archivos.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Archivos obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getMediaByIdController = async (req, res) => {
    try {
        const result = await getMediaById(req.params.mediaId);
        throwIfError(result, 'Archivo no encontrado.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Archivo obtenido correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getMediaMetadataController = async (req, res) => {
    try {
        const result = await getMediaMetadata(req.params.mediaId);
        throwIfError(result, 'Metadata no encontrada.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Metadata obtenida correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const validateMediaController = async (req, res) => {
    try {
        const result = await validateMedia(req.params.mediaId, req.body);
        throwIfError(result, 'No se pudo validar el archivo.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Validación ejecutada correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const downloadMediaController = async (req, res) => {
    try {
        const result = await downloadMedia(req.params.mediaId);
        throwIfError(result, 'Archivo no encontrado.');
        res.setHeader('Content-Type', result.media.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.media.originalName}"`);
        result.stream.pipe(res);
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getMediaArtifactsController = async (req, res) => {
    try {
        const result = await getMediaArtifacts(req.params.mediaId, req.query);
        throwIfError(result, 'No se pudieron obtener los artefactos.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Artefactos obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const deleteMediaController = async (req, res) => {
    try {
        const result = await deleteMedia(req.params.mediaId, req.query);
        throwIfError(result, 'No se pudo eliminar el archivo.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Archivo eliminado correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};
