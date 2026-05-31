import { z } from 'zod';
import { JOB_TYPES } from '../../../../config/mediaConstants.js';
import { paginationSchema } from './commonValidators.js';

export const createJobSchema = z.object({
    type: z.enum(JOB_TYPES),
    mediaId: z.string().min(1).optional(),
    sourceType: z.enum(['media', 'artifact']).default('media'),
    sourceId: z.string().min(1).optional(),
    artifactId: z.string().min(1).optional(),
    options: z.record(z.unknown()).default({})
}).superRefine((data, context) => {
    if (data.sourceType === 'media' && !data.mediaId && !data.sourceId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['mediaId'],
            message: 'mediaId is required when sourceType is media.'
        });
    }

    if (data.sourceType === 'artifact' && !data.sourceId && !data.artifactId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sourceId'],
            message: 'sourceId or artifactId is required when sourceType is artifact.'
        });
    }
}).transform((data) => ({
    ...data,
    sourceId: data.sourceType === 'artifact'
        ? data.sourceId || data.artifactId
        : data.sourceId || data.mediaId,
    mediaId: data.sourceType === 'media' ? data.mediaId || data.sourceId : data.mediaId
}));

export const jobListQuerySchema = paginationSchema.extend({
    status: z.enum(['queued', 'active', 'completed', 'failed', 'cancelled']).optional(),
    type: z.enum(JOB_TYPES).optional(),
    mediaId: z.string().min(1).optional(),
    sourceType: z.enum(['media', 'artifact']).optional(),
    sourceId: z.string().min(1).optional()
});
