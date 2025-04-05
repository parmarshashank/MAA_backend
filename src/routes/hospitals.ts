import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';

const router = Router();
const prisma = new PrismaClient();

// Get All Hospitals
router.get('/', async (_req: Request, res: Response) => {
    try {
        const hospitals = await prisma.hospital.findMany({
            include: {
                _count: {
                    select: {
                        doctors: true,
                        pharmacists: true
                    }
                }
            }
        });
        
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hospitals' });
    }
});

// Get Hospital Details
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const hospital = await prisma.hospital.findUnique({
            where: { id },
            include: {
                doctors: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                pharmacists: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        
        res.json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hospital details' });
    }
});

// Create Hospital
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        
        const hospital = await prisma.hospital.create({
            data: {
                name
            }
        });
        
        res.status(201).json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Error creating hospital' });
    }
});

export default router; 