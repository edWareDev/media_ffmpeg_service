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

describe('media validators', () => {
    it('accepts artifact list query filters', () => {
        const result = artifactListQuerySchema.parse({
            type: 'thumbnail',
            page: '2',
            limit: '10'
        });

        expect(result).toMatchObject({
            type: 'thumbnail',
            page: 2,
            limit: 10
        });
    });

    it('validates job options using the operation-specific schema', () => {
        const result = createJobSchema.parse({
            type: 'audio.chunk',
            sourceType: 'media',
            sourceId: 'med_123',
            options: {
                chunkDurationSeconds: 300
            }
        });

        expect(result.options).toMatchObject({
            chunkDurationSeconds: 300,
            overlapSeconds: 0,
            preserveTimestamps: false
        });
    });

    it('rejects invalid job options for the operation type', () => {
        expect(() => createJobSchema.parse({
            type: 'audio.chunk',
            sourceType: 'media',
            sourceId: 'med_123',
            options: {
                chunkDurationSeconds: 1
            }
        })).toThrow();
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
});
