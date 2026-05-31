import express from 'express';
import {
    chunkArtifactAudioController,
    normalizeArtifactAudioController,
    removeSilenceArtifactAudioController,
    transcodeArtifactAudioController
} from '../controllers/AudioController.js';
import {
    compressArtifactVideoController,
    detectArtifactScenesController,
    extractArtifactFramesController,
    extractAudioFromArtifactVideoController,
    generateArtifactThumbnailsController,
    splitArtifactVideoController,
    transcodeArtifactVideoController
} from '../controllers/VideoController.js';
import {
    deleteArtifactController,
    downloadArtifactController
} from '../controllers/ArtifactController.js';

export const artifactsRouter = express.Router();

artifactsRouter.post('/:artifactId/audio/transcode', transcodeArtifactAudioController);
artifactsRouter.post('/:artifactId/audio/chunk', chunkArtifactAudioController);
artifactsRouter.post('/:artifactId/audio/normalize', normalizeArtifactAudioController);
artifactsRouter.post('/:artifactId/audio/remove-silence', removeSilenceArtifactAudioController);

artifactsRouter.post('/:artifactId/video/extract-audio', extractAudioFromArtifactVideoController);
artifactsRouter.post('/:artifactId/video/transcode', transcodeArtifactVideoController);
artifactsRouter.post('/:artifactId/video/compress', compressArtifactVideoController);
artifactsRouter.post('/:artifactId/video/split', splitArtifactVideoController);
artifactsRouter.post('/:artifactId/video/extract-frames', extractArtifactFramesController);
artifactsRouter.post('/:artifactId/video/detect-scenes', detectArtifactScenesController);
artifactsRouter.post('/:artifactId/video/generate-thumbnails', generateArtifactThumbnailsController);

artifactsRouter.get('/:artifactId/download', downloadArtifactController);
artifactsRouter.delete('/:artifactId', deleteArtifactController);
