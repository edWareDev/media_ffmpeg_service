import { nanoid } from 'nanoid';
import { JobModel } from '../../adapters/databases/JobModel.js';

export const JobRepositoryImpl = {
    async create(data) {
        const job = await JobModel.create({
            jobId: data.jobId || `job_${nanoid(16)}`,
            ...data
        });
        return job.toObject();
    },

    async findById(jobId) {
        return JobModel.findOne({ jobId }).lean();
    },

    async findAll(filters = {}, pagination = {}) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const query = {};
        if (filters.status) query.status = filters.status;
        if (filters.type) query.type = filters.type;
        if (filters.mediaId) query.mediaId = filters.mediaId;
        if (filters.sourceType) query.sourceType = filters.sourceType;
        if (filters.sourceId) query.sourceId = filters.sourceId;

        const [items, total] = await Promise.all([
            JobModel.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            JobModel.countDocuments(query)
        ]);

        return { items, total, page, limit };
    },

    async updateById(jobId, data) {
        return JobModel.findOneAndUpdate({ jobId }, { $set: data }, { returnDocument: true }).lean();
    }
};
