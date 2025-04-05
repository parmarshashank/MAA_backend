import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleAuth';

const router = Router();
const prisma = new PrismaClient();

// Get All Users (Admin only)
router.get('/users', authenticate, requireRole(['ADMIN']), async (_req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Update User Role (Admin only)
router.patch('/users/:id/role', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!role || !['ADMIN', 'DOCTOR', 'PATIENT'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        
        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role' });
    }
});

export default router; 