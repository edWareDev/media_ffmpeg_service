# Formatos multimedia soportados

Este servicio almacena archivos originales y artefactos de forma permanente. Los procesos que usan FFmpeg son asíncronos y generan `Job`; si producen salida, también generan uno o más `Artifact`.

Todas las rutas públicas están bajo `/api/v2`.

## Entrada de archivos

`POST /api/v2/media` acepta archivos multimedia por `multipart/form-data`.

Tipos de media reconocidos por MIME:

| Tipo | MIME esperado |
|---|---|
| Audio | `audio/*` |
| Video | `video/*` |
| Desconocido | Cualquier otro MIME |

La metadata persistida puede consultarse con:

```txt
GET /api/v2/media/:mediaId/metadata
```

Para extraer o refrescar metadata con FFprobe, crear un job:

```json
{
  "type": "media.extractMetadata",
  "sourceType": "media",
  "sourceId": "med_..."
}
```

## Operaciones

Las operaciones disponibles se consultan con:

```txt
GET /api/v2/operations
GET /api/v2/operations/:type
```

Tipos de job soportados:

```txt
media.extractMetadata
audio.transcode
audio.chunk
audio.normalize
audio.removeSilence
video.extractAudio
video.transcode
video.compress
video.split
video.extractFrames
video.detectScenes
video.generateThumbnails
```

## Creación de jobs

Todo procesamiento se crea con:

```txt
POST /api/v2/jobs
```

Fuente media:

```json
{
  "type": "video.extractFrames",
  "sourceType": "media",
  "sourceId": "med_...",
  "options": {
    "mode": "scene-change",
    "maxFrames": 30,
    "format": "png",
    "width": 1280
  }
}
```

Fuente artifact:

```json
{
  "type": "audio.chunk",
  "sourceType": "artifact",
  "sourceId": "art_...",
  "options": {
    "chunkDurationSeconds": 300,
    "targetFormat": "flac"
  }
}
```

Los artefactos generados desde otro artefacto siguen relacionados al `mediaId` original y registran:

| Campo | Descripción |
|---|---|
| `sourceType` | `media` o `artifact` |
| `sourceId` | ID de la fuente usada por el job |
| `parentArtifactId` | ID del artefacto padre cuando la fuente fue otro artefacto |

## Reglas de compatibilidad

| Operación | Fuentes permitidas |
|---|---|
| `media.extractMetadata` | media `audio`, media `video` |
| `audio.*` | media `audio`, media `video` con audio, artefactos de audio |
| `video.*` | media `video`, artefactos de video procesable |

Reglas por artefacto:

| Tipo de artifact | Regla |
|---|---|
| `audio_chunk` | Puede usarse en operaciones `audio.*` |
| `thumbnail` | No puede usarse en `audio.*` ni `video.*` |
| `scene_detection` | No debe pasar por FFmpeg |
| `video_segment` | Puede usarse en operaciones `video.*` |

## Perfiles recomendados

### Audio para transcripción o análisis de voz

Perfil recomendado de alta calidad:

| Campo | Valor recomendado |
|---|---|
| Formato | `flac` |
| Codec | `flac` |
| Canales | `1` mono |
| Sample rate | `16000` Hz para voz general |
| Bitrate | Lossless, no fijar bitrate |

Payload de referencia:

```json
{
  "type": "audio.transcode",
  "sourceType": "media",
  "sourceId": "med_...",
  "options": {
    "targetFormat": "flac",
    "codec": "flac",
    "channels": 1,
    "sampleRate": 16000,
    "bitrate": null
  }
}
```

### Chunks de audio

```json
{
  "type": "audio.chunk",
  "sourceType": "media",
  "sourceId": "med_...",
  "options": {
    "chunkDurationSeconds": 600,
    "overlapSeconds": 5,
    "targetFormat": "ogg",
    "codec": "libopus",
    "bitrate": "96k",
    "channels": 1,
    "sampleRate": 48000
  }
}
```

### Frames para modelos de visión

```json
{
  "type": "video.extractFrames",
  "sourceType": "media",
  "sourceId": "med_...",
  "options": {
    "mode": "scene-change",
    "sceneThreshold": 0.3,
    "maxFrames": 30,
    "format": "png",
    "width": 1280
  }
}
```

### Video compacto

```json
{
  "type": "video.compress",
  "sourceType": "media",
  "sourceId": "med_...",
  "options": {
    "crf": 26,
    "preset": "medium",
    "maxWidth": 1280,
    "maxHeight": 720,
    "audioBitrate": "96k"
  }
}
```

## Tipos de artefacto

```txt
audio_transcoded
audio_chunk
audio_normalized
audio_silence_removed
audio_extract
video_transcoded
video_compressed
video_segment
frame
thumbnail
scene_detection
```

## Consulta y eliminación

```txt
GET /api/v2/media/:mediaId/artifacts
GET /api/v2/media/:mediaId/jobs
GET /api/v2/artifacts
GET /api/v2/artifacts/:artifactId
GET /api/v2/artifacts/:artifactId/children
GET /api/v2/artifacts/:artifactId/jobs
```

El almacenamiento es permanente hasta que se elimina explícitamente:

```txt
DELETE /api/v2/media/:mediaId
DELETE /api/v2/media/:mediaId?includeArtifacts=true
DELETE /api/v2/artifacts/:artifactId
DELETE /api/v2/artifacts/:artifactId?includeChildren=true
```

## Validación de media

```txt
POST /api/v2/media/:mediaId/validations
```

Reglas soportadas:

| Campo | Descripción |
|---|---|
| `allowedTypes` | `audio`, `video` |
| `maxSizeMb` | Tamaño máximo en MB |
| `maxDurationSeconds` | Duración máxima |
| `requireAudio` | Indica si debe tener audio |
| `maxResolution` | Formato `WIDTHxHEIGHT`, por ejemplo `1920x1080` |
| `allowedContainers` | Lista de contenedores permitidos |
| `allowedVideoCodecs` | Lista de codecs de video permitidos |
| `allowedAudioCodecs` | Lista de codecs de audio permitidos |

La validación usa la metadata persistida en `Media.metadata`.
