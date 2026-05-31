import { createJob } from '../../usecases/jobs/CreateJob.js';
import { getJobById } from '../../usecases/jobs/GetJobById.js';
import { getJobs } from '../../usecases/jobs/GetJobs.js';
import { cancelJob } from '../../usecases/jobs/CancelJob.js';
import { retryJob } from '../../usecases/jobs/RetryJob.js';
import { fetchResponse } from '../../utils/fetchResponse.js';
import { HTTP_CODES } from '../../utils/HTTP_CODES.js';
import { handleControllerError, throwIfError } from './controllerHelpers.js';

export const createJobController = async (req, res) => {
    try {
        const result = await createJob(req.body);
        throwIfError(result, 'No se pudo crear el job.');
        fetchResponse(res, { statusCode: HTTP_CODES._202_ACCEPTED, message: 'Job creado correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getJobByIdController = async (req, res) => {
    try {
        const result = await getJobById(req.params.jobId);
        throwIfError(result, 'Job no encontrado.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Job obtenido correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const getJobsController = async (req, res) => {
    try {
        const result = await getJobs(req.query);
        throwIfError(result, 'No se pudieron obtener los jobs.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Jobs obtenidos correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const cancelJobController = async (req, res) => {
    try {
        const result = await cancelJob(req.params.jobId);
        throwIfError(result, 'No se pudo cancelar el job.');
        fetchResponse(res, { statusCode: HTTP_CODES._200_OK, message: 'Job cancelado correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const retryJobController = async (req, res) => {
    try {
        const result = await retryJob(req.params.jobId);
        throwIfError(result, 'No se pudo reintentar el job.');
        fetchResponse(res, { statusCode: HTTP_CODES._202_ACCEPTED, message: 'Job reencolado correctamente.', data: result });
    } catch (error) {
        handleControllerError(res, error);
    }
};
