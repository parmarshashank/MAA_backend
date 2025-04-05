import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';
import {
    createPrescription,
    getDoctorPrescriptions,
    getPatientPrescriptions,
    acknowledgeSchedule
} from '../controllers/prescriptionController';

const router = Router();

// Create Prescription (Doctor only)
router.post('/', authenticate, requireUserType(['DOCTOR']), createPrescription);

// Get Prescriptions (Doctor sees their prescriptions)
router.get('/', authenticate, requireUserType(['DOCTOR']), getDoctorPrescriptions);

// Get Patient's Prescriptions
router.get('/patient/:patientId', authenticate, requireUserType(['DOCTOR']), getPatientPrescriptions);

// Acknowledge Medication Schedule
router.post('/schedule/:scheduleId/acknowledge', authenticate, acknowledgeSchedule);

export default router;