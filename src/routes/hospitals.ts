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

// Create Hospital (Admin only)
router.post('/', authenticate, requireUserType(['ADMIN']), createHospital);

// Update Hospital (Admin only)
router.put('/:id', authenticate, requireUserType(['ADMIN']), updateHospital);

// Delete Hospital (Admin only)
router.delete('/:id', authenticate, requireUserType(['ADMIN']), deleteHospital);

export default router; 