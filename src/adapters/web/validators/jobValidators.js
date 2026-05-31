import { z } from 'zod';
import { JOB_TYPES } from '../../../../config/mediaConstants.js';
import { paginationSchema } from './commonValidators.js';
import {
    audioChunkSchema,
    audioNormalizeSchema,
    audioRemoveSilenceSchema,
    audioTranscodeSchema
} from './audioValidators.js';
import {
    videoCompressSchema,
    videoDetectScenesSchema,
    videoExtractAudioSchema,
    videoExtractFramesSchema,
    videoGenerateThumbnailsSchema,
    videoSplitSchema,
    videoTranscodeSchema
} from './videoValidators.js';

const optionsSchemaByType = {
    'media.extractMetadata': z.object({}).default({}),
    'audio.transcode': audioTranscodeSchema,
    'audio.chunk': audioChunkSchema,
    'audio.normalize': audioNormalizeSchema,
    'audio.removeSilence': audioRemoveSilenceSchema,
    'video.extractAudio': videoExtractAudioSchema,
    'video.transcode': videoTranscodeSchema,
    'video.compress': videoCompressSchema,
    'video.split': videoSplitSchema,
    'video.extractFrames': videoExtractFramesSchema,
    'video.detectScenes': videoDetectScenesSchema,
    'video.generateThumbnails': videoGenerateThumbnailsSchema
};

const parseJobOptions = (type, options) => optionsSchemaByType[type].parse(options);

export const createJobSchema = z.object({
    type: z.enum(JOB_TYPES),
    sourceType: z.enum(['media', 'artifact']).default('media'),
    sourceId: z.string().min(1).optional(),
    options: z.record(z.unknown()).default({})
}).superRefine((data, context) => {
    if (!data.sourceId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sourceId'],
            message: 'sourceId is required.'
        });
    }

    const optionsValidation = optionsSchemaByType[data.type].safeParse(data.options);
    if (!optionsValidation.success) {
        for (const issue of optionsValidation.error.issues) {
            context.addIssue({
                ...issue,
                path: ['options', ...issue.path]
            });
        }
    }
}).transform((data) => ({
    ...data,
    options: parseJobOptions(data.type, data.options)
}));

export const jobListQuerySchema = paginationSchema.extend({
    status: z.enum(['queued', 'active', 'completed', 'failed', 'cancelled']).optional(),
    type: z.enum(JOB_TYPES).optional(),
    mediaId: z.string().min(1).optional(),
    sourceType: z.enum(['media', 'artifact']).optional(),
    sourceId: z.string().min(1).optional()
});
