import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { authorize } from "../../middlewares/roleMiddleware";
import { ArticleController } from "./article.controller";

const router = Router();

// Public routes
router.get("/", ArticleController.getAll);
router.get("/featured", ArticleController.getFeatured);
router.get("/:id", ArticleController.getById);

// Protected routes (admin only)
router.post("/", authenticate, authorize("admin"), ArticleController.create);
router.put("/:id", authenticate, authorize("admin"), ArticleController.update);
router.delete("/:id", authenticate, authorize("admin"), ArticleController.delete);

export default router;
