import { ArtifactRepositoryImpl } from '../../domain/repositories/ArtifactRepositoryImpl.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

export const getArtifactChildren = async (artifactId) => {
    const artifact = await ArtifactRepositoryImpl.findById(artifactId);
    if (!artifact) return { error: ERROR_CODES.ARTIFACT_NOT_FOUND };
    const children = await ArtifactRepositoryImpl.findChildrenByArtifactId(artifactId);
    return { items: children, total: children.length };
};
