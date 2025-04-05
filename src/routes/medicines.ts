import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';
import {
    createMedicine,
    getAllMedicines,
    getMedicinesByHospital,
    getMedicineById,
    updateMedicine,
    deleteMedicine
} from '../controllers/medicineController';

const router = Router();

// Add Medicine (Pharmacist only)
router.post('/', authenticate, requireUserType(['PHARMACIST']), createMedicine);

// Get All Medicines (Public)
router.get('/', getAllMedicines);

// Get Medicine by ID (Public)
router.get('/:id', getMedicineById);

// Get Medicines by Hospital (Public)
router.get('/hospital/:hospitalId', getMedicinesByHospital);

// Update Medicine (Pharmacist only, creator only)
router.put('/:id', authenticate, requireUserType(['PHARMACIST']), updateMedicine);

// Delete Medicine (Pharmacist only, creator only)
router.delete('/:id', authenticate, requireUserType(['PHARMACIST']), deleteMedicine);

export default router; 