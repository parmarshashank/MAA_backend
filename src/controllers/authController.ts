import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
    role?: 'USER' | 'ADMIN';
}

interface LoginRequestBody {
    email: string;
    password: string;
}

export const register = async (
    req: Request<{}, any, RegisterRequestBody>,
    res: Response
): Promise<void> => {
    const { name, email, password, role = 'USER' } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
};

export const login = async (
    req: Request<{}, any, LoginRequestBody>,
    res: Response
): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
};

export const getMe = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
};
  