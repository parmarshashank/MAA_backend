import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SERVER_CONFIG, CORS_CONFIG } from './config/server';

// Route imports
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import medicineRoutes from './routes/medicines';
import prescriptionRoutes from './routes/prescriptions';
import hospitalRoutes from './routes/hospitals';
import patientRoutes from './routes/patients';
import caretakerRoutes from './routes/caretakers';

dotenv.config();

const app = express();

// Middleware
app.use(cors(CORS_CONFIG));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (SERVER_CONFIG.NODE_ENV === 'development') {
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date(),
        environment: SERVER_CONFIG.NODE_ENV
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/caretakers', caretakerRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(SERVER_CONFIG.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.url} not found`
    });
});

// Start server
app.listen(SERVER_CONFIG.PORT, () => {
    console.log(`Server running in ${SERVER_CONFIG.NODE_ENV} mode on port ${SERVER_CONFIG.PORT}`);
    console.log(`Health check available at http://localhost:${SERVER_CONFIG.PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, you might want to exit the process
    if (SERVER_CONFIG.NODE_ENV === 'production') {
        process.exit(1);
    }
}); 