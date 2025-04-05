import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
export const JWT_EXPIRES_IN = '24h'; 