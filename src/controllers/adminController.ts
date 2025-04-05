import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Register admin
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Check if admin already exists
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
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Error creating admin' });
    }
};

// Admin login
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
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
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

// Get admin profile
export const getAdminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.user!;

        const admin = await prisma.admin.findUnique({
            where: { id: userId },
            include: {
                hospitals: true
            }
        });

        if (!admin) {
            res.status(404).json({ message: 'Admin not found' });
            return;
        }

        const { password, ...adminData } = admin;
        res.json(adminData);
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Error fetching admin profile' });
    }
};

// Create doctor (Admin only)
export const createDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, hospitalId } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const doctor = await prisma.doctor.create({
            data: {
                name,
                email,
                password: hashedPassword,
                hospitalId
            }
        });

        const { password: _, ...doctorData } = doctor;
        res.status(201).json(doctorData);
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).json({ message: 'Error creating doctor' });
    }
};

// Create pharmacist (Admin only)
export const createPharmacist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, hospitalId } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const pharmacist = await prisma.pharmacist.create({
            data: {
                name,
                email,
                password: hashedPassword,
                hospitalId
            }
        });

        const { password: _, ...pharmacistData } = pharmacist;
        res.status(201).json(pharmacistData);
    } catch (error) {
        console.error('Error creating pharmacist:', error);
        res.status(500).json({ message: 'Error creating pharmacist' });
    }
}; 