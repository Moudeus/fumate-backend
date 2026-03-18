import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import mongoose from "mongoose";

export class NotificationController {
  // Get user notifications
  static async getAll(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 10, unreadOnly } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const query: any = { userID: new mongoose.Types.ObjectId(userId) };

      if (unreadOnly === "true") {
        query.isRead = false;
      }

      const notifications = await mongoose.connection.collection("notifications")
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .toArray();

      const total = await mongoose.connection.collection("notifications").countDocuments(query);
      const unreadCount = await mongoose.connection.collection("notifications")
        .countDocuments({ userID: new mongoose.Types.ObjectId(userId), isRead: false });

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách thông báo thành công", {
        items: notifications,
        pagination: { total, page: Number(page), limit: Number(limit) },
        unreadCount
      }));
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Mark notification as read
  static async markAsRead(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.userId;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
      }

      await mongoose.connection.collection("notifications").updateOne(
        { _id: new mongoose.Types.ObjectId(id), userID: new mongoose.Types.ObjectId(userId as string) },
        { $set: { isRead: true } }
      );

      return res.status(200).json(ApiResponseWrapper.success("Đánh dấu đã đọc thành công"));
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.userId;

      await mongoose.connection.collection("notifications").updateMany(
        { userID: new mongoose.Types.ObjectId(userId as string), isRead: false },
        { $set: { isRead: true } }
      );

      return res.status(200).json(ApiResponseWrapper.success("Đánh dấu tất cả đã đọc thành công"));
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Delete notification
  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.userId;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
      }

      await mongoose.connection.collection("notifications").deleteOne(
        { _id: new mongoose.Types.ObjectId(id), userID: new mongoose.Types.ObjectId(userId as string) }
      );

      return res.status(200).json(ApiResponseWrapper.success("Xóa thông báo thành công"));
    } catch (error) {
      console.error("Delete notification error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default NotificationController;

