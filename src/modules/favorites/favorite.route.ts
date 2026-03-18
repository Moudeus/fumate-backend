import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { FavoriteController } from "./favorite.controller";

const router = Router();

// Protected routes
router.get("/", authenticate, FavoriteController.getAll);
router.post("/", authenticate, FavoriteController.add);
router.delete("/university/:universityId", authenticate, FavoriteController.removeByUniversityId);
router.get("/check/:universityId", authenticate, FavoriteController.check);

export default router;

