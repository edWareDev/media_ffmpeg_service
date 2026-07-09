import { describe, expect, it } from 'vitest';
import {
    artifactListQuerySchema,
    deleteArtifactQuerySchema,
    deleteMediaQuerySchema,
    mediaListQuerySchema,
    mediaValidationSchema
} from './mediaValidators.js';
import {
    audioChunkSchema,
    audioNormalizeSchema,
    audioRemoveSilenceSchema,
    audioTranscodeSchema
} from './audioValidators.js';
import { createJobSchema } from './jobValidators.js';
import { videoExtractAudioSchema } from './videoValidators.js';
import { validateSchema } from '../../../utils/validateSchema.js';

describe('media validators', () => {
    it('normalizes artifactType query into type', () => {
        const result = artifactListQuerySchema.parse({
            artifactType: 'thumbnail',
            page: '2',
            limit: '10'
        });

        expect(result).toMatchObject({
            type: 'thumbnail',
            page: 2,
            limit: 10
        });
    });

    it('accepts validation rules payload', () => {
        const result = mediaValidationSchema.parse({
            rules: {
                allowedTypes: ['audio'],
                maxSizeMb: 50,
                maxResolution: '1920x1080'
            }
        });

        expect(result.rules.allowedTypes).toEqual(['audio']);
    });

    it('normalizes media list query pagination and filters', () => {
        const result = mediaListQuerySchema.parse({
            mediaType: 'video',
            source: 'upload',
            page: '3',
            limit: '5'
        });

        expect(result).toMatchObject({
            mediaType: 'video',
            source: 'upload',
            page: 3,
            limit: 5
        });
    });

    it('normalizes deletion cascade query flags', () => {
        expect(deleteMediaQuerySchema.parse({ includeArtifacts: 'true' })).toMatchObject({
            includeArtifacts: true
        });
        expect(deleteArtifactQuerySchema.parse({ includeChildren: 'true' })).toMatchObject({
            includeChildren: true
        });
    });

    it('accepts explicit codec settings for remove silence', () => {
        const result = audioRemoveSilenceSchema.parse({
            minSilenceDurationMs: 200,
            silenceThresholdDb: -40,
            targetFormat: 'ogg',
            codec: 'libopus',
            bitrate: '96k',
            channels: 1,
            sampleRate: 48000
        });

        expect(result).toMatchObject({
            targetFormat: 'ogg',
            codec: 'libopus',
            bitrate: '96k',
            channels: 1,
            sampleRate: 48000
        });
    });

    it('accepts artifact source jobs', () => {
        const result = createJobSchema.parse({
            type: 'audio.chunk',
            sourceType: 'artifact',
            sourceId: 'art_123',
            options: {
                chunkDurationSeconds: 300
            }
        });

        expect(result).toMatchObject({
            type: 'audio.chunk',
            sourceType: 'artifact',
            sourceId: 'art_123'
        });
        expect(result.mediaId).toBeUndefined();
    });

    it('accepts explicit codec settings for audio chunks', () => {
        const result = audioChunkSchema.parse({
            chunkDurationSeconds: 600,
            overlapSeconds: 5,
            targetFormat: 'ogg',
            codec: 'libopus',
            bitrate: '96k',
            channels: 1,
            sampleRate: 48000,
            preserveTimestamps: false
        });

        expect(result).toMatchObject({
            chunkDurationSeconds: 600,
            overlapSeconds: 5,
            targetFormat: 'ogg',
            codec: 'libopus',
            bitrate: '96k',
            channels: 1,
            sampleRate: 48000,
            preserveTimestamps: false
        });
    });

    it('keeps audio transcode output settings optional for preservation', () => {
        const result = audioTranscodeSchema.parse({});

        expect(result).toEqual({});
    });

    it('accepts explicit codec settings for audio normalize', () => {
        const result = audioNormalizeSchema.parse({
            targetFormat: 'ogg',
            codec: 'libopus',
            bitrate: '96k',
            channels: 1,
            sampleRate: 48000
        });

        expect(result).toMatchObject({
            targetFormat: 'ogg',
            codec: 'libopus',
            bitrate: '96k',
            channels: 1,
            sampleRate: 48000
        });
    });

    it('accepts explicit codec settings for video audio extraction', () => {
        const result = videoExtractAudioSchema.parse({
            targetFormat: 'ogg',
            codec: 'libopus',
            bitrate: '96k',
            channels: 1,
            sampleRate: 48000
        });

        expect(result).toMatchObject({
            targetFormat: 'ogg',
            codec: 'libopus',
            bitrate: '96k',
            channels: 1,
            sampleRate: 48000
        });
    });

    it('rejects unsupported Opus sample rates', () => {
        const result = videoExtractAudioSchema.safeParse({
            targetFormat: 'ogg',
            codec: 'libopus',
            sampleRate: 34304
        });

        expect(result.success).toBe(false);
        expect(result.error.issues[0]).toMatchObject({
            path: ['sampleRate']
        });
    });

    it('rejects audio codecs incompatible with target format', () => {
        const result = videoExtractAudioSchema.safeParse({
            targetFormat: 'flac',
            codec: 'libopus',
            sampleRate: 48000
        });

        expect(result.success).toBe(false);
        expect(result.error.issues[0]).toMatchObject({
            path: ['codec']
        });
    });

    it('returns validation details with Zod v4 errors', () => {
        const result = validateSchema(videoExtractAudioSchema, {
            targetFormat: 'ogg',
            codec: 'libopus',
            sampleRate: 34304
        });

        expect(result.error).toMatchObject({
            code: 'VALIDATION_FAILED',
            details: [
                {
                    path: 'sampleRate'
                }
            ]
        });
    });
});
