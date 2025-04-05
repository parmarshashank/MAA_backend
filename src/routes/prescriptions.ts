import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';

const router = Router();
const prisma = new PrismaClient();

// Create Prescription (Doctor only)
router.post('/', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
    try {
        const { patientId, items } = req.body;
        
        const prescription = await prisma.prescription.create({
            data: {
                doctorId: req.user!.userId,
                patientId,
                items: {
                    create: items.map((item: any) => ({
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
});

// Get Prescriptions (Doctor sees their prescriptions)
router.get('/', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
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
                        schedule: true
                    }
                }
            }
        });
        
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching prescriptions' });
    }
});

// Get Patient's Prescriptions
router.get('/patient/:patientId', authenticate, requireUserType(['DOCTOR']), async (req: AuthRequest, res: Response) => {
    try {
        const { patientId } = req.params;
        
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
                        schedule: true
                    }
                }
            }
        });
        
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient prescriptions' });
    }
});

// Acknowledge Medication Schedule
router.post('/schedule/:scheduleId/acknowledge', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { scheduleId } = req.params;
        const { status } = req.body;
        
        if (!['TAKEN', 'MISSED', 'SKIPPED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
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
});

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

export default router; 