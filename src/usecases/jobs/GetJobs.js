import { JobRepositoryImpl } from '../../domain/repositories/JobRepositoryImpl.js';
import { validateSchema } from '../../utils/validateSchema.js';
import { jobListQuerySchema } from '../../adapters/web/validators/jobValidators.js';

export const getJobs = async (query) => {
    const validation = validateSchema(jobListQuerySchema, query);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };
    const { page, limit, ...filters } = validation.data;
    return JobRepositoryImpl.findAll(filters, { page, limit });
};
