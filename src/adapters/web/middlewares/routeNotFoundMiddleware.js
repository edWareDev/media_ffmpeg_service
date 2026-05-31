import { fetchResponse } from '../../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../../utils/HTTP_CODES.js';

export const routeNotFoundMiddleware = (req, res) => fetchResponse(res, {
    statusCode: HTTP_CODES._404_NOT_FOUND,
    message: 'Ruta no encontrada.',
    errorCode: 'ROUTE_NOT_FOUND'
});
