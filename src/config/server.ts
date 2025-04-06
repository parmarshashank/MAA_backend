import dotenv from 'dotenv';

dotenv.config();

export const SERVER_CONFIG = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: '*',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};

export const CORS_CONFIG = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}; 