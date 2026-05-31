import { JobRepositoryImpl } from '../../domain/repositories/JobRepositoryImpl.js';
import { ArtifactRepositoryImpl } from '../../domain/repositories/ArtifactRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

export const getJobById = async (jobId) => {
    const job = await JobRepositoryImpl.findById(jobId);
    if (!job) return { error: ERROR_CODES.JOB_NOT_FOUND };
    const artifacts = await ArtifactRepositoryImpl.findByJobId(jobId);
    return { ...job, artifacts };
};
