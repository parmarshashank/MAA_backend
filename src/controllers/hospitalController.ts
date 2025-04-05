import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateHospitalBody {
    name: string;
}

export const getAllHospitals = async (_req: Request, res: Response): Promise<void> => {
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
};

export const getHospitalById = async (req: Request, res: Response): Promise<void> => {
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
            res.status(404).json({ message: 'Hospital not found' });
            return;
        }
        
        res.json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hospital details' });
    }
};

export const createHospital = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body as CreateHospitalBody;
        
        const hospital = await prisma.hospital.create({
            data: {
                name
            }
        });
        
        res.status(201).json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Error creating hospital' });
    }
};

export const updateHospital = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body as CreateHospitalBody;
        
        const hospital = await prisma.hospital.update({
            where: { id },
            data: {
                name
            },
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
        
        res.json(hospital);
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Hospital not found' });
            return;
        }
        res.status(500).json({ message: 'Error updating hospital' });
    }
};

export const deleteHospital = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        await prisma.hospital.delete({
            where: { id }
        });
        
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Hospital not found' });
            return;
        }
        if (error.code === 'P2003') {
            res.status(400).json({ message: 'Cannot delete hospital with associated doctors or pharmacists' });
            return;
        }
        res.status(500).json({ message: 'Error deleting hospital' });
    }
}; 