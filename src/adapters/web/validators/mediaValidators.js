import { z } from 'zod';
import { ARTIFACT_TYPES } from '../../../../config/mediaConstants.js';
import { booleanQuery, paginationSchema } from './commonValidators.js';

export const uploadMediaSchema = z.object({
    source: z.string().trim().min(1).optional(),
    purpose: z.string().trim().min(1).optional()
});

export const mediaListQuerySchema = paginationSchema.extend({
    mediaType: z.enum(['audio', 'video', 'unknown']).optional(),
    source: z.string().trim().min(1).optional(),
    purpose: z.string().trim().min(1).optional()
});

export const mediaValidationSchema = z.object({
    rules: z.object({
        allowedTypes: z.array(z.enum(['audio', 'video'])).optional(),
        maxSizeMb: z.number().positive().optional(),
        maxDurationSeconds: z.number().positive().optional(),
        requireAudio: z.boolean().optional(),
        maxResolution: z.string().regex(/^\d+x\d+$/).optional(),
        allowedContainers: z.array(z.string()).optional(),
        allowedVideoCodecs: z.array(z.string()).optional(),
        allowedAudioCodecs: z.array(z.string()).optional()
    }).default({})
});

export const artifactListQuerySchema = paginationSchema.extend({
    type: z.enum(ARTIFACT_TYPES).optional(),
    mediaId: z.string().min(1).optional(),
    jobId: z.string().min(1).optional(),
    sourceType: z.enum(['media', 'artifact']).optional(),
    sourceId: z.string().min(1).optional(),
    parentArtifactId: z.string().min(1).optional()
});

export const deleteMediaQuerySchema = z.object({
    includeArtifacts: booleanQuery.default(false)
});

export const deleteArtifactQuerySchema = z.object({
    includeChildren: booleanQuery.default(false)
});

export const extractMetadataSchema = z.object({}).default({});
