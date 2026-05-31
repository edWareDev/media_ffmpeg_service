import express from 'express';
import multer from 'multer';
import { env } from '../../../config/env.js';
import { ensureTmpDir } from '../../utils/fileSystem.js';
import { healthRouter } from './healthRouter.js';
import {
    deleteMediaV2Controller,
    downloadMediaV2Controller,
    getMediaArtifactsV2Controller,
    getMediaByIdV2Controller,
    getMediaJobsV2Controller,
    getMediaMetadataV2Controller,
    getMediaV2Controller,
    uploadMediaV2Controller,
    validateMediaV2Controller
} from '../controllers/MediaV2Controller.js';
import {
    deleteArtifactV2Controller,
    downloadArtifactV2Controller,
    getArtifactByIdV2Controller,
    getArtifactChildrenV2Controller,
    getArtifactJobsV2Controller,
    getArtifactsV2Controller
} from '../controllers/ArtifactV2Controller.js';
import {
    cancelJobController,
    createJobController,
    getJobByIdController,
    getJobsController,
    retryJobController
} from '../controllers/JobController.js';
import { getOperationByTypeController, getOperationsController } from '../controllers/OperationsController.js';

await ensureTmpDir();

const upload = multer({
    dest: env.TMP_DIR,
    limits: {
        fileSize: env.MAX_UPLOAD_MB * 1024 * 1024
    }
});

export const v2Router = express.Router();

v2Router.use(healthRouter);

v2Router.post('/media', upload.single('file'), uploadMediaV2Controller);
v2Router.get('/media', getMediaV2Controller);
v2Router.get('/media/:mediaId/download', downloadMediaV2Controller);
v2Router.get('/media/:mediaId/metadata', getMediaMetadataV2Controller);
v2Router.post('/media/:mediaId/validations', validateMediaV2Controller);
v2Router.get('/media/:mediaId/artifacts', getMediaArtifactsV2Controller);
v2Router.get('/media/:mediaId/jobs', getMediaJobsV2Controller);
v2Router.get('/media/:mediaId', getMediaByIdV2Controller);
v2Router.delete('/media/:mediaId', deleteMediaV2Controller);

v2Router.get('/artifacts', getArtifactsV2Controller);
v2Router.get('/artifacts/:artifactId/download', downloadArtifactV2Controller);
v2Router.get('/artifacts/:artifactId/children', getArtifactChildrenV2Controller);
v2Router.get('/artifacts/:artifactId/jobs', getArtifactJobsV2Controller);
v2Router.get('/artifacts/:artifactId', getArtifactByIdV2Controller);
v2Router.delete('/artifacts/:artifactId', deleteArtifactV2Controller);

v2Router.post('/jobs', createJobController);
v2Router.get('/jobs', getJobsController);
v2Router.get('/jobs/:jobId', getJobByIdController);
v2Router.post('/jobs/:jobId/cancel', cancelJobController);
v2Router.post('/jobs/:jobId/retry', retryJobController);

v2Router.get('/operations', getOperationsController);
v2Router.get('/operations/:type', getOperationByTypeController);
