import { ArtifactRepositoryImpl } from '../../domain/repositories/ArtifactRepositoryImpl.js';
import { artifactListQuerySchema } from '../../adapters/web/validators/mediaValidators.js';
import { validateSchema } from '../../utils/validateSchema.js';

export const getArtifacts = async (query) => {
    const validation = validateSchema(artifactListQuerySchema, query);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    const { page, limit, ...filters } = validation.data;
    return ArtifactRepositoryImpl.findAll(filters, { page, limit });
};
