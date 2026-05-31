import express from 'express';
import helmet from 'helmet';
import { env } from '../config/env.js';
import { connectMongoDB } from './infrastructure/services/mongoDB.client.js';
import { startMediaWorker } from './workers/mediaWorker.js';
import { mediaRouter } from './adapters/routers/mediaRouter.js';
import { audioRouter } from './adapters/routers/audioRouter.js';
import { videoRouter } from './adapters/routers/videoRouter.js';
import { jobsRouter } from './adapters/routers/jobsRouter.js';
import { artifactsRouter } from './adapters/routers/artifactsRouter.js';
import { healthRouter } from './adapters/routers/healthRouter.js';
import { v2Router } from './adapters/routers/v2Router.js';
import { routeNotFoundMiddleware } from './adapters/web/middlewares/routeNotFoundMiddleware.js';
import { errorMiddleware } from './adapters/web/middlewares/errorMiddleware.js';
import { ensureTmpDir } from './utils/fileSystem.js';

export const app = express();

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', healthRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/audio', audioRouter);
app.use('/api/v1/video', videoRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/artifacts', artifactsRouter);
app.use('/api/v2', v2Router);

app.use(routeNotFoundMiddleware);
app.use(errorMiddleware);

const start = async () => {
    await ensureTmpDir();
    await connectMongoDB();
    startMediaWorker();
    app.listen(env.API_PORT, () => {
        console.info(`API REST escuchando en puerto ${env.API_PORT}.`);
    });
};

if (process.env.NODE_ENV !== 'test') {
    start().catch((error) => {
        console.error('No se pudo iniciar el servicio.', error.message);
        process.exit(1);
    });
}
