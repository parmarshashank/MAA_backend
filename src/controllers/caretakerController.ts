import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

interface CreateCaretakerBody {
    name: string;
    contact: string;
}

export const createCaretaker = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, contact } = req.body as CreateCaretakerBody;
        
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
};

export const getAllCaretakers = async (_req: AuthRequest, res: Response): Promise<void> => {
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
};

export const getCaretakerById = async (req: AuthRequest, res: Response): Promise<void> => {
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
            res.status(404).json({ message: 'Caretaker not found' });
            return;
        }
        
        res.json(caretaker);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching caretaker' });
    }
};

export const updateCaretaker = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, contact } = req.body as CreateCaretakerBody;
        
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
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Caretaker not found' });
            return;
        }
        res.status(500).json({ message: 'Error updating caretaker' });
    }
};

export const deleteCaretaker = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        await prisma.caretaker.delete({
            where: { id }
        });
        
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Caretaker not found' });
            return;
        }
        res.status(500).json({ message: 'Error deleting caretaker' });
    }
}; 