import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { authorize } from "../../middlewares/roleMiddleware";
import { CareerController } from "./career.controller";

const router = Router();

// Public routes
router.get("/", CareerController.getAll);
router.get("/:id", CareerController.getById);
router.get("/major/:majorId", CareerController.getByMajor);

// Protected routes (admin only)
router.post("/", authenticate, authorize("admin"), CareerController.create);
router.put("/:id", authenticate, authorize("admin"), CareerController.update);
router.delete("/:id", authenticate, authorize("admin"), CareerController.delete);

export default router;
