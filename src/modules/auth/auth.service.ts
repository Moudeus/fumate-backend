import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { jwtConfig } from "../../config";
import { IUser } from "../users/user.model";
import { MailService } from "../mail/mail.service";

export class AuthService {
  static async login(email: string, password: string, UserModel: any) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { status: 0, message: "Email không tồn tại" };
    }

    if (!user.isActive) {
      return { status: 0, message: "Tài khoản đã bị khóa" };
    }

    if (!user.isVerified) {
      return { status: 0, message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản." };
    }

    if (user.loginFailedTime && user.loginFailedTime > new Date()) {
      const timeDifference = user.loginFailedTime.getTime() - new Date().getTime();
      const timeRemaining = Math.ceil(timeDifference / 1000);
      return { status: 0, message: `Tài khoản bị khóa. Vui lòng thử lại sau ${timeRemaining} giây` };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginFailedCounts = (user.loginFailedCounts || 0) + 1;
      if (user.loginFailedCounts >= 3) {
        user.loginFailedTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      await user.save();
      return { status: 0, message: "Mật khẩu không đúng" };
    }

    // Reset login failed counts
    user.loginFailedCounts = 0;
    user.loginFailedTime = null;
    user.lastLogin = new Date();
    await user.save();

    // Use role directly from user (enum, not reference)
    const userRole = user.role || "user";

    const accessToken = jwt.sign(
      { id: user._id, role: userRole },
      jwtConfig.secret as Secret,
      { expiresIn: jwtConfig.expiresIn } as SignOptions
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      jwtConfig.secret as Secret,
      { expiresIn: jwtConfig.refreshExpiresIn } as SignOptions
    );

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    const { password: _, refreshToken: __, ...userWithoutSensitive } = user.toObject();

    return { status: 1, accessToken, refreshToken, user: userWithoutSensitive };
  }

  static async register(email: string, password: string, firstName: string, lastName: string, UserModel: any) {
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return { status: 0, message: "Email đã được đăng ký" };
    }

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new UserModel({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: "user",
      isVerified: false,
      verificationOTP: otp,
      verificationOTPExpires: otpExpires,
    });

    await user.save();

    // Send OTP via email
    try {
      await MailService.sendOTPToken(email, otp);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      // Continue with registration even if email fails
    }

    return { 
      status: 1, 
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      email: email.toLowerCase()
    };
  }

  static generateTokens(user: IUser) {
    const userRole = user.role || "user";

    const accessToken = jwt.sign(
      { id: user._id, role: userRole },
      jwtConfig.secret as Secret,
      { expiresIn: jwtConfig.expiresIn } as SignOptions
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      jwtConfig.secret as Secret,
      { expiresIn: jwtConfig.refreshExpiresIn } as SignOptions
    );
    return { accessToken, refreshToken };
  }

  static refresh(token: string) {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as { id: string };
      const accessToken = jwt.sign(
        { id: decoded.id },
        jwtConfig.secret as Secret,
        { expiresIn: jwtConfig.expiresIn } as SignOptions
      );
      return { status: 1, accessToken };
    } catch {
      return { status: 0, message: "Refresh token không hợp lệ" };
    }
  }

  static async logout(userId: string, UserModel: any) {
    await UserModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { status: 1, message: "Đăng xuất thành công" };
  }

  static async forgotPassword(email: string, UserModel: any) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return { status: 1, message: "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu" };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save hashed token with 15 min expiry
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return {
      status: 1,
      resetToken,
      message: "Token đã được tạo",
    };
  }

  static async resetPassword(token: string, newPassword: string, UserModel: any) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return { status: 0, message: "Token không hợp lệ hoặc đã hết hạn" };
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { status: 1, message: "Đặt lại mật khẩu thành công" };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string, UserModel: any) {
    const user = await UserModel.findById(userId);
    if (!user) {
      return { status: 0, message: "Không tìm thấy người dùng" };
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return { status: 0, message: "Mật khẩu hiện tại không đúng" };
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return { status: 1, message: "Đổi mật khẩu thành công" };
  }

  static async verifyOTP(email: string, otp: string, UserModel: any) {
    const user = await UserModel.findOne({ 
      email: email.toLowerCase(),
      verificationOTP: otp,
      verificationOTPExpires: { $gt: new Date() }
    });

    if (!user) {
      return { status: 0, message: "Mã OTP không hợp lệ hoặc đã hết hạn" };
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    // Generate tokens for the verified user
    const userRole = user.role || "user";
    const accessToken = jwt.sign(
      { id: user._id, role: userRole },
      jwtConfig.secret as Secret,
      { expiresIn: jwtConfig.expiresIn } as SignOptions
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      jwtConfig.secret as Secret,
      { expiresIn: jwtConfig.refreshExpiresIn } as SignOptions
    );

    user.refreshToken = refreshToken;
    await user.save();

    const { password: _, refreshToken: __, verificationOTP: ___, verificationOTPExpires: ____, ...userWithoutSensitive } = user.toObject();

    return { status: 1, accessToken, refreshToken, user: userWithoutSensitive };
  }

  static async resendOTP(email: string, UserModel: any) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { status: 0, message: "Không tìm thấy người dùng với email này" };
    }

    if (user.isVerified) {
      return { status: 0, message: "Tài khoản đã được xác thực" };
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationOTP = otp;
    user.verificationOTPExpires = otpExpires;
    await user.save();

    // Send OTP via email
    try {
      await MailService.sendOTPToken(email, otp);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      return { status: 0, message: "Không thể gửi email OTP. Vui lòng thử lại sau." };
    }

    return { status: 1, message: "Mã OTP mới đã được gửi đến email của bạn" };
  }
}
