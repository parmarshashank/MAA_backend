import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireUserType } from '../middleware/roleAuth';
import {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    createDoctor,
    createPharmacist
} from '../controllers/adminController';

const router = Router();

// Admin registration and login routes (public)
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected admin routes
router.get('/me', authenticate, requireUserType(['ADMIN']), getAdminProfile);
router.post('/doctors', authenticate, requireUserType(['ADMIN']), createDoctor);
router.post('/pharmacists', authenticate, requireUserType(['ADMIN']), createPharmacist);

export default router; 