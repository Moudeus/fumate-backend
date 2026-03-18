import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { AdmissionRequirementController } from "./admission-requirement.controller";

const router = Router();

// Public routes (for students to get admission requirements)
router.get("/", AdmissionRequirementController.getAll);
router.get("/years", AdmissionRequirementController.getAcademicYears);
router.get("/:id", AdmissionRequirementController.getById);
router.get("/university/:universityId/major/:majorId", AdmissionRequirementController.getByUniversityAndMajor);

// Admin routes (protected)
router.get("/admin/all", authenticate, AdmissionRequirementController.getAllForAdmin);
router.post("/", authenticate, AdmissionRequirementController.create);
router.put("/:id", authenticate, AdmissionRequirementController.update);
router.delete("/:id", authenticate, AdmissionRequirementController.delete);

export default router;