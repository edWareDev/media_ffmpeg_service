import express from 'express';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/http_error_codes.js';

export const healthRouter = express.Router();

healthRouter.get('/health', (req, res) => fetchResponse(res, {
    statusCode: HTTP_CODES._200_OK,
    message: 'Servicio disponible.',
    data: { status: 'ok' }
}));
