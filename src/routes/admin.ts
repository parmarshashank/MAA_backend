import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';
import {
    registerAdmin,
    getAdminProfile,
    createDoctor,
    createPharmacist
} from '../controllers/adminController';

const router = Router();

// Public admin routes
router.post('/register', registerAdmin);

// Protected admin routes
router.get('/me', authenticate, requireUserType(['ADMIN']), getAdminProfile);
router.post('/doctors', authenticate, requireUserType(['ADMIN']), createDoctor);
router.post('/pharmacists', authenticate, requireUserType(['ADMIN']), createPharmacist);

export default router; 