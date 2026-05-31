import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { validateJobSourceCompatibility } from './ValidateJobSourceCompatibility.js';

describe('validateJobSourceCompatibility', () => {
    it('accepts audio operations for audio media', () => {
        const result = validateJobSourceCompatibility({
            type: 'audio.transcode',
            media: { mediaType: 'audio', metadata: { codec: 'aac' } }
        });

        expect(result.error).toBeUndefined();
    });

    it('rejects audio operations for video media without audio metadata', () => {
        const result = validateJobSourceCompatibility({
            type: 'audio.chunk',
            media: { mediaType: 'video', metadata: { width: 1920, height: 1080 } }
        });

        expect(result.error).toBe(ERROR_CODES.UNSUPPORTED_OPERATION_SOURCE);
    });

    it('accepts audio operations for video media with audio metadata', () => {
        const result = validateJobSourceCompatibility({
            type: 'audio.normalize',
            media: { mediaType: 'video', metadata: { width: 1920, channels: 2 } }
        });

        expect(result.error).toBeUndefined();
    });

    it('accepts video operations for video_segment artifacts', () => {
        const result = validateJobSourceCompatibility({
            type: 'video.transcode',
            artifact: { type: 'video_segment' }
        });

        expect(result.error).toBeUndefined();
    });

    it('rejects ffmpeg operations for thumbnails', () => {
        const result = validateJobSourceCompatibility({
            type: 'video.compress',
            artifact: { type: 'thumbnail' }
        });

        expect(result.error).toBe(ERROR_CODES.UNSUPPORTED_OPERATION_SOURCE);
    });

    it('rejects ffmpeg operations for scene detection artifacts', () => {
        const result = validateJobSourceCompatibility({
            type: 'audio.transcode',
            artifact: { type: 'scene_detection' }
        });

        expect(result.error).toBe(ERROR_CODES.UNSUPPORTED_OPERATION_SOURCE);
    });
});
