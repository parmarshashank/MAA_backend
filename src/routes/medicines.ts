import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';

const router = Router();
const prisma = new PrismaClient();

// Add Medicine (Pharmacist only)
router.post('/', authenticate, requireUserType(['PHARMACIST']), async (req: AuthRequest, res: Response) => {
    try {
        const { name, description } = req.body;
        
        const medicine = await prisma.medicine.create({
            data: {
                name,
                description,
                pharmacistId: req.user!.userId
            },
            include: {
                pharmacist: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        res.status(201).json(medicine);
    } catch (error) {
        res.status(500).json({ message: 'Error creating medicine' });
    }
});

// Get All Medicines (Public)
router.get('/', async (_req: Request, res: Response) => {
    try {
        const medicines = await prisma.medicine.findMany({
            include: {
                pharmacist: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        hospital: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching medicines' });
    }
});

// Get Medicines by Hospital
router.get('/hospital/:hospitalId', async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.params;
        
        const medicines = await prisma.medicine.findMany({
            where: {
                pharmacist: {
                    hospitalId
                }
            },
            include: {
                pharmacist: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        hospital: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching medicines' });
    }
});

export default router; 