import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import mongoose from "mongoose";
import UserModel from "./user.model";
import { MBTITestResult } from "../mbti/mbti.model";

export class UserController {
  // Get admin statistics
  static async getAdminStats(_req: Request, res: Response) {
    try {
      // Get total users count
      const totalUsers = await UserModel.countDocuments();
      
      // Get total MBTI tests completed
      const mbtiTestsCompleted = await MBTITestResult.countDocuments();
      
      // Get new users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const newUsersThisMonth = await UserModel.countDocuments({
        createdAt: { $gte: startOfMonth }
      });

      return res.status(200).json(
        ApiResponseWrapper.success("Lấy thống kê admin thành công", {
          totalUsers,
          mbtiTestsCompleted,
          newUsersThisMonth
        })
      );
    } catch (error) {
      console.error("Get admin stats error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get all users (admin only)
  static async getAllUsers(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 10), 100);
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        UserModel.find()
          .select("-password -refreshToken")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        UserModel.countDocuments()
      ]);

      return res.status(200).json(
        ApiResponseWrapper.success("Lấy danh sách người dùng thành công", {
          items: users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
      );
    } catch (error) {
      console.error("Get all users error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(ApiResponseWrapper.error("ID người dùng không hợp lệ"));
      }

      const user = await UserModel.findById(id).select("-password -refreshToken").lean();

      if (!user) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy người dùng"));
      }

      return res.status(200).json(
        ApiResponseWrapper.success("Lấy thông tin người dùng thành công", user)
      );
    } catch (error) {
      console.error("Get user by ID error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get current user profile
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.userId;

      const user = await UserModel.findById(userId).select("-password -refreshToken").lean();

      if (!user) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy người dùng"));
      }

      return res.status(200).json(
        ApiResponseWrapper.success("Lấy thông tin người dùng thành công", user)
      );
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default UserController;
