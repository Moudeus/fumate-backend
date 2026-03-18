import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { UniversityController } from "./university.controller";

const router = Router();

// Public routes
router.get("/", UniversityController.getAll);
router.get("/majors/list", UniversityController.getMajors);
router.get("/sectors", UniversityController.getSectors);
router.get("/majors/:majorId/universities", UniversityController.getUniversitiesByMajor);
router.get("/:id", UniversityController.getById);
router.get("/:id/majors", UniversityController.getMajorsByUniversity);
router.get("/:id/scores", UniversityController.getAdmissionScores);
router.get("/:id/requirements", UniversityController.getAdmissionRequirements);

// Protected routes
router.post("/:universityId/majors/:majorId/probability", authenticate, UniversityController.calculateAdmissionProbability);

// Favorites routes
router.post("/:universityId/favorite", authenticate, UniversityController.addToFavorites);
router.delete("/:universityId/favorite", authenticate, UniversityController.removeFromFavorites);
router.get("/favorites", authenticate, UniversityController.getFavorites);
router.get("/:universityId/favorite/check", authenticate, UniversityController.checkFavorite);

export default router;

