import { z } from 'zod';

export const videoExtractAudioSchema = z.object({
    targetFormat: z.enum(['flac', 'wav', 'mp3', 'ogg', 'm4a']).optional(),
    codec: z.string().optional(),
    bitrate: z.string().nullable().optional(),
    channels: z.number().int().min(1).max(8).optional(),
    sampleRate: z.number().int().min(8000).max(192000).optional()
});

export const videoTranscodeSchema = z.object({
    container: z.enum(['mp4', 'webm', 'mkv', 'mov']).default('mp4'),
    videoCodec: z.string().default('libx264'),
    audioCodec: z.string().default('aac'),
    resolution: z.string().optional(),
    fps: z.number().int().min(1).max(120).optional(),
    crf: z.number().int().min(0).max(51).default(23),
    preset: z.enum(['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow']).default('medium')
});

export const videoCompressSchema = z.object({
    crf: z.number().int().min(0).max(51).default(23),
    preset: z.enum(['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow']).default('medium'),
    maxWidth: z.number().int().min(120).max(7680).optional(),
    maxHeight: z.number().int().min(120).max(4320).optional(),
    audioBitrate: z.string().optional()
});

export const videoSplitSchema = z.object({
    segmentDurationSeconds: z.number().int().min(30).max(7200).default(600),
    overlapSeconds: z.number().int().min(0).max(30).default(0),
    preserveKeyframes: z.boolean().default(true)
});

export const videoExtractFramesSchema = z.object({
    mode: z.enum(['interval', 'scene-change', 'keyframes', 'hybrid']).default('scene-change'),
    sceneThreshold: z.number().min(0).max(1).default(0.3),
    intervalSeconds: z.number().int().min(1).max(3600).default(30),
    maxFrames: z.number().int().min(1).max(500).default(30),
    format: z.enum(['png', 'jpeg', 'jpg', 'webp']).default('png'),
    width: z.number().int().min(64).max(7680).optional()
});

export const videoDetectScenesSchema = z.object({
    sceneThreshold: z.number().min(0).max(1).default(0.3),
    minSceneDurationSeconds: z.number().min(0).max(60).default(2)
});

export const videoGenerateThumbnailsSchema = z.object({
    count: z.number().int().min(1).max(50).default(5),
    width: z.number().int().min(64).max(1920).default(320),
    format: z.enum(['webp', 'png', 'jpeg', 'jpg']).default('webp')
});
