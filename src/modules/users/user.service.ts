import UserModel, { IUser } from "../users/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export class UserService {
  // Create new user
  static async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    const existingUser = await UserModel.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new Error("Email đã được đăng ký");
    }

    const user = new UserModel({
      ...userData,
      email: userData.email.toLowerCase(),
      role: userData.role || "user",
    });

    await user.save();
    return user;
  }

  // Get all users
  static async getAll() {
    return UserModel.find().select("-password -refreshToken");
  }

  // Get user by ID
  static async getById(id: string) {
    const user = await UserModel.findById(id).select("-password -refreshToken");
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }
    return user;
  }

  // Get user by email
  static async getByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() });
  }

  // Update user
  static async update(id: string, updateData: Partial<IUser>) {
    const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password -refreshToken");
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }
    return user;
  }

  // Change password
  static async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error("Mật khẩu hiện tại không đúng");
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return { message: "Đổi mật khẩu thành công" };
  }

  // Delete user
  static async delete(id: string) {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }
    return { message: "Xóa người dùng thành công" };
  }

  // Generate password reset token
  static async generatePasswordResetToken(email: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return null;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    return resetToken;
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { message: "Đặt lại mật khẩu thành công" };
  }
}
