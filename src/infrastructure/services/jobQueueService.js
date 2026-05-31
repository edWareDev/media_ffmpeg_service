import { Queue } from 'bullmq';
import { redisConnection } from './redis.client.js';

export const mediaQueueName = 'media-processing';

export const mediaQueue = new Queue(mediaQueueName, {
    connection: redisConnection
});
