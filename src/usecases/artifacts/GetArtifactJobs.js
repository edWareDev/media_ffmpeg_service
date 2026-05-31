import { ArtifactRepositoryImpl } from '../../domain/repositories/ArtifactRepositoryImpl.js';
import { JobRepositoryImpl } from '../../domain/repositories/JobRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { jobListQuerySchema } from '../../adapters/web/validators/jobValidators.js';
import { validateSchema } from '../../utils/validateSchema.js';

export const getArtifactJobs = async (artifactId, query) => {
    const artifact = await ArtifactRepositoryImpl.findById(artifactId);
    if (!artifact) return { error: ERROR_CODES.ARTIFACT_NOT_FOUND };

    const validation = validateSchema(jobListQuerySchema, query);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    const { page, limit, ...filters } = validation.data;
    return JobRepositoryImpl.findAll({
        ...filters,
        sourceType: 'artifact',
        sourceId: artifactId
    }, { page, limit });
};
