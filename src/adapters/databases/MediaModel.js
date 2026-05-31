import mongoose from 'mongoose';
import { MEDIA_TYPES } from '../../../config/mediaConstants.js';

const mediaSchema = new mongoose.Schema(
    {
        mediaId: { type: String, required: true, unique: true, index: true },
        originalName: { type: String, required: true },
        filename: { type: String, required: true },
        mimeType: { type: String, required: true },
        sizeBytes: { type: Number, required: true },
        mediaType: { type: String, enum: MEDIA_TYPES, default: 'unknown', index: true },
        source: { type: String },
        purpose: { type: String },
        storage: {
            provider: { type: String, default: 'gridfs' },
            fileId: { type: String, required: true }
        },
        metadata: {
            durationSeconds: Number,
            codec: String,
            container: String,
            width: Number,
            height: Number,
            channels: Number,
            sampleRate: Number,
            bitrate: Number
        },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const MediaModel = mongoose.model('Media', mediaSchema);
