import mongoose from 'mongoose';
import { env } from '../../../config/env.js';

export const connectMongoDB = async () => {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_CNX_STR);
    console.info('MongoDB conectado.');
};

export const disconnectMongoDB = async () => {
    await mongoose.disconnect();
};
