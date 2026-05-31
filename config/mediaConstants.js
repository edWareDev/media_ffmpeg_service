export const ARTIFACT_TYPES = [
    'audio_transcoded',
    'audio_chunk',
    'audio_normalized',
    'audio_silence_removed',
    'audio_extract',
    'video_transcoded',
    'video_compressed',
    'video_segment',
    'frame',
    'thumbnail',
    'scene_detection'
];

export const JOB_TYPES = [
    'media.extractMetadata',
    'audio.transcode',
    'audio.chunk',
    'audio.normalize',
    'audio.removeSilence',
    'video.extractAudio',
    'video.transcode',
    'video.compress',
    'video.split',
    'video.extractFrames',
    'video.detectScenes',
    'video.generateThumbnails'
];

export const MEDIA_TYPES = ['audio', 'video', 'unknown'];
