import dotenv from 'dotenv';
import { mongo } from 'mongoose';

dotenv.config();
const config = {
    port: process.env.PORT || 3000,
    clientAppUrl: process.env.CLIENT_APP_URL || 'http://localhost:5173',
    session: {
        secret: process.env.SESSION_SECRET || 'your_session_secret_here',
    },
    mongoDB: {
        mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/collab-desk',
    },
    cors: {
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',')
            : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
        credentials: process.env.CORS_CREDENTIALS ? process.env.CORS_CREDENTIALS === 'true' : true,
        headers: process.env.CORS_HEADERS ? process.env.CORS_HEADERS.split(',') : ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
};
export default config;