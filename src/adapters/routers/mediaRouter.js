import express from 'express';
import multer from 'multer';
import { env } from '../../../config/env.js';
import { ensureTmpDir } from '../../utils/fileSystem.js';
import {
    deleteMediaController,
    downloadMediaController,
    getMediaController,
    getMediaArtifactsController,
    getMediaByIdController,
    getMediaMetadataController,
    createMetadataJobController,
    uploadMediaController,
    validateMediaController
} from '../controllers/MediaController.js';

await ensureTmpDir();

const upload = multer({
    dest: env.TMP_DIR,
    limits: {
        fileSize: env.MAX_UPLOAD_MB * 1024 * 1024
    }
});

export const mediaRouter = express.Router();

mediaRouter.post('/upload', upload.single('file'), uploadMediaController);
mediaRouter.get('/', getMediaController);
mediaRouter.get('/:mediaId', getMediaByIdController);
mediaRouter.get('/:mediaId/metadata', getMediaMetadataController);
mediaRouter.post('/:mediaId/metadata/extract', createMetadataJobController);
mediaRouter.post('/:mediaId/validate', validateMediaController);
mediaRouter.get('/:mediaId/download', downloadMediaController);
mediaRouter.get('/:mediaId/artifacts', getMediaArtifactsController);
mediaRouter.delete('/:mediaId', deleteMediaController);
