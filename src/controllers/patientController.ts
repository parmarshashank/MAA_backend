import { Response } from 'express';
import { PrismaClient, Gender } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

interface CreatePatientBody {
    name: string;
    age: number;
    dob: string;
    gender: Gender;
    firebaseToken: string;
    caretakerId?: string;
}

export const createPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, age, dob, gender, firebaseToken, caretakerId } = req.body as CreatePatientBody;
        
        const patient = await prisma.patient.create({
            data: {
                name,
                age,
                dob: new Date(dob),
                gender,
                firebaseToken,
                caretakerId
            },
            include: {
                caretaker: true,
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
        });
        
        res.status(201).json(patient);
    } catch (error: any) {
        if (error.code === 'P2003') {
            res.status(400).json({ message: 'Invalid caretaker ID' });
            return;
        }
        res.status(500).json({ message: 'Error creating patient' });
    }
};

export const getAllPatients = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const patients = await prisma.patient.findMany({
            include: {
                caretaker: true,
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
        });
        
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                caretaker: true,
                prescriptions: {
                    include: {
                        doctor: true,
                        items: {
                            include: {
                                medicine: true,
                                schedule: true
                            }
                        }
                    }
                }
            }
        });
        
        if (!patient) {
            res.status(404).json({ message: 'Patient not found' });
            return;
        }
        
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient' });
    }
};

export const updatePatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, age, dob, gender, firebaseToken, caretakerId } = req.body as CreatePatientBody;
        
        const patient = await prisma.patient.update({
            where: { id },
            data: {
                name,
                age,
                dob: new Date(dob),
                gender,
                firebaseToken,
                caretakerId
            },
            include: {
                caretaker: true,
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
        });
        
        res.json(patient);
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Patient not found' });
            return;
        }
        if (error.code === 'P2003') {
            res.status(400).json({ message: 'Invalid caretaker ID' });
            return;
        }
        res.status(500).json({ message: 'Error updating patient' });
    }
};

export const deletePatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        await prisma.patient.delete({
            where: { id }
        });
        
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Patient not found' });
            return;
        }
        res.status(500).json({ message: 'Error deleting patient' });
    }
}; 