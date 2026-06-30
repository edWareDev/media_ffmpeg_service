import { nanoid } from 'nanoid';
import { MediaModel } from '../../adapters/databases/MediaModel.js';

export const MediaRepositoryImpl = {
    async create(data) {
        const media = await MediaModel.create({
            mediaId: data.mediaId || `med_${nanoid(16)}`,
            ...data
        });
        return media.toObject();
    },

    async findById(mediaId) {
        return MediaModel.findOne({ mediaId, deletedAt: null }).lean();
    },

    async findAll(filters = {}, pagination = {}) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const query = { deletedAt: null };
        if (filters.mediaType) query.mediaType = filters.mediaType;
        if (filters.source) query.source = filters.source;
        if (filters.purpose) query.purpose = filters.purpose;

        const [items, total] = await Promise.all([
            MediaModel.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            MediaModel.countDocuments(query)
        ]);

        return { items, total, page, limit };
    },

    async updateById(mediaId, data) {
        return MediaModel.findOneAndUpdate(
            { mediaId, deletedAt: null },
            { $set: data },
            { returnDocument: true }
        ).lean();
    },

    async softDelete(mediaId) {
        return MediaModel.findOneAndUpdate(
            { mediaId, deletedAt: null },
            { $set: { deletedAt: new Date() } },
            { returnDocument: true }
        ).lean();
    }
};
