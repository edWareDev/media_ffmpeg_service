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

Todas las rutas están bajo `/api/v2`.

- `GET /health`
- `POST /media`
- `GET /media`
- `GET /media/:mediaId`
- `DELETE /media/:mediaId`
- `GET /media/:mediaId/download`
- `GET /media/:mediaId/metadata`
- `POST /media/:mediaId/validations`
- `GET /media/:mediaId/artifacts`
- `GET /media/:mediaId/jobs`
- `GET /artifacts`
- `GET /artifacts/:artifactId`
- `DELETE /artifacts/:artifactId`
- `GET /artifacts/:artifactId/download`
- `GET /artifacts/:artifactId/children`
- `GET /artifacts/:artifactId/jobs`
- `POST /jobs`
- `GET /jobs`
- `GET /jobs/:jobId`
- `POST /jobs/:jobId/cancel`
- `POST /jobs/:jobId/retry`
- `GET /operations`
- `GET /operations/:type`

## Procesamiento

Todo procesamiento se crea con `POST /api/v2/jobs`. El campo `type` define la operación, y la fuente puede ser un media original o un artefacto:

```json
{
  "type": "audio.chunk",
  "sourceType": "media",
  "sourceId": "med_...",
  "options": {
    "chunkDurationSeconds": 300
  }
}
```

Consultar operaciones disponibles y fuentes permitidas con `GET /api/v2/operations`.

## Documentación

- Contrato OpenAPI v2: `docs/openapiv2.yaml`
- Formatos y opciones multimedia: `docs/media-formats.md`
