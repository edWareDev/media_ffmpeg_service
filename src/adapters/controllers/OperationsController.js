import { getOperationByType, getOperations } from '../../usecases/operations/GetOperations.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/http_error_codes.js';
import { handleControllerError, throwIfError } from './controllerHelpers.js';

export const getOperationsController = async (req, res) => {
    try {
        const result = getOperations();
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Operaciones obtenidas correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getOperationByTypeController = async (req, res) => {
    try {
        const result = getOperationByType(req.params.type);
        throwIfError(result, 'Operación no encontrada.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Operación obtenida correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};
