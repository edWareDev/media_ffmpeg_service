import express from 'express';
import {
    chunkAudioController,
    normalizeAudioController,
    removeSilenceAudioController,
    transcodeAudioController
} from '../controllers/AudioController.js';

export const audioRouter = express.Router();

audioRouter.post('/:mediaId/transcode', transcodeAudioController);
audioRouter.post('/:mediaId/chunk', chunkAudioController);
audioRouter.post('/:mediaId/normalize', normalizeAudioController);
audioRouter.post('/:mediaId/remove-silence', removeSilenceAudioController);
