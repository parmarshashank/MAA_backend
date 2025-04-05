import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '../config/jwt';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        userType: 'DOCTOR' | 'PHARMACIST';
        hospitalId: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            userType: 'DOCTOR' | 'PHARMACIST';
            hospitalId: string;
        };
        
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
