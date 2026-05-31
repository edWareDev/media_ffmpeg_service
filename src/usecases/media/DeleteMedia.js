import { MediaRepositoryImpl } from '../../domain/repositories/MediaRepositoryImpl.js';
import { ArtifactRepositoryImpl } from '../../domain/repositories/ArtifactRepositoryImpl.js';
import { storageService } from '../../infrastructure/services/gridFsStorageService.js';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { validateSchema } from '../../utils/validateSchema.js';
import { deleteMediaQuerySchema } from '../../adapters/web/validators/mediaValidators.js';

export const deleteMedia = async (mediaId, query) => {
    const validation = validateSchema(deleteMediaQuerySchema, query);
    if (validation.error) return { error: validation.error.code, details: validation.error.details };

    const media = await MediaRepositoryImpl.findById(mediaId);
    if (!media) return { error: ERROR_CODES.MEDIA_NOT_FOUND };

    const artifacts = await ArtifactRepositoryImpl.findAllByMediaId(mediaId);
    if (artifacts.length > 0 && !validation.data.includeArtifacts) {
        return {
            error: ERROR_CODES.MEDIA_HAS_ARTIFACTS,
            artifactCount: artifacts.length
        };
    }

    if (validation.data.includeArtifacts) {
        await Promise.all(artifacts.map((artifact) => storageService.deleteFile(artifact.storage.fileId)));
        await ArtifactRepositoryImpl.softDeleteByMediaId(mediaId);
    }

    await storageService.deleteFile(media.storage.fileId);
    await MediaRepositoryImpl.softDelete(mediaId);

    return {
        mediaId,
        deleted: true,
        artifactsDeleted: validation.data.includeArtifacts,
        artifactCountDeleted: validation.data.includeArtifacts ? artifacts.length : 0
    };
};
