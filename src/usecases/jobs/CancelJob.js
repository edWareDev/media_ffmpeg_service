import { mediaQueue } from '../../infrastructure/services/jobQueueService.js';
import { JobRepositoryImpl } from '../../domain/repositories/JobRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

export const cancelJob = async (jobId) => {
    const job = await JobRepositoryImpl.findById(jobId);
    if (!job) return { error: ERROR_CODES.JOB_NOT_FOUND };
    if (!['queued', 'active'].includes(job.status)) return { error: ERROR_CODES.INVALID_JOB_STATE };
    if (job.queueJobId) {
        const queueJob = await mediaQueue.getJob(job.queueJobId);
        if (queueJob) await queueJob.remove();
    }
    return JobRepositoryImpl.updateById(jobId, {
        status: 'cancelled',
        cancelledAt: new Date(),
        currentStep: 'cancelled'
    });
};
