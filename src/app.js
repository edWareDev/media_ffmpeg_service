import express from 'express';
import helmet from 'helmet';
import { v2Router } from './adapters/routers/v2Router.js';
import { routeNotFoundMiddleware } from './adapters/web/middlewares/routeNotFoundMiddleware.js';
import { errorMiddleware } from './adapters/web/middlewares/errorMiddleware.js';

export const app = express();

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v2', v2Router);

app.use(routeNotFoundMiddleware);
app.use(errorMiddleware);
