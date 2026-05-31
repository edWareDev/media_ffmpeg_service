---
name: edware-service-development-style
description: Use this skill when creating, modifying, refactoring, debugging, reviewing, or extending style Node.js backend services (APIs, endpoints, etc) that follow the observed layered architecture with Express, optional gRPC, use cases, repositories, infrastructure clients, validators, domain entities, system logs, and service-specific modules such as files, chats, embeddings, AI functions, scenarios, trainer, or consultant.
---

# edWare Service Development Style

## Objetivo

Usar esta guía para trabajar en servicios backend presentes o futuros que sigan la arquitectura observada en los proyectos revisados:

- Servicios Node.js con ECMAScript modules.
- API REST con Express.
- gRPC opcional para operaciones binarias o streaming.
- Arquitectura por capas ligera, inspirada en clean/hexagonal.
- Casos de uso por dominio.
- Repositorios concretos para persistencia.
- Clientes de infraestructura para servicios externos.
- Validación con Zod y validaciones manuales puntuales.
- Respuestas HTTP normalizadas con `fetchResponse`.
- Errores de negocio normalizados con `CustomError`.
- Logs de sistema opcionales en SQLite con Sequelize.

No asumir que todos los servicios tienen todos los dominios. Aplicar solo las partes que existan en el repositorio concreto.

## Arquitectura base

Seguir este flujo para REST:

```text
HTTP request
  -> src/app.js
  -> src/adapters/routers
  -> src/adapters/controllers
  -> src/usecases/<domain>
  -> src/domain/entities / src/domain/repositories
  -> src/infrastructure/services / src/adapters/databases
  -> database, external service, LLM, or filesystem
  -> controller
  -> fetchResponse(res, ...)
```

Seguir este flujo para gRPC cuando exista:

```text
gRPC client
  -> proto/*.proto
  -> src/adapters/gRPC/*Service.js
  -> src/usecases/<domain>
  -> src/domain/repositories
  -> src/infrastructure/services
  -> database or stream source
```

Mantener las responsabilidades separadas:

- `src/app.js`: bootstrap, middlewares globales, routers, conexiones y arranque.
- `src/adapters/routers`: rutas Express y middlewares de transporte como Multer.
- `src/adapters/controllers`: traducción HTTP, llamada a casos de uso y respuesta con `fetchResponse`.
- `src/adapters/gRPC`: traducción gRPC, streaming y códigos gRPC.
- `src/adapters/web/validators`: schemas Zod para payloads, query params y logs.
- `src/adapters/web/middlewares`: middlewares globales de error y ruta no encontrada.
- `src/adapters/databases`: modelos ORM/ODM como Sequelize o Mongoose cuando el proyecto los ubique allí.
- `src/usecases`: lógica de aplicación y orquestación del dominio.
- `src/domain/entities`: entidades simples del dominio.
- `src/domain/repositories`: repositorios concretos que encapsulan persistencia.
- `src/infrastructure/services`: conexiones, clientes HTTP, clientes LLM, SQLite, MongoDB u otros servicios externos.
- `src/prompts`: builders de prompts cuando el servicio usa LLM.
- `src/utils`: utilidades transversales como `CustomError`, `http_error_codes.js`, `fetchResponse`, parsing y strings.
- `config`: variables de entorno, constantes de runtime, puertos, conexiones y singletons de estado/configuración.

Usar `infrastructure` como nombre estándar de carpeta. Si un proyecto legacy usa `infraestructure`, corregirlo en una tarea coordinada actualizando todos los imports afectados.

## Estructura esperada

Usar esta forma como referencia, ajustándola al servicio real:

```text
.
├── config
├── proto                         # Solo si hay gRPC.
├── src
│   ├── adapters
│   │   ├── controllers
│   │   ├── databases
│   │   ├── gRPC                 # Solo si hay gRPC.
│   │   ├── routers
│   │   └── web
│   │       ├── middlewares
│   │       └── validators
│   ├── domain
│   │   ├── entities
│   │   └── repositories
│   ├── infrastructure
│   │   └── services
│   ├── prompts                  # Solo si hay LLM/prompts.
│   ├── usecases
│   │   └── <domain>
│   └── utils
└── <runtime-data-or-domain-cache> # Solo si el servicio lo requiere.
```

## Convenciones de nombres

- Usar ESM con `import`/`export` y extensión `.js` explícita en imports relativos.
- Usar named exports: `export const`, `export class`, `export async function`.
- Usar carpetas en minúsculas: `adapters`, `controllers`, `repositories`, `usecases`, `validators`.
- Usar carpetas de dominio en minúsculas: `files`, `chats`, `logs`, `embeddings`, `scenarios`, `trainer`, `consultant`.
- Usar casos de uso en PascalCase con acción: `CreateChat.js`, `GetFileById.js`, `GenerateQuestionsV3.js`.
- Exportar funciones de casos de uso en camelCase: `createChat`, `getFileById`, `generateQuestions`.
- Usar controladores en PascalCase con sufijo `Controller`: `FilesController.js`, `ChatsController.js`, `IAController.js`.
- Usar clases y entidades en PascalCase: `CustomError`, `SystemLog`, `SystemConfig`.
- Usar constantes y variables de entorno en UPPER_SNAKE_CASE: `HTTP_CODES`, `MONGODB_CNX_STR`, `OPENROUTER_API_KEY`.
- Usar `http_error_codes.js` como archivo estándar para códigos HTTP. Exportar desde ahí `HTTP_CODES` si el proyecto ya usa ese identificador.
- Usar `*Router.js` para routers padre o generales que montan grupos completos.
- Usar `*.route.js` para rutas hijas, pequeñas o específicas de un recurso.
- Usar nombres de controladores claros con sufijo `Controller`, orientados a acción y recurso: `createChatController`, `getFilesController`, `streamMediaController`, `getSystemLogsController`.
- Evitar nombres invertidos o ambiguos como `controllerGetAllLogs` en código nuevo.
- Preferir rutas REST en minúsculas y kebab-case para acciones: `/generate-questions`, `/create-scenario`, `/use-trainer`.
- Mantener nombres raros ya existentes solo por compatibilidad, por ejemplo `:Id` si el router actual lo usa.

## Flujo para crear una funcionalidad

1. Identificar el dominio real: `files`, `chats`, `logs`, `ia`, `embeddings`, `trainer`, `consultant`, u otro.
2. Revisar primero patrones existentes del mismo dominio antes de crear nuevos archivos.
3. Agregar configuración en `config/*.js` si se requieren variables de entorno, puertos, modelos, flags o constantes runtime.
4. Si hay servicio externo nuevo, crear cliente en `src/infrastructure/services`.
5. Si hay entrada HTTP, query params o cuerpo de comando no trivial, crear o reutilizar schema Zod en `src/adapters/web/validators` y usarlo desde el caso de uso o borde de entrada correspondiente.
6. Crear caso de uso en `src/usecases/<domain>/<ActionName>.js`.
7. Validar datos en el caso de uso, salvo validaciones propias del transporte como presencia de archivo Multer.
8. Llamar repositorios o clientes desde el caso de uso, no desde routers.
9. Si hay persistencia nueva, agregar entidad/modelo/repositorio según el patrón local.
10. Crear o ampliar controlador en `src/adapters/controllers`.
11. Convertir resultados `{ error }` a `CustomError` cuando aplique.
12. Responder siempre con `fetchResponse` en controladores REST nuevos.
13. Registrar la ruta en `src/adapters/routers`.
14. Montar el router en `src/app.js` si es un recurso nuevo.
15. Montar siempre `logsRouter` cuando exista el módulo de logs del servicio. Si los logs no deben ser públicos, proteger la ruta con middleware o restringirla por configuración, pero no dejar el router desconectado.
16. Para gRPC, actualizar primero `proto/*.proto`, luego `src/adapters/gRPC/*Service.js`, y finalmente el registro del servidor gRPC.
17. Ejecutar `npm run lint` antes de cerrar. Ejecutar `npm test` si hay tests o se agregaron tests.
18. Ejecutar `npm run build` solo si el entregable requiere validar artefactos ofuscados o distribución.

## Flujo para modificar funcionalidad existente

1. Empezar por el router o contrato gRPC para ubicar el endpoint público.
2. Seguir la cadena: router -> controller -> usecase -> repository/client -> database/external service.
3. Revisar schemas Zod antes de cambiar payloads, params o query params.
4. Si cambia una respuesta HTTP, mantener el formato de `fetchResponse`.
5. Si cambia persistencia, revisar modelo, entidad, repositorio y conexión.
6. Si cambia streaming/rangos, revisar helpers como `parseRange` y `clampRange`.
7. Si cambia IA/LLM, revisar prompts, configuración de modelo y parsing de JSON de LLM.
8. Si cambia logging, revisar `SystemLog`, `SystemLogModel`, `SystemLogRepositoryImpl`, `CreateSystemLog`, `SystemConfig` y `SystemInfo`.
9. Mantener el cambio cerca del módulo afectado. No hacer refactors transversales sin necesidad.

## Manejo de errores

Patrón REST preferido:

```js
try {
    const result = await usecase(input);
    if (result.error) throw new CustomError('Mensaje de error.', HTTP_CODES._400_BAD_REQUEST, result.error);

    fetchResponse(res, {
        statusCode: HTTP_CODES._200_OK,
        message: 'Operación realizada correctamente.',
        data: result
    });
} catch (error) {
    if (error instanceof CustomError) {
        const { message, httpErrorCode, errorCode } = error.toJSON();
        fetchResponse(res, { statusCode: httpErrorCode, message, errorCode });
    } else {
        fetchResponse(res, {
            statusCode: HTTP_CODES._500_INTERNAL_SERVER_ERROR,
            message: 'Error interno del servicio.',
            errorCode: error.message
        });
    }
}
```

Reglas:

- Casos de uso normalmente devuelven `{ error }` para errores esperados.
- Controladores convierten `{ error }` a `CustomError`.
- Repositorios encapsulan errores de infraestructura y devuelven mensajes controlados.
- Middlewares globales manejan rutas no encontradas y errores no capturados.
- En gRPC, usar códigos gRPC y `call.destroy` o callbacks según el patrón local.
- No filtrar detalles sensibles de infraestructura al cliente.
- Mantener mensajes de usuario en español cuando el proyecto ya lo hace.

## Validación

- Usar Zod para payloads, query params y logs cuando el contrato sea estable o tenga más de una validación trivial.
- Usar `isValidObjectId` para IDs MongoDB antes de llamar repositorios.
- Usar validación manual solo para checks simples o propios del transporte, como `req.file`.
- Mantener validadores fuera de routers.
- Crear y usar validadores cuando se requieran. No dejar schemas declarados sin conexión con rutas o casos de uso.
- Centralizar traducción de errores Zod si el proyecto ya tiene helper; si no, seguir el patrón local.
- Para LLM, validar entradas antes de construir prompts y parsear respuestas estructuradas con helpers como `parseLlmJson`.

## Configuración y secretos

- Leer variables desde `process.env` en `config/*.js` o clientes de infraestructura.
- Documentar nombres y propósito de variables, no valores reales.
- No imprimir cadenas de conexión, API keys, tokens, payloads completos, buffers ni chunks.
- Sanitizar logs de arranque: mostrar estado, host o base sin credenciales cuando sea necesario.
- Respetar singletons existentes como `SystemInfo` y `SystemConfig`.
- Usar flags como `SAVE_LOGS` de forma consistente con el proyecto.

Variables comunes observadas:

- `NODE_ENV`
- `API_PORT`
- `GRPC_PORT`
- `MONGODB_CNX_STR`
- `SQLITE_CNX_STR`
- `SAVE_LOGS`
- `OPENROUTER_API_KEY`
- `FILES_SERVICE_HOST`
- `EMBEDDINGS_SERVICE_HOST`
- `CHATS_SERVICE_HOST`
- `PROMPTS_SERVICE_HOST`
- `COLLECTION_NAME`

## Patrones por dominio

### Files

- Usar Multer en router para multipart.
- Mantener buffers y GridFS dentro del repositorio o servicio especializado.
- Para streaming, cuidar `Range`, status `206`, `Content-Range`, tamaño de chunk y `pipeline`.
- Para gRPC, transmitir chunks sin cargar más de lo necesario.

### Chats

- Validar `chatId` con `isValidObjectId`.
- Mantener metadata del sistema en schemas/entidades.
- Repositorios deben encapsular Mongoose y modelos.

### Logs

- Usar `SystemLog` como entidad y `SystemLogRepositoryImpl` para SQLite.
- Validar creación y paginación con Zod.
- Montar siempre `logsRouter` cuando exista. Si requiere restricción, resolverlo con middleware de auth/configuración.

### IA / LLM

- Centralizar clientes OpenAI/OpenRouter en infraestructura.
- Centralizar modelos y constantes en `config`.
- Construir prompts en `src/prompts` cuando el prompt sea reutilizable.
- Exigir formato JSON cuando el caso de uso dependa de datos estructurados.
- Parsear respuestas LLM con helper robusto, no con `JSON.parse` directo disperso.
- No duplicar clientes HTTP u OpenAI dentro de casos de uso.

## Calidad mínima

- Mantener routers livianos.
- Mantener controladores enfocados en HTTP.
- Mantener lógica de negocio en casos de uso.
- Mantener acceso a datos en repositorios.
- Mantener clientes externos en infraestructura.
- Mantener imports relativos con `.js`.
- Usar punto y coma.
- No usar `var`.
- Usar `===`.
- Preferir `const`.
- No agregar barrel exports si el proyecto no los usa.
- No introducir alias de paths sin configuración y acuerdo explícito.
- No versionar archivos runtime como SQLite salvo que sean fixtures intencionales.
- No agregar dependencias nuevas si el stack actual resuelve el problema.
- Toda dependencia declarada en `package.json` debe tener uso real en código activo. Si una dependencia no se importa o no se usa, eliminarla. No mantener dependencias solo "por si acaso".
- Agregar tests Vitest cuando el cambio toque parsers, validadores, reglas de negocio, errores o regresiones.

## Comandos

Usar los comandos definidos en `package.json` del repositorio concreto. Los más frecuentes:

- `npm start`: arranque normal con `.env`.
- `npm run dev`: desarrollo local con watch y `.env.development`.
- `npm run lint`: validación mínima antes de entregar cambios.
- `npm test`: tests Vitest.
- `npm run build`: build/ofuscación cuando aplique.

Si el comando depende de servicios externos o variables reales, indicarlo al usuario si no puede ejecutarse.

## Inconsistencias conocidas de la familia de proyectos

Tratar estas inconsistencias como señales a revisar, no como reglas a propagar:

- Uso de `HTTP_CODES.js` como archivo único de códigos HTTP. Estandarizar hacia `http_error_codes.js`.
- Imports a repositorios inexistentes como `LogRepositoryImpl.js`. Estandarizar hacia `SystemLogRepositoryImpl.js`.
- `logsRouter` presente pero no montado en `src/app.js`. Montarlo siempre cuando exista módulo de logs.
- Mezcla de nombres de routers: estandarizar `*Router.js` para padres/generales y `*.route.js` para hijos/pequeños.
- Mezcla de nombres de controladores: estandarizar `<action><Resource>Controller`.
- Carpeta `infraestructure` con typo. Estandarizar hacia `infrastructure` actualizando imports.
- Validadores Zod declarados pero no conectados a rutas o casos de uso. Crear y usar validadores cuando correspondan.
- Mezcla de comillas simples y dobles.
- Códigos HTTP literales mezclados con `HTTP_CODES`.
- Logs de depuración que imprimen datos sensibles o payloads completos.
- Dependencias declaradas pero no usadas en el código activo. Importarlas/usarlas realmente o eliminarlas del servicio.
- Descripciones de `package.json` que pueden cubrir alcance futuro, legacy o de otro servicio.

Cuando una inconsistencia afecte el cambio actual, resolverla de forma local y explícita. Si la resolución cambia contratos públicos, pedir confirmación.

## Preguntas que requieren confirmación cuando afecten el trabajo

- ¿Qué protección debe tener el endpoint de logs montado: pública, interna, autenticada o restringida por configuración?
- ¿Las rutas nuevas deben colgar de `/ai`, `/files`, `/chats` u otra base?
- ¿Hay autenticación/autorización obligatoria para el recurso?
- ¿El build ofuscado es obligatorio para release o solo para despliegues específicos?
- ¿Los `.env.example` deben tener placeholders únicamente o valores operativos internos?
- ¿Las dependencias no usadas deben integrarse en código activo o eliminarse del servicio?
- ¿Los archivos runtime como `logs.sqlite` son fixtures intencionales o deben excluirse?
