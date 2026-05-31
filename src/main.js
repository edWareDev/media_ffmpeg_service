import { env } from '../config/env.js';
import { app } from './app.js';
import { createShutdownHandler } from './bootstrap/shutdown.js';
import { startServer } from './bootstrap/startServer.js';
import { mediaQueue } from './infrastructure/services/jobQueueService.js';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/services/mongoDB.client.js';
import { redisConnection } from './infrastructure/services/redis.client.js';
import { ensureTmpDir } from './utils/fileSystem.js';
import { startMediaWorker } from './workers/mediaWorker.js';

const resources = {
    server: undefined,
    mediaWorker: undefined
};

const shutdown = createShutdownHandler({
    getResources: () => ({
        server: resources.server,
        workers: [resources.mediaWorker],
        queues: [mediaQueue],
        clients: [redisConnection],
        databases: [disconnectMongoDB]
    })
});

const registerProcessHandlers = () => {
    process.once('SIGTERM', () => {
        shutdown('SIGTERM');
    });
    process.once('SIGINT', () => {
        shutdown('SIGINT');
    });
    process.once('uncaughtException', (error) => {
        console.error('Excepción no controlada.', error.message);
        shutdown('uncaughtException', 1);
    });
    process.once('unhandledRejection', (reason) => {
        const message = reason instanceof Error ? reason.message : String(reason);
        console.error('Promesa rechazada no controlada.', message);
        shutdown('unhandledRejection', 1);
    });
};

const start = async () => {
    await ensureTmpDir();
    await connectMongoDB();
    resources.mediaWorker = startMediaWorker();
    resources.server = await startServer({ app, port: env.API_PORT });
};

if (process.env.NODE_ENV !== 'test') {
    registerProcessHandlers();

    start().catch((error) => {
        console.error('No se pudo iniciar el servicio.', error.message);
        process.exit(1);
    });
}
