# Media FFmpeg Service

API REST para almacenamiento permanente y procesamiento multimedia asíncrono con FFmpeg, MongoDB/GridFS y BullMQ.

## Requisitos

- Node.js 22+
- MongoDB
- Redis

## Configuración

Copiar `.env.example` a `.env` y ajustar los valores de entorno.

## Comandos

```bash
npm install
npm run dev
npm run lint
npm test
```

## Rutas principales

Todas las rutas están bajo `/api/v1`.

- `POST /media/upload`
- `GET /media`
- `GET /media/:mediaId`
- `GET /media/:mediaId/metadata`
- `POST /media/:mediaId/metadata/extract`
- `POST /media/:mediaId/validate`
- `GET /media/:mediaId/download`
- `GET /media/:mediaId/artifacts`
- `DELETE /media/:mediaId`
- `DELETE /media/:mediaId?includeArtifacts=true`
- `POST /audio/:mediaId/transcode`
- `POST /audio/:mediaId/chunk`
- `POST /audio/:mediaId/normalize`
- `POST /audio/:mediaId/remove-silence`
- `POST /video/:mediaId/extract-audio`
- `POST /video/:mediaId/transcode`
- `POST /video/:mediaId/compress`
- `POST /video/:mediaId/split`
- `POST /video/:mediaId/extract-frames`
- `POST /video/:mediaId/detect-scenes`
- `POST /video/:mediaId/generate-thumbnails`
- `POST /jobs`
- `GET /jobs`
- `GET /jobs/:jobId`
- `POST /jobs/:jobId/cancel`
- `POST /jobs/:jobId/retry`
- `GET /artifacts/:artifactId/download`
- `DELETE /artifacts/:artifactId`
- `DELETE /artifacts/:artifactId?includeChildren=true`
- `POST /artifacts/:artifactId/audio/chunk`
- `POST /artifacts/:artifactId/audio/transcode`
- `POST /artifacts/:artifactId/audio/normalize`
- `POST /artifacts/:artifactId/audio/remove-silence`
- `POST /artifacts/:artifactId/video/extract-frames`
- `POST /artifacts/:artifactId/video/extract-audio`

## Documentación

- Contrato OpenAPI: `docs/openapi.yaml`
- Formatos y opciones multimedia: `docs/media-formats.md`
