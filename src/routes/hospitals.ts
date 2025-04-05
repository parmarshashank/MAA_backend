import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';
import {
    getAllHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital
} from '../controllers/hospitalController';

const router = Router();

// Get All Hospitals (Public)
router.get('/', getAllHospitals);

// Get Hospital Details (Public)
router.get('/:id', getHospitalById);

// Create Hospital (Admin or Doctor)
router.post('/', authenticate, requireUserType(['ADMIN', 'DOCTOR']), createHospital);

// Update Hospital (Admin or Doctor)
router.put('/:id', authenticate, requireUserType(['ADMIN', 'DOCTOR']), updateHospital);

// Delete Hospital (Admin or Doctor)
router.delete('/:id', authenticate, requireUserType(['ADMIN', 'DOCTOR']), deleteHospital);

export default router; 