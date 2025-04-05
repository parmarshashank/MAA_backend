import { Response } from 'express';
import { PrismaClient, ScheduleStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

interface PrescriptionItem {
    medicineId: string;
    dosage: string;
    frequency: string;
    duration: number;
}

interface CreatePrescriptionBody {
    patientId: string;
    items: PrescriptionItem[];
}

interface AcknowledgeScheduleBody {
    status: ScheduleStatus;
}

// Helper function to generate medication schedule
function generateSchedule(frequency: string, duration: number) {
    const schedule = [];
    const now = new Date();
    const timesPerDay = getTimesPerDay(frequency);
    
    for (let day = 0; day < duration; day++) {
        for (let time = 0; time < timesPerDay; time++) {
            const scheduledAt = new Date(now);
            scheduledAt.setDate(scheduledAt.getDate() + day);
            scheduledAt.setHours(8 + (time * (24 / timesPerDay)), 0, 0, 0);
            
            schedule.push({
                scheduledAt
            });
        }
    }
    
    return schedule;
}

function getTimesPerDay(frequency: string): number {
    switch (frequency.toLowerCase()) {
        case 'once a day':
            return 1;
        case 'twice a day':
            return 2;
        case 'three times a day':
            return 3;
        case 'four times a day':
            return 4;
        default:
            return 1;
    }
}

export const createPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { patientId, items } = req.body as CreatePrescriptionBody;

        // Validate patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            res.status(404).json({ message: 'Patient not found' });
            return;
        }

        // Validate all medicines exist
        const medicineIds = items.map(item => item.medicineId);
        const medicines = await prisma.medicine.findMany({
            where: {
                id: {
                    in: medicineIds
                }
            }
        });

        if (medicines.length !== medicineIds.length) {
            res.status(400).json({ message: 'One or more medicines not found' });
            return;
        }
        
        const prescription = await prisma.prescription.create({
            data: {
                doctorId: req.user!.userId,
                patientId,
                items: {
                    create: items.map(item => ({
                        medicineId: item.medicineId,
                        dosage: item.dosage,
                        frequency: item.frequency,
                        duration: item.duration,
                        schedule: {
                            create: generateSchedule(item.frequency, item.duration)
                        }
                    }))
                }
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        age: true,
                        gender: true
                    }
                },
                doctor: {
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
                },
                items: {
                    include: {
                        medicine: true,
                        schedule: true
                    }
                }
            }
        });
        
        res.status(201).json(prescription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating prescription' });
    }
};

export const getDoctorPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const prescriptions = await prisma.prescription.findMany({
            where: {
                doctorId: req.user!.userId
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        age: true,
                        gender: true
                    }
                },
                items: {
                    include: {
                        medicine: true,
                        schedule: {
                            orderBy: {
                                scheduledAt: 'asc'
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching prescriptions' });
    }
};

export const getPatientPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;

        // Validate patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            res.status(404).json({ message: 'Patient not found' });
            return;
        }
        
        const prescriptions = await prisma.prescription.findMany({
            where: {
                patientId
            },
            include: {
                doctor: {
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
                },
                items: {
                    include: {
                        medicine: true,
                        schedule: {
                            orderBy: {
                                scheduledAt: 'asc'
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient prescriptions' });
    }
};

export const acknowledgeSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { scheduleId } = req.params;
        const { status } = req.body as AcknowledgeScheduleBody;
        
        if (!['TAKEN', 'MISSED', 'SKIPPED'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        // First check if the schedule exists and get related prescription info
        const existingSchedule = await prisma.medicationSchedule.findUnique({
            where: { id: scheduleId },
            include: {
                prescriptionItem: {
                    include: {
                        prescription: {
                            include: {
                                patient: true
                            }
                        }
                    }
                }
            }
        });

        if (!existingSchedule) {
            res.status(404).json({ message: 'Schedule not found' });
            return;
        }
        
        const schedule = await prisma.medicationSchedule.update({
            where: { id: scheduleId },
            data: {
                status,
                acknowledgedAt: new Date()
            },
            include: {
                prescriptionItem: {
                    include: {
                        medicine: true,
                        prescription: {
                            include: {
                                patient: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error acknowledging schedule' });
    }
}; 