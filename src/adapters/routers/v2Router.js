import express from 'express';
import multer from 'multer';
import { env } from '../../../config/env.js';
import { ensureTmpDir } from '../../utils/fileSystem.js';
import { healthRouter } from './healthRouter.js';
import {
    cancelJobController,
    createJobController,
    getJobByIdController,
    getJobsController,
    retryJobController
} from '../controllers/JobController.js';
import { getOperationByTypeController, getOperationsController } from '../controllers/OperationsController.js';
import { deleteMediaController, downloadMediaController, getMediaArtifactsController, getMediaByIdController, getMediaController, getMediaJobsController, getMediaMetadataController, uploadMediaController, validateMediaController } from '../controllers/MediaController.js';
import { deleteArtifactController, downloadArtifactController, getArtifactByIdController, getArtifactChildrenController, getArtifactJobsController, getArtifactsController } from '../controllers/ArtifactController.js';

await ensureTmpDir();

const upload = multer({
    dest: env.TMP_DIR,
    limits: {
        fileSize: env.MAX_UPLOAD_MB * 1024 * 1024
    }
});

export const v1Router = express.Router();

v1Router.use(healthRouter);

v1Router.post('/media', upload.single('file'), uploadMediaController);
v1Router.get('/media', getMediaController);
v1Router.get('/media/:mediaId/download', downloadMediaController);
v1Router.get('/media/:mediaId/metadata', getMediaMetadataController);
v1Router.post('/media/:mediaId/validations', validateMediaController);
v1Router.get('/media/:mediaId/artifacts', getMediaArtifactsController);
v1Router.get('/media/:mediaId/jobs', getMediaJobsController);
v1Router.get('/media/:mediaId', getMediaByIdController);
v1Router.delete('/media/:mediaId', deleteMediaController);

v1Router.get('/artifacts', getArtifactsController);
v1Router.get('/artifacts/:artifactId/download', downloadArtifactController);
v1Router.get('/artifacts/:artifactId/children', getArtifactChildrenController);
v1Router.get('/artifacts/:artifactId/jobs', getArtifactJobsController);
v1Router.get('/artifacts/:artifactId', getArtifactByIdController);
v1Router.delete('/artifacts/:artifactId', deleteArtifactController);

v1Router.post('/jobs', createJobController);
v1Router.get('/jobs', getJobsController);
v1Router.get('/jobs/:jobId', getJobByIdController);
v1Router.post('/jobs/:jobId/cancel', cancelJobController);
v1Router.post('/jobs/:jobId/retry', retryJobController);

v1Router.get('/operations', getOperationsController);
v1Router.get('/operations/:type', getOperationByTypeController);
