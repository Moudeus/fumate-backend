import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { NotificationController } from "./notification.controller";

const router = Router();

// Protected routes
router.get("/", authenticate, NotificationController.getAll);
router.put("/:id/read", authenticate, NotificationController.markAsRead);
router.put("/read-all", authenticate, NotificationController.markAllAsRead);
router.delete("/:id", authenticate, NotificationController.delete);

export default router;

