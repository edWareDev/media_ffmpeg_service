import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { nanoid } from 'nanoid';
import { env } from '../../../config/env.js';
import { tmpPath } from '../../utils/fileSystem.js';

const runProcess = (command, args) => new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stderr = '';
    let stdout = '';

    child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
        if (code === 0) {
            resolve({ stdout, stderr });
            return;
        }

        reject(new Error(stderr || `Process exited with code ${code}`));
    });
});

const outputPath = (extension) => tmpPath(`${nanoid()}.${extension}`);

const extensionFromFormat = (format, fallback) => (format || fallback).replace('.', '');

const encoderByCodec = {
    opus: 'libopus',
    vorbis: 'libvorbis',
    mp3: 'libmp3lame',
    aac: 'aac',
    flac: 'flac',
    pcm_s16le: 'pcm_s16le'
};

const extensionByContainer = {
    ogg: 'ogg',
    wav: 'wav',
    wave: 'wav',
    mp3: 'mp3',
    flac: 'flac',
    mov: 'm4a',
    mp4: 'm4a',
    m4a: 'm4a'
};

const extensionByCodec = {
    opus: 'ogg',
    vorbis: 'ogg',
    mp3: 'mp3',
    aac: 'm4a',
    flac: 'flac',
    pcm_s16le: 'wav'
};

const bitrateFromBps = (value) => {
    if (!value) return undefined;
    const kbps = Math.max(1, Math.round(Number(value) / 1000));
    return Number.isFinite(kbps) ? `${kbps}k` : undefined;
};

const hasExplicitAudioEncoding = (options) => Boolean(
    options.codec ||
    options.bitrate ||
    options.bitrate === null ||
    options.channels ||
    options.sampleRate
);

const resolveAudioOutputSettings = (sourceMetadata, options, fallbackFormat = 'ogg') => {
    const sourceContainer = sourceMetadata.container?.split(',')[0];
    const format = extensionFromFormat(
        options.targetFormat,
        extensionByCodec[sourceMetadata.codec] || extensionByContainer[sourceContainer] || fallbackFormat
    );

    return {
        format,
        codec: options.codec || encoderByCodec[sourceMetadata.codec],
        bitrate: options.bitrate === null ? undefined : options.bitrate || bitrateFromBps(sourceMetadata.bitrate),
        channels: options.channels || sourceMetadata.channels,
        sampleRate: options.sampleRate || sourceMetadata.sampleRate,
        canCopyAudio: !hasExplicitAudioEncoding(options)
    };
};

const appendAudioOutputArgs = (args, outputSettings, { allowCopy = false } = {}) => {
    if (allowCopy && outputSettings.canCopyAudio) {
        args.push('-c:a', 'copy');
        return;
    }

    if (outputSettings.codec) args.push('-c:a', outputSettings.codec);
    if (outputSettings.bitrate) args.push('-b:a', outputSettings.bitrate);
    if (outputSettings.channels) args.push('-ac', String(outputSettings.channels));
    if (outputSettings.sampleRate) args.push('-ar', String(outputSettings.sampleRate));
};

const probeInput = async (inputPath) => {
    const { stdout } = await runProcess(env.FFPROBE_PATH, [
        '-v',
        'error',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        inputPath
    ]);

    const data = JSON.parse(stdout);
    const videoStream = data.streams?.find((stream) => stream.codec_type === 'video');
    const audioStream = data.streams?.find((stream) => stream.codec_type === 'audio');
    const selectedStream = videoStream || audioStream || data.streams?.[0];

    return {
        mediaType: videoStream ? 'video' : audioStream ? 'audio' : 'unknown',
        durationSeconds: Number(data.format?.duration) || undefined,
        codec: selectedStream?.codec_name,
        container: data.format?.format_name,
        width: videoStream?.width,
        height: videoStream?.height,
        channels: audioStream?.channels,
        sampleRate: audioStream?.sample_rate ? Number(audioStream.sample_rate) : undefined,
        bitrate: data.format?.bit_rate ? Number(data.format.bit_rate) : undefined
    };
};

export const ffmpegService = {
    async probe(inputPath) {
        return probeInput(inputPath);
    },

    async transcodeAudio(inputPath, options) {
        const sourceMetadata = await probeInput(inputPath);
        const outputSettings = resolveAudioOutputSettings(sourceMetadata, options);
        const target = outputPath(outputSettings.format);
        const args = ['-y', '-i', inputPath];
        appendAudioOutputArgs(args, outputSettings, { allowCopy: true });
        args.push(target);
        await runProcess(env.FFMPEG_PATH, args);
        return [target];
    },

    async chunkAudio(inputPath, options) {
        const sourceMetadata = await probeInput(inputPath);
        const outputSettings = resolveAudioOutputSettings(sourceMetadata, options);
        const duration = sourceMetadata.durationSeconds;
        const stepSeconds = options.chunkDurationSeconds - options.overlapSeconds;
        const outputPaths = [];

        if (!duration || stepSeconds <= 0) {
            throw new Error('INVALID_CHUNK_OPTIONS');
        }

        for (let startSecond = 0, index = 0; startSecond < duration; startSecond += stepSeconds, index += 1) {
            const target = tmpPath(`${nanoid()}-${String(index).padStart(3, '0')}.${outputSettings.format}`);
            const args = [
                '-y',
                '-ss',
                String(startSecond),
                '-i',
                inputPath,
                '-t',
                String(Math.min(options.chunkDurationSeconds, duration - startSecond))
            ];

            if (!options.preserveTimestamps) args.push('-avoid_negative_ts', 'make_zero');
            appendAudioOutputArgs(args, outputSettings, { allowCopy: true });
            args.push(target);

            await runProcess(env.FFMPEG_PATH, args);
            outputPaths.push({
                path: target,
                metadata: {
                    startSecond,
                    endSecond: Math.min(startSecond + options.chunkDurationSeconds, duration),
                    durationSeconds: Math.min(options.chunkDurationSeconds, duration - startSecond),
                    overlapSeconds: options.overlapSeconds
                }
            });
        }

        return outputPaths;
    },

    async normalizeAudio(inputPath, options) {
        const sourceMetadata = await probeInput(inputPath);
        const outputSettings = resolveAudioOutputSettings(sourceMetadata, options);
        const target = outputPath(outputSettings.format);
        const args = [
            '-y',
            '-i',
            inputPath,
            '-af',
            `loudnorm=I=${options.loudnessTarget}:TP=${options.truePeak}:LRA=${options.lra}`
        ];
        appendAudioOutputArgs(args, outputSettings);
        args.push(target);
        await runProcess(env.FFMPEG_PATH, args);
        return [target];
    },

    async removeSilence(inputPath, options) {
        const sourceMetadata = await probeInput(inputPath);
        const outputSettings = resolveAudioOutputSettings(sourceMetadata, options);
        const target = outputPath(outputSettings.format);
        const startDuration = options.minSilenceDurationMs / 1000;
        const args = [
            '-y',
            '-i',
            inputPath,
            '-af',
            `silenceremove=start_periods=1:start_duration=${startDuration}:start_threshold=${options.silenceThresholdDb}dB:stop_periods=-1:stop_duration=${startDuration}:stop_threshold=${options.silenceThresholdDb}dB`
        ];
        appendAudioOutputArgs(args, outputSettings);
        args.push(target);
        await runProcess(env.FFMPEG_PATH, args);
        return [target];
    },

    async extractAudioFromVideo(inputPath, options) {
        const sourceMetadata = await probeInput(inputPath);
        const outputSettings = resolveAudioOutputSettings(sourceMetadata, options, 'm4a');
        const target = outputPath(outputSettings.format);
        const args = ['-y', '-i', inputPath, '-vn'];
        appendAudioOutputArgs(args, outputSettings, { allowCopy: true });
        args.push(target);
        await runProcess(env.FFMPEG_PATH, args);
        return [target];
    },

    async transcodeVideo(inputPath, options) {
        const container = extensionFromFormat(options.container, 'mp4');
        const target = outputPath(container);
        const args = ['-y', '-i', inputPath, '-c:v', options.videoCodec || 'libx264', '-c:a', options.audioCodec || 'aac'];
        if (options.crf) args.push('-crf', String(options.crf));
        if (options.preset) args.push('-preset', options.preset);
        if (options.fps) args.push('-r', String(options.fps));
        args.push(target);
        await runProcess(env.FFMPEG_PATH, args);
        return [target];
    },

    async compressVideo(inputPath, options) {
        const target = outputPath('mp4');
        const vf = options.maxWidth && options.maxHeight
            ? `scale='min(${options.maxWidth},iw)':-2`
            : 'scale=iw:ih';
        const args = ['-y', '-i', inputPath, '-vf', vf, '-c:v', 'libx264', '-crf', String(options.crf), '-preset', options.preset];
        if (options.audioBitrate) args.push('-b:a', options.audioBitrate);
        args.push(target);
        await runProcess(env.FFMPEG_PATH, args);
        return [target];
    },

    async splitVideo(inputPath, options) {
        const pattern = tmpPath(`${nanoid()}-%03d.mp4`);
        await runProcess(env.FFMPEG_PATH, [
            '-y',
            '-i',
            inputPath,
            '-f',
            'segment',
            '-segment_time',
            String(options.segmentDurationSeconds),
            '-reset_timestamps',
            '1',
            pattern
        ]);
        return fs.readdir(env.TMP_DIR).then((files) => files
            .filter((file) => file.startsWith(pattern.split(/[\\/]/).pop().split('%03d')[0]))
            .map((file) => tmpPath(file)));
    },

    async extractFrames(inputPath, options) {
        const format = extensionFromFormat(options.format, 'png');
        const pattern = tmpPath(`${nanoid()}-%03d.${format}`);
        const args = ['-y', '-i', inputPath];
        if (options.mode === 'interval') args.push('-vf', `fps=1/${options.intervalSeconds}`);
        if (options.mode === 'scene-change') args.push('-vf', `select='gt(scene,${options.sceneThreshold})',scale=${options.width || -1}:-1`);
        if (options.maxFrames) args.push('-frames:v', String(options.maxFrames));
        args.push(pattern);
        await runProcess(env.FFMPEG_PATH, args);
        return fs.readdir(env.TMP_DIR).then((files) => files
            .filter((file) => file.startsWith(pattern.split(/[\\/]/).pop().split('%03d')[0]))
            .map((file) => tmpPath(file)));
    },

    async detectScenes(inputPath, options) {
        const { stderr } = await runProcess(env.FFMPEG_PATH, [
            '-i',
            inputPath,
            '-filter:v',
            `select='gt(scene,${options.sceneThreshold})',showinfo`,
            '-f',
            'null',
            '-'
        ]);
        const scenes = [...stderr.matchAll(/pts_time:([0-9.]+)/g)].map((match, index) => ({
            index,
            startSecond: Number(match[1])
        }));
        const target = outputPath('json');
        await fs.writeFile(target, JSON.stringify({ scenes }, null, 2));
        return [target];
    },

    async generateThumbnails(inputPath, options) {
        const format = extensionFromFormat(options.format, 'webp');
        const pattern = tmpPath(`${nanoid()}-%03d.${format}`);
        await runProcess(env.FFMPEG_PATH, [
            '-y',
            '-i',
            inputPath,
            '-vf',
            `thumbnail,scale=${options.width}:-1`,
            '-frames:v',
            String(options.count),
            pattern
        ]);
        return fs.readdir(env.TMP_DIR).then((files) => files
            .filter((file) => file.startsWith(pattern.split(/[\\/]/).pop().split('%03d')[0]))
            .map((file) => tmpPath(file)));
    }
};
