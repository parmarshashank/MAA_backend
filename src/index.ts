import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import medicineRoutes from './routes/medicines';
import prescriptionRoutes from './routes/prescriptions';
import hospitalRoutes from './routes/hospitals';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/medicines', medicineRoutes);
app.use('/prescriptions', prescriptionRoutes);
app.use('/hospitals', hospitalRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 