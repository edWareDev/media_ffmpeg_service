import { z } from 'zod';

const audioFormats = ['flac', 'wav', 'mp3', 'ogg', 'm4a'];
const audioCodecs = ['flac', 'pcm_s16le', 'libmp3lame', 'mp3', 'libopus', 'opus', 'libvorbis', 'vorbis', 'aac'];
const opusCodecs = new Set(['libopus', 'opus']);
const opusSampleRates = new Set([48000, 24000, 16000, 12000, 8000]);
const codecsByFormat = {
    flac: new Set(['flac']),
    wav: new Set(['pcm_s16le']),
    mp3: new Set(['libmp3lame', 'mp3']),
    ogg: new Set(['libopus', 'opus', 'libvorbis', 'vorbis']),
    m4a: new Set(['aac'])
};

const withAudioOutputRules = (schema) => schema.superRefine((data, ctx) => {
    const effectiveCodec = data.codec || (data.targetFormat === 'ogg' ? 'libopus' : undefined);

    if (data.targetFormat && data.codec && !codecsByFormat[data.targetFormat].has(data.codec)) {
        ctx.addIssue({
            code: 'custom',
            path: ['codec'],
            message: `El codec ${data.codec} no es compatible con el formato ${data.targetFormat}.`
        });
    }

    if (effectiveCodec && opusCodecs.has(effectiveCodec) && data.sampleRate && !opusSampleRates.has(data.sampleRate)) {
        ctx.addIssue({
            code: 'custom',
            path: ['sampleRate'],
            message: 'El codec Opus solo soporta sampleRate 48000, 24000, 16000, 12000 u 8000.'
        });
    }
});

export const audioOutputOptionsSchema = withAudioOutputRules(z.object({
    targetFormat: z.enum(audioFormats).optional(),
    codec: z.enum(audioCodecs).optional(),
    channels: z.number().int().min(1).max(8).optional(),
    sampleRate: z.number().int().min(8000).max(192000).optional(),
    bitrate: z.string().nullable().optional()
}));

export const audioTranscodeSchema = audioOutputOptionsSchema;

export const audioChunkSchema = withAudioOutputRules(z.object({
    chunkDurationSeconds: z.number().int().min(30).max(1800).default(300),
    overlapSeconds: z.number().int().min(0).max(10).default(0),
    targetFormat: z.enum(audioFormats).optional(),
    preserveTimestamps: z.boolean().default(false),
    codec: z.enum(audioCodecs).optional(),
    bitrate: z.string().nullable().optional(),
    channels: z.number().int().min(1).max(8).optional(),
    sampleRate: z.number().int().min(8000).max(192000).optional()
}));

export const audioNormalizeSchema = withAudioOutputRules(z.object({
    loudnessTarget: z.number().min(-40).max(-5).default(-16),
    truePeak: z.number().min(-9).max(0).default(-1.5),
    lra: z.number().min(1).max(20).default(11),
    targetFormat: z.enum(audioFormats).optional(),
    codec: z.enum(audioCodecs).optional(),
    bitrate: z.string().nullable().optional(),
    channels: z.number().int().min(1).max(8).optional(),
    sampleRate: z.number().int().min(8000).max(192000).optional()
}));

export const audioRemoveSilenceSchema = withAudioOutputRules(z.object({
    minSilenceDurationMs: z.number().int().min(100).max(10000).default(700),
    silenceThresholdDb: z.number().min(-90).max(-10).default(-40),
    targetFormat: z.enum(audioFormats).optional(),
    codec: z.enum(audioCodecs).optional(),
    bitrate: z.string().nullable().optional(),
    channels: z.number().int().min(1).max(8).optional(),
    sampleRate: z.number().int().min(8000).max(192000).optional()
}));
