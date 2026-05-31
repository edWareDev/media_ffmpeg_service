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

export const OPERATION_DEFINITIONS = [
    {
        type: 'media.extractMetadata',
        category: 'media',
        usesFfmpeg: false,
        outputArtifactType: null,
        acceptsMediaTypes: ['audio', 'video'],
        acceptsArtifactTypes: [],
        description: 'Extrae metadata técnica persistida para media de audio o video.'
    },
    {
        type: 'audio.transcode',
        category: 'audio',
        usesFfmpeg: true,
        outputArtifactType: 'audio_transcoded',
        acceptsMediaTypes: ['audio', 'video'],
        requiresAudioStream: true,
        acceptsArtifactTypes: ['audio_transcoded', 'audio_chunk', 'audio_normalized', 'audio_silence_removed', 'audio_extract'],
        description: 'Convierte audio preservando o ajustando formato, codec y parámetros.'
    },
    {
        type: 'audio.chunk',
        category: 'audio',
        usesFfmpeg: true,
        outputArtifactType: 'audio_chunk',
        acceptsMediaTypes: ['audio', 'video'],
        requiresAudioStream: true,
        acceptsArtifactTypes: ['audio_transcoded', 'audio_chunk', 'audio_normalized', 'audio_silence_removed', 'audio_extract'],
        description: 'Divide una fuente con audio en segmentos.'
    },
    {
        type: 'audio.normalize',
        category: 'audio',
        usesFfmpeg: true,
        outputArtifactType: 'audio_normalized',
        acceptsMediaTypes: ['audio', 'video'],
        requiresAudioStream: true,
        acceptsArtifactTypes: ['audio_transcoded', 'audio_chunk', 'audio_normalized', 'audio_silence_removed', 'audio_extract'],
        description: 'Normaliza loudness de una fuente con audio.'
    },
    {
        type: 'audio.removeSilence',
        category: 'audio',
        usesFfmpeg: true,
        outputArtifactType: 'audio_silence_removed',
        acceptsMediaTypes: ['audio', 'video'],
        requiresAudioStream: true,
        acceptsArtifactTypes: ['audio_transcoded', 'audio_chunk', 'audio_normalized', 'audio_silence_removed', 'audio_extract'],
        description: 'Elimina silencios de una fuente con audio.'
    },
    {
        type: 'video.extractAudio',
        category: 'video',
        usesFfmpeg: true,
        outputArtifactType: 'audio_extract',
        acceptsMediaTypes: ['video'],
        acceptsArtifactTypes: ['video_transcoded', 'video_compressed', 'video_segment'],
        description: 'Extrae la pista de audio desde una fuente de video.'
    },
    {
        type: 'video.transcode',
        category: 'video',
        usesFfmpeg: true,
        outputArtifactType: 'video_transcoded',
        acceptsMediaTypes: ['video'],
        acceptsArtifactTypes: ['video_transcoded', 'video_compressed', 'video_segment'],
        description: 'Convierte video a otro contenedor, codec o resolución.'
    },
    {
        type: 'video.compress',
        category: 'video',
        usesFfmpeg: true,
        outputArtifactType: 'video_compressed',
        acceptsMediaTypes: ['video'],
        acceptsArtifactTypes: ['video_transcoded', 'video_compressed', 'video_segment'],
        description: 'Comprime video ajustando CRF, preset o tamaño.'
    },
    {
        type: 'video.split',
        category: 'video',
        usesFfmpeg: true,
        outputArtifactType: 'video_segment',
        acceptsMediaTypes: ['video'],
        acceptsArtifactTypes: ['video_transcoded', 'video_compressed', 'video_segment'],
        description: 'Divide video en segmentos.'
    },
    {
        type: 'video.extractFrames',
        category: 'video',
        usesFfmpeg: true,
        outputArtifactType: 'frame',
        acceptsMediaTypes: ['video'],
        acceptsArtifactTypes: ['video_transcoded', 'video_compressed', 'video_segment'],
        description: 'Extrae frames desde video.'
    },
    {
        type: 'video.detectScenes',
        category: 'video',
        usesFfmpeg: true,
        outputArtifactType: 'scene_detection',
        acceptsMediaTypes: ['video'],
        acceptsArtifactTypes: ['video_transcoded', 'video_compressed', 'video_segment'],
        description: 'Detecta cambios de escena en video y genera un artefacto JSON.'
    },
    {
        type: 'video.generateThumbnails',
        category: 'video',
        usesFfmpeg: true,
        outputArtifactType: 'thumbnail',
        acceptsMediaTypes: ['video'],
        acceptsArtifactTypes: ['video_transcoded', 'video_compressed', 'video_segment'],
        description: 'Genera miniaturas desde video.'
    }
];

export const JOB_OUTPUT_ARTIFACT_TYPES = Object.fromEntries(
    OPERATION_DEFINITIONS
        .filter((operation) => operation.outputArtifactType)
        .map((operation) => [operation.type, operation.outputArtifactType])
);
