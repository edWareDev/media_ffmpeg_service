import { CustomError } from '../../utils/CustomError.js';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/http_error_codes.js';

const statusByError = {
    [ERROR_CODES.MEDIA_NOT_FOUND]: HTTP_CODES._404_NOT_FOUND,
    [ERROR_CODES.MEDIA_HAS_ARTIFACTS]: HTTP_CODES._409_CONFLICT,
    [ERROR_CODES.ARTIFACT_NOT_FOUND]: HTTP_CODES._404_NOT_FOUND,
    [ERROR_CODES.ARTIFACT_HAS_CHILDREN]: HTTP_CODES._409_CONFLICT,
    [ERROR_CODES.JOB_NOT_FOUND]: HTTP_CODES._404_NOT_FOUND,
    [ERROR_CODES.INVALID_JOB_STATE]: HTTP_CODES._409_CONFLICT,
    [ERROR_CODES.UNSUPPORTED_OPERATION_SOURCE]: HTTP_CODES._422_UNPROCESSABLE_ENTITY,
    [ERROR_CODES.OPERATION_NOT_FOUND]: HTTP_CODES._404_NOT_FOUND,
    [ERROR_CODES.VALIDATION_FAILED]: HTTP_CODES._400_BAD_REQUEST,
    [ERROR_CODES.INVALID_FILE]: HTTP_CODES._400_BAD_REQUEST
};

export const throwIfError = (result, message = 'No se pudo completar la operación.') => {
    if (!result?.error) return;
    throw new CustomError(message, statusByError[result.error] || HTTP_CODES._400_BAD_REQUEST, result.error);
};

export const handleControllerError = (res, error) => {
    if (error instanceof CustomError) {
        const { message, httpErrorCode, errorCode } = error.toJSON();
        return fetchResponse(res, { statusCode: httpErrorCode, message, errorCode });
    }

    return fetchResponse(res, {
        statusCode: HTTP_CODES._500_INTERNAL_SERVER_ERROR,
        message: 'Error interno del servicio.',
        errorCode: error.message
    });
};
