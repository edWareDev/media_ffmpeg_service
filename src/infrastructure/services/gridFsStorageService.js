import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { nanoid } from 'nanoid';
import mime from 'mime-types';
import { ERROR_CODES } from '../../utils/error_codes.js';
import { tmpPath } from '../../utils/fileSystem.js';

const getBucket = () => new GridFSBucket(mongoose.connection.db, { bucketName: 'media_files' });

export const storageService = {
    async uploadLocalFile(localPath, metadata = {}) {
        try {
            const bucket = getBucket();
            const filename = metadata.filename || `${nanoid()}-${metadata.originalName || 'media'}`;
            const contentType = metadata.mimeType || mime.lookup(filename) || 'application/octet-stream';
            const uploadStream = bucket.openUploadStream(filename, {
                contentType,
                metadata
            });

            await pipeline(fs.createReadStream(localPath), uploadStream);
            const stats = await fs.promises.stat(localPath);

            return {
                fileId: uploadStream.id.toString(),
                filename,
                mimeType: contentType,
                sizeBytes: stats.size
            };
        } catch {
            return { error: ERROR_CODES.STORAGE_WRITE_FAILED };
        }
    },

    async downloadToLocalFile(fileId, filename) {
        try {
            const bucket = getBucket();
            const destination = tmpPath(`${nanoid()}-${filename}`);
            await pipeline(
                bucket.openDownloadStream(new ObjectId(fileId)),
                fs.createWriteStream(destination)
            );
            return { path: destination };
        } catch {
            return { error: ERROR_CODES.STORAGE_READ_FAILED };
        }
    },

    createReadStream(fileId) {
        const bucket = getBucket();
        return bucket.openDownloadStream(new ObjectId(fileId));
    },

    async deleteFile(fileId) {
        try {
            const bucket = getBucket();
            await bucket.delete(new ObjectId(fileId));
            return { deleted: true };
        } catch {
            return { deleted: false };
        }
    }
};
