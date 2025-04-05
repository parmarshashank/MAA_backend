import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
    hospitalId: string;
}

interface LoginRequestBody {
    email: string;
    password: string;
}

type UserType = 'DOCTOR' | 'PHARMACIST';

export const register = async (
    req: Request<{ role: string }, any, RegisterRequestBody>,
    res: Response
): Promise<void> => {
    try {
        const { name, email, password, hospitalId } = req.body;
        const { role } = req.params;
        const userType = role.toUpperCase() as UserType;

        if (!['doctor', 'pharmacist'].includes(role.toLowerCase())) {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        let user;
        if (userType === 'DOCTOR') {
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
            { userId: user.id, userType, hospitalId },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                userType,
                hospitalId 
            } 
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }
        res.status(500).json({ message: 'Error creating user' });
    }
};

export const login = async (
    req: Request<{ role: string }, any, LoginRequestBody>,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;
        const { role } = req.params;
        const userType = role.toUpperCase() as UserType;

        if (!['doctor', 'pharmacist'].includes(role.toLowerCase())) {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }

        let user;
        if (userType === 'DOCTOR') {
            user = await prisma.doctor.findUnique({ where: { email } });
        } else {
            user = await prisma.pharmacist.findUnique({ where: { email } });
        }

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, userType, hospitalId: user.hospitalId },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                userType,
                hospitalId: user.hospitalId 
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
};

export const getMe = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { userId, userType, hospitalId } = req.user!;
        
        let user;
        if (userType === 'DOCTOR') {
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
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ ...user, userType, hospitalId });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
};
  