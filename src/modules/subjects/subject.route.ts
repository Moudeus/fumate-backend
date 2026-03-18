import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { SubjectController } from "./subject.controller";

const router = Router();

// Public routes (for students to get active subjects)
router.get("/", SubjectController.getAll);
router.get("/:id", SubjectController.getById);

// Admin routes (protected)
router.get("/admin/all", authenticate, SubjectController.getAllForAdmin);
router.post("/", authenticate, SubjectController.create);
router.put("/:id", authenticate, SubjectController.update);
router.delete("/:id", authenticate, SubjectController.delete);

export default router;