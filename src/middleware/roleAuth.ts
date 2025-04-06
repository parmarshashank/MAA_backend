import { Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from './authMiddleware';

type UserType = 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

export const requireUserType = (allowedTypes: UserType[]): RequestHandler => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        try {
            const userType = req.user?.userType;
            
            if (!userType || !allowedTypes.includes(userType)) {
                res.status(403).json({ message: 'Insufficient permissions' });
                return;
            }
            
            next();
        } catch (error) {
            res.status(500).json({ message: 'Error checking permissions' });
        }
    };
}; 