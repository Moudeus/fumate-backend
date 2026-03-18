import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate } from "../../middlewares/authMiddleware";
import { authorize } from "../../middlewares/roleMiddleware";

const router = Router();

// Admin routes
router.get("/admin/stats", authenticate, authorize("admin"), UserController.getAdminStats);
router.get("/admin/all", authenticate, authorize("admin"), UserController.getAllUsers);

// User routes
router.get("/me", authenticate, UserController.getCurrentUser);
router.get("/:id", authenticate, UserController.getUserById);

export default router;
