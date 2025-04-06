import { Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import { SERVER_CONFIG } from '../config/server';

const prisma = new PrismaClient();

// Register admin
export const registerAdmin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Check if admin already exists
                    //@ts-ignore

        const existingAdmin = await prisma.admin.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            res.status(400).json({ message: 'Admin with this email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
                    //@ts-ignore

        const admin = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign(
            { userId: admin.id, userType: 'ADMIN' } as jwt.JwtPayload,
            SERVER_CONFIG.JWT_SECRET,
            { expiresIn: SERVER_CONFIG.JWT_EXPIRES_IN } as jwt.SignOptions
        );

        const { password: _, ...adminData } = admin;
        res.status(201).json({ 
            token,
            admin: adminData
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Error creating admin' });
    }
};

// Get admin profile
export const getAdminProfile: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.user!;
            //@ts-ignore

        const admin = await prisma.admin.findUnique({
            where: { id: userId }
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
export const createDoctor: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const doctor = await prisma.doctor.create({
                        //@ts-ignore

            data: {
                name,
                email,
                password: hashedPassword
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
export const createPharmacist: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const pharmacist = await prisma.pharmacist.create({
            //@ts-ignore
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const { password: _, ...pharmacistData } = pharmacist;
        res.status(201).json(pharmacistData);
    } catch (error) {
        console.error('Error creating pharmacist:', error);
        res.status(500).json({ message: 'Error creating pharmacist' });
    }
}; 