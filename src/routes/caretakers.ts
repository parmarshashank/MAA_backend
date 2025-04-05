import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';

const router = Router();
const prisma = new PrismaClient();

// Create caretaker (Doctors only)
router.post('/', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
    try {
        const { name, contact } = req.body;
        
        const caretaker = await prisma.caretaker.create({
            data: {
                name,
                contact
            },
            include: {
                patients: true
            }
        });
        
        res.status(201).json(caretaker);
    } catch (error) {
        res.status(500).json({ message: 'Error creating caretaker' });
    }
});

// Get all caretakers (Doctors only)
router.get('/', authenticate, requireUserType(['DOCTOR']), async (_req: AuthRequest, res: Response) => {
    try {
        const caretakers = await prisma.caretaker.findMany({
            include: {
                patients: true
            }
        });
        
        res.json(caretakers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching caretakers' });
    }
});

// Get caretaker by ID (Doctors only)
router.get('/:id', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        const caretaker = await prisma.caretaker.findUnique({
            where: { id },
            include: {
                patients: {
                    include: {
                        prescriptions: {
                            include: {
                                items: {
                                    include: {
                                        medicine: true,
                                        schedule: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        if (!caretaker) {
            return res.status(404).json({ message: 'Caretaker not found' });
        }
        
        res.json(caretaker);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching caretaker' });
    }
});

// Update caretaker (Doctors only)
router.put('/:id', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, contact } = req.body;
        
        const caretaker = await prisma.caretaker.update({
            where: { id },
            data: {
                name,
                contact
            },
            include: {
                patients: true
            }
        });
        
        res.json(caretaker);
    } catch (error) {
                //@ts-ignore
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Caretaker not found' });
        }
        res.status(500).json({ message: 'Error updating caretaker' });
    }
});

// Delete caretaker (Doctors only)
router.delete('/:id', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        await prisma.caretaker.delete({
            where: { id }
        });
        
        res.status(204).send();
    } catch (error) {
        //@ts-ignore
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Caretaker not found' });
        }
        res.status(500).json({ message: 'Error deleting caretaker' });
    }
});

export default router; 