# AGENT.md

## Proposito

Este archivo define instrucciones permanentes para agentes de IA que trabajen en proyectos con servicios backend Node.js organizados por capas.

El objetivo es preservar arquitectura, convenciones, seguridad operativa, estilo de codigo y flujo de trabajo en servicios presentes y futuros que sigan el patron documentado en `SKILL.md`.

## Lectura obligatoria

Antes de ejecutar cualquier tarea de analisis, diagnostico, edicion, refactor, prueba, review o documentacion tecnica:

1. Leer `SKILL.md` en la raiz del proyecto.
2. Identificar que modulo, capa y contrato publico estan involucrados.
3. Revisar archivos relacionados antes de modificar codigo.

`SKILL.md` es la fuente principal para arquitectura, nombres, estructura, validacion, errores, logs, dependencias y comandos.

## Reglas de comportamiento

- Seguir la arquitectura y convenciones documentadas en `SKILL.md`.
- Analizar antes de editar. No modificar codigo por suposicion si el patron puede verificarse en el repositorio.
- Mantener la solucion simple, local al cambio y coherente con el modulo afectado.
- No sobreingenierizar ni introducir abstracciones si el patron existente resuelve el problema.
- No hacer refactors grandes sin presentar un plan y recibir confirmacion.
- No cambiar contratos publicos de API REST, gRPC, payloads, respuestas, entidades, repositorios o variables de entorno sin declararlo explicitamente antes de actuar.
- No modificar modelos de datos, schemas Zod, modelos Sequelize, schemas Mongoose, metadata de GridFS o prompts LLM sin explicar impacto en controladores, casos de uso, repositorios, clientes y consumidores.
- No eliminar codigo sin buscar usos activos en el repositorio.
- No introducir dependencias nuevas si el stack actual resuelve el problema.
- No mantener dependencias declaradas sin uso real en codigo activo. Si no se usan, eliminarlas.
- No registrar secretos, API keys, tokens, credenciales, cadenas de conexion, headers `authorization`, buffers, chunks ni payloads completos.
- Si una decision afecta arquitectura, datos, seguridad, rendimiento, mantenibilidad o contratos externos, pausar y preguntar.
- Si una inconsistencia ya tiene decision definida en `SKILL.md`, aplicar la decision sin volver a preguntar.

## Flujo de trabajo minimo

1. Leer `SKILL.md`.
2. Ubicar el punto de entrada: router, contrato gRPC, controller, usecase, repository, cliente o config.
3. Seguir la cadena completa del flujo afectado.
4. Identificar contratos publicos y datos persistidos que puedan cambiar.
5. Presentar un plan breve cuando el cambio sea amplio, ambiguo o toque contratos.
6. Implementar respetando capas y nombres definidos en `SKILL.md`.
7. Crear o usar validadores Zod cuando correspondan.
8. Mantener respuestas HTTP con `fetchResponse`.
9. Mantener errores esperados con `{ error }` en casos de uso y `CustomError` en controladores.
10. Ejecutar validacion disponible: `npm run lint`, `npm test` y `npm run build` cuando aplique.
11. Entregar resumen de cambios, pruebas ejecutadas y riesgos restantes.

## Arquitectura obligatoria

Flujo REST esperado:

```text
src/app.js
  -> src/adapters/routers
  -> src/adapters/controllers
  -> src/usecases/<domain>
  -> src/domain/entities / src/domain/repositories
  -> src/infrastructure/services / src/adapters/databases
  -> fetchResponse
```

Flujo gRPC esperado cuando exista:

```text
proto/*.proto
  -> src/adapters/gRPC/*Service.js
  -> src/usecases/<domain>
  -> src/domain/repositories
  -> src/infrastructure/services
```

Reglas de capa:

- `src/app.js` concentra bootstrap, middlewares globales, montaje de routers, conexiones y arranque.
- `src/adapters/routers` solo conecta rutas, middlewares de transporte y controladores.
- `src/adapters/controllers` llama casos de uso, convierte errores y responde con `fetchResponse`.
- `src/usecases/<domain>` contiene logica de aplicacion, validacion y orquestacion.
- `src/domain/entities` contiene entidades simples.
- `src/domain/repositories` encapsula persistencia.
- `src/infrastructure/services` contiene clientes y conexiones externas.
- `src/adapters/databases` contiene modelos ORM/ODM cuando el proyecto los ubica alli.
- `src/adapters/web/validators` contiene schemas Zod reutilizables.
- `src/utils` contiene utilidades compartidas.

No llamar bases de datos, GridFS, OpenRouter, Axios externo ni clientes de infraestructura directamente desde routers.

## Convenciones obligatorias

- Usar ESM con imports relativos y extension `.js`.
- Usar named exports.
- Usar `src/infrastructure/services`; si existe `src/infraestructure`, migrar con refactor coordinado de imports.
- Usar `src/utils/http_error_codes.js` como archivo estandar de codigos HTTP.
- Usar `SystemLogRepositoryImpl.js` como repositorio estandar de logs.
- Montar siempre `logsRouter` cuando exista modulo de logs. Si requiere proteccion, agregar middleware o restriccion por configuracion.
- Usar `*Router.js` para routers padre o generales.
- Usar `*.route.js` para rutas hijas, pequenas o especificas.
- Usar controllers claros con sufijo `Controller`, por ejemplo `createChatController`, `getFilesController`, `streamMediaController`, `getSystemLogsController`.
- Evitar nombres invertidos o ambiguos como `controllerGetAllLogs` en codigo nuevo.
- Crear y usar validadores cuando la entrada lo requiera. No dejar schemas Zod desconectados.

## Restricciones por dominio

### Files

- Mantener uploads multipart con Multer en router.
- Mantener GridFS, buffers y streaming dentro de repositorios o servicios especializados.
- Para rangos o streaming, revisar helpers de `Range`, limites y `pipeline`.
- No loguear buffers, chunks, archivos completos ni metadata sensible.

### Chats

- Validar IDs MongoDB antes de consultar repositorios.
- Mantener metadata de sistema en schemas/entidades.
- No consultar Mongoose desde controladores ni routers.

### Logs

- Usar `SystemLog`, `SystemLogModel` y `SystemLogRepositoryImpl`.
- Usar Zod para creacion y paginacion.
- Montar `logsRouter` siempre que exista el modulo.
- Si los logs no deben exponerse publicamente, proteger la ruta.

### IA / LLM

- Centralizar clientes OpenAI/OpenRouter en `src/infrastructure/services`.
- Centralizar modelos y constantes en `config`.
- Construir prompts reutilizables en `src/prompts`.
- Validar entradas antes de construir prompts.
- Parsear respuestas JSON de LLM con helper robusto.
- No duplicar clientes LLM o HTTP dentro de casos de uso.

## Seguridad y secretos

- Nunca exponer valores reales de `.env`.
- No copiar credenciales reales a documentacion, logs, errores ni respuestas.
- Sanitizar logs de configuracion.
- No imprimir cadenas de conexion completas.
- No imprimir headers `authorization`.
- No imprimir payloads completos, buffers o chunks.
- Si se detecta filtracion existente, reportarla. Corregirla solo si entra en el alcance de la tarea o el usuario lo solicita.

## Comandos

Usar los scripts reales del `package.json` del repositorio. Los comandos comunes son:

- `npm start`: arranque normal con `.env`.
- `npm run dev`: desarrollo local con `.env.development` y watch.
- `npm run lint`: validacion minima antes de entregar codigo.
- `npm test`: tests Vitest cuando existan o se agreguen.
- `npm run build`: build/ofuscacion solo si el entregable o despliegue lo requiere.

Si un comando requiere servicios externos, variables reales o bases de datos no disponibles, indicarlo en el resumen.

## PR y commits

- Mantener commits pequenos y enfocados.
- Usar titulos breves, descriptivos e imperativos.
- Conventional Commits son aceptables cuando aportan claridad, por ejemplo `feat: ...` o `fix: ...`.
- En PR o resumen final, incluir proposito, capas afectadas, pruebas ejecutadas y riesgos/contratos modificados.
- Si no existe plantilla de PR o politica de ramas, no inventarla; preguntar si la tarea depende de eso.

## Preguntas antes de proceder

Preguntar solo cuando la decision no pueda inferirse de `SKILL.md`, del codigo o de una instruccion previa del usuario.

Preguntar si:

- Hay que cambiar un contrato publico.
- Hay que introducir autenticacion/autorizacion.
- Hay que decidir si una ruta de logs es publica, interna o protegida.
- Hay que eliminar dependencias cuyo uso podria estar fuera del repositorio visible.
- Hay que modificar persistencia o migrar datos existentes.
- Hay que hacer un refactor transversal.
- Hay que cambiar el comportamiento de prompts o respuestas de IA.

No preguntar si `SKILL.md` ya define la regla aplicable.
