import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

type UserType = 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

export const requireUserType = (allowedTypes: UserType[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userType = req.user?.userType;
            
            if (!userType || !allowedTypes.includes(userType)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }
            
            next();
        } catch (error) {
            res.status(500).json({ message: 'Error checking permissions' });
        }
    };
}; 