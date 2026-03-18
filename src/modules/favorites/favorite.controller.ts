import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import mongoose from "mongoose";

export class FavoriteController {
  // Get user's favorite universities
  static async getAll(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const favorites = await mongoose.connection.collection("favorite_universities")
        .find({ userID: new mongoose.Types.ObjectId(userId) })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .toArray();

      // Get university details
      const universityIds = favorites.map(f => f.universityID);
      const universities = await mongoose.connection.collection("universities")
        .find({ _id: { $in: universityIds }, isActive: true })
        .toArray();

      const total = await mongoose.connection.collection("favorite_universities")
        .countDocuments({ userID: new mongoose.Types.ObjectId(userId) });

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách yêu thích thành công", {
        items: favorites,
        universities,
        pagination: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (error) {
      console.error("Get favorites error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Add to favorites
  static async add(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { universityId, notes } = req.body;

      if (!universityId) {
        return res.status(400).json(ApiResponseWrapper.error("Vui lòng chọn trường"));
      }

      if (!mongoose.Types.ObjectId.isValid(universityId)) {
        return res.status(400).json(ApiResponseWrapper.error("ID trường không hợp lệ"));
      }

      // Check if already in favorites
      const existing = await mongoose.connection.collection("favorite_universities").findOne({
        userID: new mongoose.Types.ObjectId(userId),
        universityID: new mongoose.Types.ObjectId(universityId)
      });

      if (existing) {
        return res.status(400).json(ApiResponseWrapper.error("Trường đã có trong danh sách yêu thích"));
      }

      const favorite = {
        userID: new mongoose.Types.ObjectId(userId),
        universityID: new mongoose.Types.ObjectId(universityId),
        notes: notes || "",
        createdAt: new Date()
      };

      await mongoose.connection.collection("favorite_universities").insertOne(favorite);

      return res.status(201).json(ApiResponseWrapper.success("Thêm vào yêu thích thành công", favorite));
    } catch (error) {
      console.error("Add favorite error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Remove from favorites by universityId
  static async removeByUniversityId(req: Request, res: Response) {
    try {
      const universityId = req.params.universityId as string;
      const userId = req.userId;

      if (!mongoose.Types.ObjectId.isValid(universityId)) {
        return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
      }

      await mongoose.connection.collection("favorite_universities").deleteOne({
        universityID: new mongoose.Types.ObjectId(universityId),
        userID: new mongoose.Types.ObjectId(userId as string)
      });

      return res.status(200).json(ApiResponseWrapper.success("Xóa khỏi yêu thích thành công"));
    } catch (error) {
      console.error("Remove favorite error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Check if university is favorited
  static async check(req: Request, res: Response) {
    try {
      const universityId = req.params.universityId as string;
      const userId = req.userId;

      if (!mongoose.Types.ObjectId.isValid(universityId)) {
        return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
      }

      const favorite = await mongoose.connection.collection("favorite_universities").findOne({
        userID: new mongoose.Types.ObjectId(userId as string),
        universityID: new mongoose.Types.ObjectId(universityId)
      });

      return res.status(200).json(ApiResponseWrapper.success("Kiểm tra thành công", {
        isFavorite: !!favorite,
        favoriteId: favorite?._id
      }));
    } catch (error) {
      console.error("Check favorite error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default FavoriteController;

