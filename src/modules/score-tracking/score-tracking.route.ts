import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { ScoreController } from "./score-tracking.controller";

const router = Router();

// Protected routes
router.get("/", authenticate, ScoreController.getAll);
router.get("/by-subject", authenticate, ScoreController.getScoresBySubject);
router.post("/", authenticate, ScoreController.create);
router.put("/:id", authenticate, ScoreController.update);
router.delete("/:id", authenticate, ScoreController.delete);

export default router;

