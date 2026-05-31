import mongoose from 'mongoose';
import { JOB_TYPES } from '../../../config/mediaConstants.js';

const jobSchema = new mongoose.Schema(
    {
        jobId: { type: String, required: true, unique: true, index: true },
        queueJobId: { type: String },
        mediaId: { type: String, required: true, index: true },
        sourceType: { type: String, enum: ['media', 'artifact'], default: 'media', index: true },
        sourceId: { type: String, index: true },
        type: { type: String, required: true, enum: JOB_TYPES, index: true },
        status: {
            type: String,
            enum: ['queued', 'active', 'completed', 'failed', 'cancelled'],
            default: 'queued',
            index: true
        },
        progress: { type: Number, default: 0 },
        currentStep: { type: String },
        options: { type: mongoose.Schema.Types.Mixed, default: {} },
        result: { type: mongoose.Schema.Types.Mixed, default: {} },
        error: {
            message: String,
            code: String
        },
        startedAt: Date,
        completedAt: Date,
        failedAt: Date,
        cancelledAt: Date
    },
    { timestamps: true }
);

export const JobModel = mongoose.model('Job', jobSchema);
