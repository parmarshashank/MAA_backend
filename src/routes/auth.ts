import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Register route for both doctors and pharmacists
router.post("/register/:role", register);

// Login route for both doctors and pharmacists
router.post("/login/:role", login);

// Get current user info
router.get("/me", authenticate, getMe);

export default router;
