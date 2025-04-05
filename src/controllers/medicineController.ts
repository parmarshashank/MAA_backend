import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

interface CreateMedicineBody {
    name: string;
    description: string;
}

export const createMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body as CreateMedicineBody;
        
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
};

export const getAllMedicines = async (_req: Request, res: Response): Promise<void> => {
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
};

export const getMedicinesByHospital = async (req: Request, res: Response): Promise<void> => {
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
};

export const getMedicineById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const medicine = await prisma.medicine.findUnique({
            where: { id },
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

        if (!medicine) {
            res.status(404).json({ message: 'Medicine not found' });
            return;
        }
        
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching medicine' });
    }
};

export const updateMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description } = req.body as CreateMedicineBody;
        
        const medicine = await prisma.medicine.update({
            where: { 
                id,
                pharmacistId: req.user!.userId // Ensure only the creator can update
            },
            data: {
                name,
                description
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
        
        res.json(medicine);
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Medicine not found or unauthorized' });
            return;
        }
        res.status(500).json({ message: 'Error updating medicine' });
    }
};

export const deleteMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        await prisma.medicine.delete({
            where: { 
                id,
                pharmacistId: req.user!.userId // Ensure only the creator can delete
            }
        });
        
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Medicine not found or unauthorized' });
            return;
        }
        res.status(500).json({ message: 'Error deleting medicine' });
    }
}; 