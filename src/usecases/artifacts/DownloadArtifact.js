import { ArtifactRepositoryImpl } from '../../domain/repositories/ArtifactRepositoryImpl.js';
import { storageService } from '../../infrastructure/services/gridFsStorageService.js';
import { ERROR_CODES } from '../../utils/error_codes.js';

export const downloadArtifact = async (artifactId) => {
    const artifact = await ArtifactRepositoryImpl.findById(artifactId);
    if (!artifact) return { error: ERROR_CODES.ARTIFACT_NOT_FOUND };
    return {
        artifact,
        stream: storageService.createReadStream(artifact.storage.fileId)
    };
};
