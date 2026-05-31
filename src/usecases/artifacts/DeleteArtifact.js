import { ArtifactRepositoryImpl } from '../../domain/repositories/ArtifactRepositoryImpl.js';
import { storageService } from '../../infrastructure/services/gridFsStorageService.js';
import { deleteArtifactQuerySchema } from '../../adapters/web/validators/mediaValidators.js';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { validateSchema } from '../../utils/validateSchema.js';

const collectArtifactTree = async (rootArtifact) => {
    const artifacts = [];
    const visited = new Set();

    const visit = async (artifact) => {
        if (visited.has(artifact.artifactId)) return;

        visited.add(artifact.artifactId);
        artifacts.push(artifact);

        const children = await ArtifactRepositoryImpl.findChildrenByArtifactId(artifact.artifactId);
        await Promise.all(children.map((child) => visit(child)));
    };

    await visit(rootArtifact);
    return artifacts;
};

export const deleteArtifact = async (artifactId, query) => {
    const validation = validateSchema(deleteArtifactQuerySchema, query);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    const artifact = await ArtifactRepositoryImpl.findById(artifactId);
    if (!artifact) return { error: ERROR_CODES.ARTIFACT_NOT_FOUND };

    const directChildren = await ArtifactRepositoryImpl.findChildrenByArtifactId(artifactId);
    if (directChildren.length > 0 && !validation.data.includeChildren) {
        return {
            error: ERROR_CODES.ARTIFACT_HAS_CHILDREN,
            childCount: directChildren.length
        };
    }

    const artifactsToDelete = validation.data.includeChildren
        ? await collectArtifactTree(artifact)
        : [artifact];
    const artifactIds = artifactsToDelete.map((item) => item.artifactId);

    await Promise.all(artifactsToDelete.map((item) => storageService.deleteFile(item.storage.fileId)));
    await ArtifactRepositoryImpl.softDeleteManyByIds(artifactIds);

    return {
        artifactId,
        deleted: true,
        childrenDeleted: artifactsToDelete.length - 1,
        artifactIdsDeleted: artifactIds
    };
};
