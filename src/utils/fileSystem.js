import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';

export const ensureTmpDir = async () => {
    await fs.mkdir(env.TMP_DIR, { recursive: true });
};

export const tmpPath = (filename) => path.join(env.TMP_DIR, filename);

export const removeFileIfExists = async (filePath) => {
    if (!filePath) return;

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
};
