# Formatos multimedia soportados

Este servicio almacena archivos originales y artefactos de forma permanente. Los procesos que usan FFmpeg son asíncronos y generan `Job`; si producen salida, también generan uno o más `Artifact`.

## Entrada de archivos

`POST /api/v1/media/upload` acepta archivos multimedia por `multipart/form-data`.

Tipos de media reconocidos por MIME:

| Tipo | MIME esperado |
|---|---|
| Audio | `audio/*` |
| Video | `video/*` |
| Desconocido | Cualquier otro MIME |

La validación técnica del contenido real depende de metadata extraída con:

```txt
POST /api/v1/media/:mediaId/metadata/extract
```

Luego puede consultarse con:

```txt
GET /api/v1/media/:mediaId/metadata
```

## Perfiles recomendados para procesamiento con IA

Estos perfiles son recomendaciones de salida para preparar media antes de enviarla a modelos multimodales o pipelines externos, por ejemplo clientes que consumen modelos vía OpenRouter. El soporte real de audio, video o imágenes depende del modelo elegido en OpenRouter; si el modelo no acepta video directo, usar frames, thumbnails, audio extraído o JSON de escenas como artefactos intermedios.

### Audio para transcripción o análisis de voz

Perfil recomendado de alta calidad:

| Campo | Valor recomendado |
|---|---|
| Formato | `flac` |
| Codec | `flac` |
| Canales | `1` mono |
| Sample rate | `16000` Hz para voz general, `24000` Hz si se necesita más detalle |
| Bitrate | Lossless, no fijar bitrate |
| Normalización | `loudnessTarget: -16`, `truePeak: -1.5`, `lra: 11` |
| Chunks | 300 segundos |
| Overlap | 2 segundos cuando se necesite preservar contexto entre segmentos |

Uso sugerido:

```txt
POST /api/v1/audio/:mediaId/normalize
POST /api/v1/audio/:mediaId/transcode
POST /api/v1/audio/:mediaId/chunk
```

Payload de referencia:

```json
{
  "targetFormat": "flac",
  "codec": "flac",
  "channels": 1,
  "sampleRate": 16000,
  "bitrate": null
}
```

Perfil liviano para menor transferencia:

| Campo | Valor recomendado |
|---|---|
| Formato | `mp3` |
| Codec | `libmp3lame` si se configura explícitamente |
| Canales | `1` mono |
| Sample rate | `16000` Hz |
| Bitrate | `64k` para voz, `96k` si hay música o ruido |

Payload de referencia:

```json
{
  "targetFormat": "mp3",
  "codec": "libmp3lame",
  "channels": 1,
  "sampleRate": 16000,
  "bitrate": "64k"
}
```

Para voz, evitar enviar audio estéreo o sample rates altos si no aportan información útil; aumentan costo, latencia y tamaño sin mejorar proporcionalmente el resultado.

### Frames para modelos de visión

Cuando el modelo trabaja mejor con imágenes que con video directo, generar frames o thumbnails y enviarlos como artefactos visuales.

Perfil recomendado para análisis visual:

| Campo | Valor recomendado |
|---|---|
| Modo | `scene-change` |
| Formato | `png` si se necesita máxima fidelidad |
| Ancho | `1280` px |
| Máximo de frames | 20 a 50 según duración |
| Scene threshold | `0.3` como punto de partida |

Payload de referencia:

```json
{
  "mode": "scene-change",
  "sceneThreshold": 0.3,
  "maxFrames": 30,
  "format": "png",
  "width": 1280
}
```

Perfil recomendado para bajo peso:

| Campo | Valor recomendado |
|---|---|
| Modo | `interval` o `scene-change` |
| Formato | `jpeg` o `webp` |
| Ancho | `768` a `1024` px |
| Intervalo | 15 a 30 segundos |
| Máximo de frames | 10 a 30 |

Payload de referencia:

```json
{
  "mode": "interval",
  "intervalSeconds": 30,
  "maxFrames": 20,
  "format": "jpeg",
  "width": 1024
}
```

Para OpenRouter, esta suele ser la opción más portable cuando el modelo acepta imágenes pero no video directo.

### Video compacto para modelos o pipelines que aceptan video

Si el consumidor externo acepta video directamente, usar un archivo MP4 estándar y liviano.

Perfil recomendado:

| Campo | Valor recomendado |
|---|---|
| Contenedor | `mp4` |
| Video codec | `libx264` |
| Audio codec | `aac` |
| Resolución | `720p` para análisis general, `1080p` si hay texto pequeño o detalle visual |
| FPS | 12 a 24 para análisis visual; 24 a 30 si importa movimiento fluido |
| CRF | 23 a 28 |
| Preset | `medium` |
| Audio bitrate | `96k` a `128k` |

Payload de referencia para transcodificación:

```json
{
  "container": "mp4",
  "videoCodec": "libx264",
  "audioCodec": "aac",
  "resolution": "720p",
  "fps": 24,
  "crf": 26,
  "preset": "medium"
}
```

Payload de referencia para compresión:

```json
{
  "crf": 26,
  "preset": "medium",
  "maxWidth": 1280,
  "maxHeight": 720,
  "audioBitrate": "96k"
}
```

Para videos largos, preferir una combinación de:

```txt
POST /api/v1/video/:mediaId/detect-scenes
POST /api/v1/video/:mediaId/extract-frames
POST /api/v1/video/:mediaId/extract-audio
```

Así el consumidor de IA puede enviar menos datos: escenas como JSON, frames representativos y audio optimizado.

### Thumbnails para resumen visual rápido

Usar thumbnails cuando solo se necesita una vista previa o selección rápida de contenido.

Perfil recomendado:

| Campo | Valor recomendado |
|---|---|
| Formato | `webp` |
| Ancho | `320` a `512` px |
| Count | 5 a 12 |

Payload de referencia:

```json
{
  "count": 8,
  "width": 512,
  "format": "webp"
}
```

### Resumen de recomendación por caso

| Caso IA | Artefacto recomendado | Endpoint |
|---|---|---|
| Transcripción de voz | `audio_transcoded` en FLAC mono 16 kHz | `/audio/:mediaId/transcode` |
| Transcripción larga | `audio_chunk` en FLAC mono 16 kHz | `/audio/:mediaId/chunk` |
| Audio ruidoso o irregular | `audio_normalized` antes de transcribir | `/audio/:mediaId/normalize` |
| Visión sobre video | `frame` en PNG/JPEG/WebP | `/video/:mediaId/extract-frames` |
| Resumen de video | `scene_detection` + `thumbnail` | `/video/:mediaId/detect-scenes`, `/video/:mediaId/generate-thumbnails` |
| Video directo compacto | `video_compressed` MP4 H.264/AAC 720p | `/video/:mediaId/compress` |

## Audio

### Conversión

Endpoint:

```txt
POST /api/v1/audio/:mediaId/transcode
```

Formatos destino permitidos:

| Campo | Valores |
|---|---|
| `targetFormat` | `flac`, `wav`, `mp3`, `ogg`, `m4a`; si no se envía, intenta preservar el formato original |

Opciones adicionales:

| Campo | Rango / tipo |
|---|---|
| `codec` | string opcional; si no se envía, intenta copiar o preservar el codec original cuando sea viable |
| `channels` | 1 a 8; si no se envía, intenta preservar los canales originales |
| `sampleRate` | 8000 a 192000; si no se envía, intenta preservar el sample rate original |
| `bitrate` | string o null; si no se envía, intenta copiar o preservar el bitrate original |

Si no se envían parámetros de formato/codificación, el servicio intenta usar `-c:a copy` para evitar pérdida por recodificación.

Artefacto generado:

```txt
audio_transcoded
```

### División en chunks

Endpoint:

```txt
POST /api/v1/audio/:mediaId/chunk
```

Formatos destino permitidos:

| Campo | Valores |
|---|---|
| `targetFormat` | `flac`, `mp3`, `wav`, `ogg`, `m4a`; si no se envía, intenta preservar el formato original |

Opciones:

| Campo | Rango / default |
|---|---|
| `chunkDurationSeconds` | 30 a 1800, default 300 |
| `overlapSeconds` | 0 a 10, default 0 |
| `preserveTimestamps` | boolean, default false |
| `codec` | string opcional; si no se envía, intenta preservar el codec original cuando sea viable |
| `bitrate` | string o null; si no se envía, intenta preservar el bitrate original |
| `channels` | 1 a 8; si no se envía, intenta preservar los canales originales |
| `sampleRate` | 8000 a 192000; si no se envía, intenta preservar el sample rate original |

El overlap se aplica creando ventanas explícitas:

```txt
chunk 0: start 0, duration 600
chunk 1: start 595, duration 600
chunk 2: start 1190, duration 600
```

Payload recomendado para chunks OGG/Opus con 5 segundos de overlap:

```json
{
  "chunkDurationSeconds": 600,
  "overlapSeconds": 5,
  "targetFormat": "ogg",
  "codec": "libopus",
  "bitrate": "96k",
  "channels": 1,
  "sampleRate": 48000,
  "preserveTimestamps": false
}
```

Regla de codificación:

```txt
Si no mandas format/codec/bitrate/channels/sampleRate:
  preservar lo detectado del original cuando sea viable.

Si mandas valores:
  usar lo solicitado.

Si quieres reducir peso:
  usar codec/bitrate explícito.
```

Artefacto generado:

```txt
audio_chunk
```

### Normalización

Endpoint:

```txt
POST /api/v1/audio/:mediaId/normalize
```

Formatos destino permitidos:

| Campo | Valores |
|---|---|
| `targetFormat` | `flac`, `wav`, `mp3`, `ogg`, `m4a`; si no se envía, intenta preservar el formato original |

Opciones:

| Campo | Rango / default |
|---|---|
| `loudnessTarget` | -40 a -5, default -16 |
| `truePeak` | -9 a 0, default -1.5 |
| `lra` | 1 a 20, default 11 |
| `codec` | string opcional; si no se envía, intenta preservar el codec original cuando sea viable |
| `bitrate` | string o null; si no se envía, intenta preservar el bitrate original |
| `channels` | 1 a 8; si no se envía, intenta preservar los canales originales |
| `sampleRate` | 8000 a 192000; si no se envía, intenta preservar el sample rate original |

Este proceso aplica filtro `loudnorm`, por lo que no puede usar `-c:a copy`; si el origen usa codec con pérdida, habrá recodificación, pero se preserva el perfil detectado cuando sea viable.

Artefacto generado:

```txt
audio_normalized
```

### Eliminación de silencios

Endpoint:

```txt
POST /api/v1/audio/:mediaId/remove-silence
```

Formatos destino permitidos:

| Campo | Valores |
|---|---|
| `targetFormat` | `flac`, `wav`, `mp3`, `ogg`, `m4a`; si no se envía, intenta preservar el formato original |

Opciones:

| Campo | Rango / default |
|---|---|
| `minSilenceDurationMs` | 100 a 10000, default 700 |
| `silenceThresholdDb` | -90 a -10, default -40 |
| `targetFormat` | `flac`, `wav`, `mp3`, `ogg`, `m4a`; si no se envía, intenta preservar el formato original |
| `codec` | string opcional; si no se envía, intenta preservar el codec original cuando sea viable |
| `bitrate` | string o null; si no se envía, intenta preservar el bitrate original |
| `channels` | 1 a 8; si no se envía, intenta preservar los canales originales |
| `sampleRate` | 8000 a 192000; si no se envía, intenta preservar el sample rate original |

Payload recomendado para mantener OGG/Opus con bitrate explícito:

```json
{
  "minSilenceDurationMs": 200,
  "silenceThresholdDb": -40,
  "targetFormat": "ogg",
  "codec": "libopus",
  "bitrate": "96k",
  "channels": 1,
  "sampleRate": 48000
}
```

Regla de codificación:

```txt
Si no mandas format/codec/bitrate/channels/sampleRate:
  preservar lo detectado del original cuando sea viable.

Si mandas valores:
  usar lo solicitado.

Si quieres reducir peso:
  usar codec/bitrate explícito.
```

Artefacto generado:

```txt
audio_silence_removed
```

## Video

### Extracción de audio

Endpoint:

```txt
POST /api/v1/video/:mediaId/extract-audio
```

Formatos destino permitidos:

| Campo | Valores |
|---|---|
| `targetFormat` | `flac`, `wav`, `mp3`, `ogg`, `m4a`; si no se envía, intenta copiar o preservar el formato de audio extraído |

Opciones adicionales:

| Campo | Rango |
|---|---|
| `codec` | string opcional; si no se envía, intenta copiar o preservar el codec original cuando sea viable |
| `bitrate` | string o null; si no se envía, intenta copiar o preservar el bitrate original |
| `channels` | 1 a 8; si no se envía, intenta preservar los canales originales |
| `sampleRate` | 8000 a 192000; si no se envía, intenta preservar el sample rate original |

Si no se envían parámetros de formato/codificación, el servicio intenta extraer con `-c:a copy` para evitar pérdida por recodificación.

Artefacto generado:

```txt
audio_extract
```

### Conversión de video

Endpoint:

```txt
POST /api/v1/video/:mediaId/transcode
```

Contenedores permitidos:

| Campo | Valores |
|---|---|
| `container` | `mp4`, `webm`, `mkv`, `mov` |

Opciones:

| Campo | Rango / default |
|---|---|
| `videoCodec` | string, default `libx264` |
| `audioCodec` | string, default `aac` |
| `resolution` | string opcional |
| `fps` | 1 a 120 |
| `crf` | 0 a 51, default 23 |
| `preset` | `ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow` |

Artefacto generado:

```txt
video_transcoded
```

### Compresión

Endpoint:

```txt
POST /api/v1/video/:mediaId/compress
```

Opciones:

| Campo | Rango / default |
|---|---|
| `crf` | 0 a 51, default 23 |
| `preset` | `ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow` |
| `maxWidth` | 120 a 7680 |
| `maxHeight` | 120 a 4320 |
| `audioBitrate` | string opcional |

Artefacto generado:

```txt
video_compressed
```

### División en segmentos

Endpoint:

```txt
POST /api/v1/video/:mediaId/split
```

Opciones:

| Campo | Rango / default |
|---|---|
| `segmentDurationSeconds` | 30 a 7200, default 600 |
| `overlapSeconds` | 0 a 30, default 0 |
| `preserveKeyframes` | boolean, default true |

Artefacto generado:

```txt
video_segment
```

### Extracción de frames

Endpoint:

```txt
POST /api/v1/video/:mediaId/extract-frames
```

Modos permitidos:

```txt
interval
scene-change
keyframes
hybrid
```

Formatos permitidos:

```txt
png
jpeg
jpg
webp
```

Opciones:

| Campo | Rango / default |
|---|---|
| `mode` | default `scene-change` |
| `sceneThreshold` | 0 a 1, default 0.3 |
| `intervalSeconds` | 1 a 3600, default 30 |
| `maxFrames` | 1 a 500, default 30 |
| `width` | 64 a 7680 |

Artefacto generado:

```txt
frame
```

### Detección de escenas

Endpoint:

```txt
POST /api/v1/video/:mediaId/detect-scenes
```

Opciones:

| Campo | Rango / default |
|---|---|
| `sceneThreshold` | 0 a 1, default 0.3 |
| `minSceneDurationSeconds` | 0 a 60, default 2 |

Artefacto generado:

```txt
scene_detection
```

El artefacto es un archivo JSON almacenado permanentemente.

### Thumbnails

Endpoint:

```txt
POST /api/v1/video/:mediaId/generate-thumbnails
```

Formatos permitidos:

```txt
webp
png
jpeg
jpg
```

Opciones:

| Campo | Rango / default |
|---|---|
| `count` | 1 a 50, default 5 |
| `width` | 64 a 1920, default 320 |

Artefacto generado:

```txt
thumbnail
```

## Tipos de artefacto

Los artefactos se consultan con:

```txt
GET /api/v1/media/:mediaId/artifacts
```

Tipos disponibles:

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

## Procesamiento encadenado desde artefactos

Los endpoints principales procesan archivos originales usando `mediaId`, pero también se puede procesar un `Artifact` como fuente sin re-subirlo como nuevo `Media`. Esto evita duplicar archivos y mantiene la trazabilidad:

```txt
Media original
  -> Artifact audio_silence_removed
    -> Artifact audio_chunk
```

Endpoints disponibles para artefactos de audio:

```txt
POST /api/v1/artifacts/:artifactId/audio/transcode
POST /api/v1/artifacts/:artifactId/audio/chunk
POST /api/v1/artifacts/:artifactId/audio/normalize
POST /api/v1/artifacts/:artifactId/audio/remove-silence
```

Endpoints disponibles para artefactos de video:

```txt
POST /api/v1/artifacts/:artifactId/video/extract-audio
POST /api/v1/artifacts/:artifactId/video/transcode
POST /api/v1/artifacts/:artifactId/video/compress
POST /api/v1/artifacts/:artifactId/video/split
POST /api/v1/artifacts/:artifactId/video/extract-frames
POST /api/v1/artifacts/:artifactId/video/detect-scenes
POST /api/v1/artifacts/:artifactId/video/generate-thumbnails
```

También se puede crear un job genérico indicando fuente artifact:

```json
{
  "type": "audio.chunk",
  "sourceType": "artifact",
  "sourceId": "art_...",
  "options": {
    "chunkDurationSeconds": 300,
    "targetFormat": "ogg"
  }
}
```

Los artefactos generados desde otro artefacto siguen relacionados al `mediaId` original y registran:

| Campo | Descripción |
|---|---|
| `sourceType` | `media` o `artifact` |
| `sourceId` | ID de la fuente usada por el job |
| `parentArtifactId` | ID del artefacto padre cuando la fuente fue otro artefacto |

## Eliminación de media y artefactos

El almacenamiento es permanente hasta que se elimina explícitamente. Para evitar artefactos huérfanos:

```txt
DELETE /api/v1/media/:mediaId
```

Si el media tiene artefactos activos, responde `409 MEDIA_HAS_ARTIFACTS`. Para eliminar el original y todos sus artefactos:

```txt
DELETE /api/v1/media/:mediaId?includeArtifacts=true
```

Para artefactos individuales:

```txt
DELETE /api/v1/artifacts/:artifactId
```

Si el artefacto tiene hijos generados desde él, responde `409 ARTIFACT_HAS_CHILDREN`. Para eliminar el artefacto y todo su árbol de hijos:

```txt
DELETE /api/v1/artifacts/:artifactId?includeChildren=true
```

## Validación de media

Endpoint:

```txt
POST /api/v1/media/:mediaId/validate
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
