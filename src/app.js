import express from 'express';
import helmet from 'helmet';
import { env } from '../config/env.js';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/services/mongoDB.client.js';
import { mediaQueue } from './infrastructure/services/jobQueueService.js';
import { redisConnection } from './infrastructure/services/redis.client.js';
import { startMediaWorker } from './workers/mediaWorker.js';
import { v2Router } from './adapters/routers/v2Router.js';
import { routeNotFoundMiddleware } from './adapters/web/middlewares/routeNotFoundMiddleware.js';
import { errorMiddleware } from './adapters/web/middlewares/errorMiddleware.js';
import { ensureTmpDir } from './utils/fileSystem.js';

export const app = express();

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v2', v2Router);

app.use(routeNotFoundMiddleware);
app.use(errorMiddleware);

let server;
let mediaWorker;
let isShuttingDown = false;

const closeHttpServer = () => new Promise((resolve, reject) => {
    if (!server) {
        resolve();
        return;
    }

    server.close((error) => {
        if (error) {
            reject(error);
            return;
        }

        resolve();
    });
});

const shutdown = async (signal, exitCode = 0) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.info(`Cerrando servicio por ${signal}.`);

    const shutdownTimeout = setTimeout(() => {
        console.error('No se pudo cerrar el servicio dentro del tiempo esperado.');
        process.exit(1);
    }, 30000);
    shutdownTimeout.unref();

    try {
        await closeHttpServer();
        await mediaWorker?.close();
        await mediaQueue.close();
        await redisConnection.quit();
        await disconnectMongoDB();
        clearTimeout(shutdownTimeout);
        console.info('Servicio cerrado correctamente.');
        process.exit(exitCode);
    } catch (error) {
        clearTimeout(shutdownTimeout);
        console.error('Error durante el cierre del servicio.', error.message);
        process.exit(1);
    }
};

const start = async () => {
    await ensureTmpDir();
    await connectMongoDB();
    mediaWorker = startMediaWorker();
    server = app.listen(env.API_PORT, () => {
        console.info(`API REST escuchando en puerto ${env.API_PORT}.`);
    });
};

if (process.env.NODE_ENV !== 'test') {
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

    start().catch((error) => {
        console.error('No se pudo iniciar el servicio.', error.message);
        process.exit(1);
    });
}
