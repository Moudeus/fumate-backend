import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import UserModel from "../users/user.model";
import crypto from "crypto";
import { emailConfig } from "../../config";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json(ApiResponseWrapper.error("Vui lòng nhập email và mật khẩu"));
      }

      const result = await AuthService.login(email, password, UserModel);

      if (result.status === 0) {
        return res.status(200).json(ApiResponseWrapper.error(result.message || "Đăng nhập thất bại"));
      }

      // Set refresh token in HTTP-only cookie
      const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: maxAgeMs,
      });

      return res.status(200).json(
        ApiResponseWrapper.success("Đăng nhập thành công", {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        })
      );
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json(ApiResponseWrapper.error("Vui lòng nhập đầy đủ thông tin"));
      }

      const result = await AuthService.register(email, password, firstName, lastName, UserModel);

      if (result.status === 0) {
        return res.status(400).json(ApiResponseWrapper.error(result.message));
      }

      return res.status(201).json(
        ApiResponseWrapper.success(result.message, {
          email: result.email
        })
      );
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async refreshAccessToken(req: Request, res: Response) {
    try {
      const refreshTokenFromCookie = req.cookies?.refreshToken;
      const refreshTokenFromBody = req.body?.refreshToken;
      const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

      if (!refreshToken) {
        return res.status(401).json(ApiResponseWrapper.error("Không có refresh token"));
      }

      const result = AuthService.refresh(refreshToken);
      if (!result.status) {
        return res.status(403).json(ApiResponseWrapper.error("Refresh token không hợp lệ"));
      }

      return res.status(200).json(
        ApiResponseWrapper.success("Làm mới token thành công", {
          accessToken: result.accessToken,
        })
      );
    } catch (error) {
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = req.userId;
      if (userId) {
        await AuthService.logout(userId, UserModel);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json(ApiResponseWrapper.success("Đăng xuất thành công"));
    } catch (error) {
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json(ApiResponseWrapper.error("Chưa đăng nhập"));
      }

      const user = await UserModel.findById(req.userId);
      if (!user) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy người dùng"));
      }

      const { password, refreshToken, ...userWithoutSensitive } = user.toObject();
      return res.status(200).json(
        ApiResponseWrapper.success("Lấy thông tin người dùng thành công", userWithoutSensitive)
      );
    } catch (error) {
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json(ApiResponseWrapper.error("Vui lòng nhập email"));
      }

      const result = await AuthService.forgotPassword(email, UserModel);

      if (result.status === 0) {
        return res.status(400).json(ApiResponseWrapper.error(result.message));
      }

      // In production, send email here
      // For demo, return the reset token
      return res.status(200).json(
        ApiResponseWrapper.success("Đã gửi email đặt lại mật khẩu", {
          resetToken: result.resetToken,
          message: "Token đã được lưu vào DB (trong production sẽ gửi qua email)",
        })
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json(ApiResponseWrapper.error("Vui lòng cung cấp token và mật khẩu mới"));
      }

      const result = await AuthService.resetPassword(token, newPassword, UserModel);

      if (result.status === 0) {
        return res.status(400).json(ApiResponseWrapper.error(result.message));
      }

      return res.status(200).json(ApiResponseWrapper.success("Đặt lại mật khẩu thành công"));
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json(ApiResponseWrapper.error("Chưa đăng nhập"));
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json(ApiResponseWrapper.error("Vui lòng nhập đầy đủ thông tin"));
      }

      const result = await AuthService.changePassword(userId, currentPassword, newPassword, UserModel);

      if (result.status === 0) {
        return res.status(400).json(ApiResponseWrapper.error(result.message));
      }

      return res.status(200).json(ApiResponseWrapper.success("Đổi mật khẩu thành công"));
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json(ApiResponseWrapper.error("Vui lòng nhập email và mã OTP"));
      }

      const result = await AuthService.verifyOTP(email, otp, UserModel);

      if (result.status === 0) {
        return res.status(400).json(ApiResponseWrapper.error(result.message));
      }

      // Set refresh token in HTTP-only cookie
      const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: maxAgeMs,
      });

      return res.status(200).json(
        ApiResponseWrapper.success("Xác thực OTP thành công", {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        })
      );
    } catch (error) {
      console.error("Verify OTP error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async resendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json(ApiResponseWrapper.error("Vui lòng nhập email"));
      }

      const result = await AuthService.resendOTP(email, UserModel);

      if (result.status === 0) {
        return res.status(400).json(ApiResponseWrapper.error(result.message));
      }

      return res.status(200).json(ApiResponseWrapper.success(result.message));
    } catch (error) {
      console.error("Resend OTP error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}
