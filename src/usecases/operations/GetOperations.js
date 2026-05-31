import { OPERATION_DEFINITIONS } from '../../../config/mediaConstants.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

export const getOperations = () => ({ items: OPERATION_DEFINITIONS, total: OPERATION_DEFINITIONS.length });

export const getOperationByType = (type) => {
    const operation = OPERATION_DEFINITIONS.find((item) => item.type === type);
    if (!operation) return { error: ERROR_CODES.OPERATION_NOT_FOUND };
    return operation;
};
