import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { SectorController } from "./sector.controller";

const router = Router();

// Public routes (for students to get active sectors)
router.get("/", SectorController.getAll);
router.get("/subjects", SectorController.getAvailableSubjects);
router.get("/:id", SectorController.getById);

// Admin routes (protected)
router.get("/admin/all", authenticate, SectorController.getAllForAdmin);
router.post("/", authenticate, SectorController.create);
router.put("/:id", authenticate, SectorController.update);
router.delete("/:id", authenticate, SectorController.delete);

export default router;