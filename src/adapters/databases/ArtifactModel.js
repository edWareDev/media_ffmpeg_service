import mongoose from 'mongoose';
import { ARTIFACT_TYPES } from '../../../config/mediaConstants.js';

const artifactSchema = new mongoose.Schema(
    {
        artifactId: { type: String, required: true, unique: true, index: true },
        mediaId: { type: String, required: true, index: true },
        jobId: { type: String, required: true, index: true },
        sourceType: { type: String, enum: ['media', 'artifact'], default: 'media', index: true },
        sourceId: { type: String, index: true },
        parentArtifactId: { type: String, index: true },
        type: { type: String, required: true, enum: ARTIFACT_TYPES, index: true },
        filename: { type: String, required: true },
        mimeType: { type: String, required: true },
        sizeBytes: { type: Number, required: true },
        storage: {
            provider: { type: String, default: 'gridfs' },
            fileId: { type: String, required: true }
        },
        metadata: {
            format: String,
            codec: String,
            durationSeconds: Number,
            width: Number,
            height: Number,
            startSecond: Number,
            endSecond: Number,
            sceneCount: Number
        },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const ArtifactModel = mongoose.model('Artifact', artifactSchema);
