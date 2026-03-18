import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middlewares/authMiddleware";
import { body } from "express-validator";

const router = Router();

// Public routes
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/verify-otp", AuthController.verifyOTP);
router.post("/resend-otp", AuthController.resendOTP);
router.post("/refresh-token", AuthController.refreshAccessToken);
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Email không hợp lệ"),
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  body("token").notEmpty().withMessage("Token không được để trống"),
  body("newPassword").isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  AuthController.resetPassword
);

// Protected routes
router.post("/logout", authenticate, AuthController.logout);
router.get("/me", authenticate, AuthController.getCurrentUser);
router.put(
  "/change-password",
  authenticate,
  body("currentPassword").notEmpty().withMessage("Mật khẩu hiện tại không được để trống"),
  body("newPassword").isLength({ min: 6 }).withMessage("Mật khẩu mới phải có ít nhất 6 ký tự"),
  AuthController.changePassword
);

export default router;
