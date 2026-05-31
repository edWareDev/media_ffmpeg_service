import { mediaQueue } from '../../infrastructure/services/jobQueueService.js';
import { JobRepositoryImpl } from '../../domain/repositories/JobRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

export const retryJob = async (jobId) => {
    const job = await JobRepositoryImpl.findById(jobId);
    if (!job) return { error: ERROR_CODES.JOB_NOT_FOUND };

    const queueJob = await mediaQueue.add(job.type, {
        jobId: job.jobId,
        mediaId: job.mediaId,
        sourceType: job.sourceType || 'media',
        sourceId: job.sourceId || job.mediaId,
        type: job.type,
        options: job.options
    });

    return JobRepositoryImpl.updateById(jobId, {
        queueJobId: queueJob.id,
        status: 'queued',
        progress: 0,
        error: undefined,
        failedAt: undefined,
        currentStep: 'queued'
    });
};
