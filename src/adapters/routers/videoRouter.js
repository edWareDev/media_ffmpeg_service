import express from 'express';
import {
    compressVideoController,
    detectScenesController,
    extractAudioFromVideoController,
    extractFramesController,
    generateThumbnailsController,
    splitVideoController,
    transcodeVideoController
} from '../controllers/VideoController.js';

export const videoRouter = express.Router();

videoRouter.post('/:mediaId/extract-audio', extractAudioFromVideoController);
videoRouter.post('/:mediaId/transcode', transcodeVideoController);
videoRouter.post('/:mediaId/compress', compressVideoController);
videoRouter.post('/:mediaId/split', splitVideoController);
videoRouter.post('/:mediaId/extract-frames', extractFramesController);
videoRouter.post('/:mediaId/detect-scenes', detectScenesController);
videoRouter.post('/:mediaId/generate-thumbnails', generateThumbnailsController);
