import { nanoid } from 'nanoid';
import { ArtifactModel } from '../../adapters/databases/ArtifactModel.js';

export const ArtifactRepositoryImpl = {
    async create(data) {
        const artifact = await ArtifactModel.create({
            artifactId: data.artifactId || `art_${nanoid(16)}`,
            ...data
        });
        return artifact.toObject();
    },

    async findById(artifactId) {
        return ArtifactModel.findOne({ artifactId, deletedAt: null }).lean();
    },

    async findByMediaId(mediaId, filters = {}, pagination = {}) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const query = { mediaId, deletedAt: null };
        if (filters.type) query.type = filters.type;

        const [items, total] = await Promise.all([
            ArtifactModel.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ArtifactModel.countDocuments(query)
        ]);

        return { items, total, page, limit };
    },

    async findAllByMediaId(mediaId, filters = {}) {
        const query = { mediaId, deletedAt: null };
        if (filters.type) query.type = filters.type;

        return ArtifactModel.find(query).sort({ createdAt: -1 }).lean();
    },

    async findByJobId(jobId) {
        return ArtifactModel.find({ jobId, deletedAt: null }).sort({ createdAt: -1 }).lean();
    },

    async findChildrenByArtifactId(artifactId) {
        return ArtifactModel.find({
            deletedAt: null,
            $or: [
                { parentArtifactId: artifactId },
                { sourceType: 'artifact', sourceId: artifactId }
            ]
        }).sort({ createdAt: -1 }).lean();
    },

    async softDelete(artifactId) {
        return ArtifactModel.findOneAndUpdate(
            { artifactId, deletedAt: null },
            { $set: { deletedAt: new Date() } },
            { new: true }
        ).lean();
    },

    async softDeleteByMediaId(mediaId) {
        return ArtifactModel.updateMany(
            { mediaId, deletedAt: null },
            { $set: { deletedAt: new Date() } }
        );
    },

    async softDeleteManyByIds(artifactIds) {
        return ArtifactModel.updateMany(
            { artifactId: { $in: artifactIds }, deletedAt: null },
            { $set: { deletedAt: new Date() } }
        );
    }
};
