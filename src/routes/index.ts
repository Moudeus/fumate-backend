import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/users/user.route";
import mbtiRoutes from "../modules/mbti/mbti.route";
import articleRoutes from "../modules/articles/article.route";
import careerRoutes from "../modules/careers/career.route";
import universityRoutes from "../modules/universities/university.route";
import notificationRoutes from "../modules/notifications/notification.route";
import scoreRoutes from "../modules/score-tracking/score-tracking.route";
import favoriteRoutes from "../modules/favorites/favorite.route";
import subjectRoutes from "../modules/subjects/subject.route";
import majorRoutes from "../modules/majors/major.route";
import sectorRoutes from "../modules/universities/sector.route";
import admissionRequirementRoutes from "../modules/universities/admission-requirement.route";

const router = Router();

// Auth routes (outside v1)
router.use("/auth", authRoutes);

// User routes (outside v1 for register)
router.use("/users", userRoutes);

// V1 API routes
router.use("/v1/mbti", mbtiRoutes);
router.use("/v1/articles", articleRoutes);
router.use("/v1/careers", careerRoutes);
router.use("/v1/universities", universityRoutes);
router.use("/v1/notifications", notificationRoutes);
router.use("/v1/scores", scoreRoutes);
router.use("/v1/favorites", favoriteRoutes);
router.use("/v1/subjects", subjectRoutes);
router.use("/v1/majors", majorRoutes);
router.use("/v1/sectors", sectorRoutes);
router.use("/v1/admission-requirements", admissionRequirementRoutes);

export default router;
