import { Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import { SERVER_CONFIG } from '../config/server';

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

type UserType = 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

// Admin Authentication
export const registerAdmin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        const existingAdmin = await prisma.admin.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            res.status(400).json({ message: 'Admin with this email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign(
            { userId: admin.id, userType: 'ADMIN' },
            SERVER_CONFIG.JWT_SECRET,
            { expiresIn: SERVER_CONFIG.JWT_EXPIRES_IN }
        );

        const { password: _, ...adminData } = admin;
        res.status(201).json({ token, user: adminData });
    } catch (error) {
        console.error('Error in admin registration:', error);
        res.status(500).json({ message: 'Error registering admin' });
    }
};

export const loginAdmin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { email, password } = req.body;

        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: admin.id, userType: 'ADMIN' },
            SERVER_CONFIG.JWT_SECRET,
            { expiresIn: SERVER_CONFIG.JWT_EXPIRES_IN }
        );

        const { password: _, ...adminData } = admin;
        res.json({ token, user: adminData });
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

// Doctor Authentication
export const registerDoctor: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        const existingDoctor = await prisma.doctor.findUnique({
            where: { email }
        });

        if (existingDoctor) {
            res.status(400).json({ message: 'Doctor with this email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const doctor = await prisma.doctor.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign(
            { userId: doctor.id, userType: 'DOCTOR' },
            SERVER_CONFIG.JWT_SECRET,
            { expiresIn: SERVER_CONFIG.JWT_EXPIRES_IN }
        );

        const { password: _, ...doctorData } = doctor;
        res.status(201).json({ token, user: doctorData });
    } catch (error) {
        console.error('Error in doctor registration:', error);
        res.status(500).json({ message: 'Error registering doctor' });
    }
};

export const loginDoctor: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { email, password } = req.body;

        const doctor = await prisma.doctor.findUnique({
            where: { email }
        });

        if (!doctor) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const validPassword = await bcrypt.compare(password, doctor.password);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: doctor.id, userType: 'DOCTOR' },
            SERVER_CONFIG.JWT_SECRET,
            { expiresIn: SERVER_CONFIG.JWT_EXPIRES_IN }
        );

        const { password: _, ...doctorData } = doctor;
        res.json({ token, user: doctorData });
    } catch (error) {
        console.error('Error in doctor login:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

// Pharmacist Authentication
export const registerPharmacist: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        const existingPharmacist = await prisma.pharmacist.findUnique({
            where: { email }
        });

        if (existingPharmacist) {
            res.status(400).json({ message: 'Pharmacist with this email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const pharmacist = await prisma.pharmacist.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign(
            { userId: pharmacist.id, userType: 'PHARMACIST' },
            SERVER_CONFIG.JWT_SECRET,
            { expiresIn: SERVER_CONFIG.JWT_EXPIRES_IN }
        );

        const { password: _, ...pharmacistData } = pharmacist;
        res.status(201).json({ token, user: pharmacistData });
    } catch (error) {
        console.error('Error in pharmacist registration:', error);
        res.status(500).json({ message: 'Error registering pharmacist' });
    }
};

export const loginPharmacist: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { email, password } = req.body;

        const pharmacist = await prisma.pharmacist.findUnique({
            where: { email }
        });

        if (!pharmacist) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const validPassword = await bcrypt.compare(password, pharmacist.password);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: pharmacist.id, userType: 'PHARMACIST' },
            SERVER_CONFIG.JWT_SECRET,
            { expiresIn: SERVER_CONFIG.JWT_EXPIRES_IN }
        );

        const { password: _, ...pharmacistData } = pharmacist;
        res.json({ token, user: pharmacistData });
    } catch (error) {
        console.error('Error in pharmacist login:', error);
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
  