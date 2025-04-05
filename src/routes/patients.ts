import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { requireUserType } from "../middleware/roleAuth";
import {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient
} from "../controllers/patientController";

const router = Router();

// Create patient (Doctors only)
router.post("/", authenticate, requireUserType(['DOCTOR']), createPatient);

// Get all patients (Doctors only)
router.get("/", authenticate, requireUserType(['DOCTOR']), getAllPatients);

// Get patient by ID (Doctors only)
router.get("/:id", authenticate, requireUserType(['DOCTOR']), getPatientById);

// Update patient (Doctors only)
router.put("/:id", authenticate, requireUserType(['DOCTOR']), updatePatient);

// Delete patient (Doctors only)
router.delete("/:id", authenticate, requireUserType(['DOCTOR']), deletePatient);

export default router; 