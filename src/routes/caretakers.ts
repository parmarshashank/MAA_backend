import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { requireUserType } from "../middleware/roleAuth";
import {
    createCaretaker,
    getAllCaretakers,
    getCaretakerById,
    updateCaretaker,
    deleteCaretaker
} from "../controllers/caretakerController";

const router = Router();

// Create caretaker (Doctors only)
router.post("/", authenticate, requireUserType(['DOCTOR']), createCaretaker);

// Get all caretakers (Doctors only)
router.get("/", authenticate, requireUserType(['DOCTOR']), getAllCaretakers);

// Get caretaker by ID (Doctors only)
router.get("/:id", authenticate, requireUserType(['DOCTOR']), getCaretakerById);

// Update caretaker (Doctors only)
router.put("/:id", authenticate, requireUserType(['DOCTOR']), updateCaretaker);

// Delete caretaker (Doctors only)
router.delete("/:id", authenticate, requireUserType(['DOCTOR']), deleteCaretaker);

export default router; 