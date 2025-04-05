import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Register route for both doctors and pharmacists
router.post("/register/:role", async (req, res) => {
    try {
        const { name, email, password, hospitalId } = req.body;
        const { role } = req.params;

        if (!['doctor', 'pharmacist'].includes(role.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        let user;
        if (role.toLowerCase() === 'doctor') {
            user = await prisma.doctor.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    hospitalId
                }
            });
        } else {
            user = await prisma.pharmacist.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    hospitalId
                }
            });
        }

        const token = jwt.sign(
            { userId: user.id, role: role.toUpperCase() },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role } });
    } catch (error) {
                //@ts-ignore

        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login route for both doctors and pharmacists
router.post("/login/:role", async (req, res) => {
    try {
        const { email, password } = req.body;
        const { role } = req.params;

        if (!['doctor', 'pharmacist'].includes(role.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        let user;
        if (role.toLowerCase() === 'doctor') {
            user = await prisma.doctor.findUnique({ where: { email } });
        } else {
            user = await prisma.pharmacist.findUnique({ where: { email } });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: role.toUpperCase() },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role } });
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
});

// Get current user info
router.get("/me", authenticate, async (req, res) => {
    try {
                //@ts-ignore

        const { userId, role } = req.user!;
        
        let user;
        if (role === 'DOCTOR') {
            user = await prisma.doctor.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    hospital: true,
                    createdAt: true
                }
            });
        } else {
            user = await prisma.pharmacist.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    hospital: true,
                    createdAt: true
                }
            });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ ...user, role });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

export default router;
