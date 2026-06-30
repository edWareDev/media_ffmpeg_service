import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import path from 'node:path';

const numberFromEnv = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_PORT: numberFromEnv(process.env.API_PORT, 3000),
    MONGODB_CNX_STR: process.env.MONGODB_CNX_STR || 'mongodb://localhost:27017/media_ffmpeg_service',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: numberFromEnv(process.env.REDIS_PORT, 6379),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
    MAX_UPLOAD_MB: numberFromEnv(process.env.MAX_UPLOAD_MB, 1024),
    TMP_DIR: path.resolve(process.env.TMP_DIR || 'tmp'),
    PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || `http://localhost:${numberFromEnv(process.env.API_PORT, 3000)}`,
    FFMPEG_PATH: process.env.FFMPEG_PATH || ffmpegPath,
    FFPROBE_PATH: process.env.FFPROBE_PATH || ffprobeStatic.path
};
