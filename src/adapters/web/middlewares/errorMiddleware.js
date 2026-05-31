import multer from 'multer';
import { fetchResponse } from '../../../utils/fetchResponse.js';
import { ERROR_CODES } from '../../../utils/error_codes.js';
import { HTTP_CODES } from '../../../utils/http_error_codes.js';

export const errorMiddleware = (error, req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof multer.MulterError) {
        fetchResponse(res, {
            statusCode: HTTP_CODES._400_BAD_REQUEST,
            message: 'Archivo inválido.',
            errorCode: error.code === 'LIMIT_FILE_SIZE' ? ERROR_CODES.FILE_TOO_LARGE : ERROR_CODES.INVALID_FILE
        });
        return;
    }

    fetchResponse(res, {
        statusCode: HTTP_CODES._500_INTERNAL_SERVER_ERROR,
        message: 'Error interno del servicio.',
        errorCode: error.message
    });
};
