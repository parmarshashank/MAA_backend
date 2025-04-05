import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';

const router = Router();
const prisma = new PrismaClient();

// Create patient (Doctors only)
router.post('/', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
    try {
        const { name, age, dob, gender, firebaseToken, caretakerId } = req.body;
        
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
    } catch (error) {
        res.status(500).json({ message: 'Error creating patient' });
    }
});

// Get all patients (Doctors only)
router.get('/', authenticate, requireUserType(['DOCTOR']), async (_req: AuthRequest, res: Response) => {
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
});

// Get patient by ID (Doctors only)
router.get('/:id', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
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
            return res.status(404).json({ message: 'Patient not found' });
        }
        
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient' });
    }
});

// Update patient (Doctors only)
router.put('/:id', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, age, dob, gender, firebaseToken, caretakerId } = req.body;
        
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
    } catch (error) {
                //@ts-ignore

        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(500).json({ message: 'Error updating patient' });
    }
});

// Delete patient (Doctors only)
router.delete('/:id', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        await prisma.patient.delete({
            where: { id }
        });
        
        res.status(204).send();
    } catch (error) {
                //@ts-ignore
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(500).json({ message: 'Error deleting patient' });
    }
});

export default router; 