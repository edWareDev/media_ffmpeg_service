import express from 'express';
import {
    cancelJobController,
    createJobController,
    getJobByIdController,
    getJobsController,
    retryJobController
} from '../controllers/JobController.js';

export const jobsRouter = express.Router();

jobsRouter.post('/', createJobController);
jobsRouter.get('/', getJobsController);
jobsRouter.get('/:jobId', getJobByIdController);
jobsRouter.post('/:jobId/cancel', cancelJobController);
jobsRouter.post('/:jobId/retry', retryJobController);
