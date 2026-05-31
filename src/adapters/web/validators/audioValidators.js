import { z } from 'zod';

export const audioTranscodeSchema = z.object({
    targetFormat: z.enum(['flac', 'wav', 'mp3', 'ogg', 'm4a']).optional(),
    codec: z.string().optional(),
    channels: z.number().int().min(1).max(8).optional(),
    sampleRate: z.number().int().min(8000).max(192000).optional(),
    bitrate: z.string().nullable().optional()
});

export const audioChunkSchema = z.object({
    chunkDurationSeconds: z.number().int().min(30).max(1800).default(300),
    overlapSeconds: z.number().int().min(0).max(10).default(0),
    targetFormat: z.enum(['flac', 'mp3', 'wav', 'ogg', 'm4a']).optional(),
    preserveTimestamps: z.boolean().default(false),
    codec: z.string().optional(),
    bitrate: z.string().nullable().optional(),
    channels: z.number().int().min(1).max(8).optional(),
    sampleRate: z.number().int().min(8000).max(192000).optional()
});

export const audioNormalizeSchema = z.object({
    loudnessTarget: z.number().min(-40).max(-5).default(-16),
    truePeak: z.number().min(-9).max(0).default(-1.5),
    lra: z.number().min(1).max(20).default(11),
    targetFormat: z.enum(['flac', 'wav', 'mp3', 'ogg', 'm4a']).optional(),
    codec: z.string().optional(),
    bitrate: z.string().nullable().optional(),
    channels: z.number().int().min(1).max(8).optional(),
    sampleRate: z.number().int().min(8000).max(192000).optional()
});

export const audioRemoveSilenceSchema = z.object({
    minSilenceDurationMs: z.number().int().min(100).max(10000).default(700),
    silenceThresholdDb: z.number().min(-90).max(-10).default(-40),
    targetFormat: z.enum(['flac', 'wav', 'mp3', 'ogg', 'm4a']).optional(),
    codec: z.string().optional(),
    bitrate: z.string().nullable().optional(),
    channels: z.number().int().min(1).max(8).optional(),
    sampleRate: z.number().int().min(8000).max(192000).optional()
});
