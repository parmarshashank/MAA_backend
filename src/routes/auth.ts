import { Router } from "express";
import {
    registerAdmin,
    loginAdmin,
    registerDoctor,
    loginDoctor,
    registerPharmacist,
    loginPharmacist,
    getMe
} from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Admin routes
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);

// Doctor routes
router.post('/doctor/register', registerDoctor);
router.post('/doctor/login', loginDoctor);

// Pharmacist routes
router.post('/pharmacist/register', registerPharmacist);
router.post('/pharmacist/login', loginPharmacist);

// Get current user info
router.get("/me", authenticate, getMe);

export default router;
