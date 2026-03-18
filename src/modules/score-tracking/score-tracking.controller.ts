import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import mongoose from "mongoose";
import { Subject } from "../subjects/subject.model";

export class ScoreController {
  // Get user's scores with subject information
  static async getAll(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 10, subjectId = "" } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Build aggregation pipeline to join with subjects
      const matchStage: any = { userID: new mongoose.Types.ObjectId(userId) };
      
      // Filter by subject if provided
      if (subjectId) {
        matchStage.subjectID = new mongoose.Types.ObjectId(subjectId as string);
      }

      const pipeline: any[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: "subjects",
            localField: "subjectID",
            foreignField: "_id",
            as: "subject"
          }
        },
        { $unwind: "$subject" },
        { $sort: { examDate: -1 } },
        { $skip: skip },
        { $limit: Number(limit) }
      ];

      const scores = await mongoose.connection.collection("score_tracking")
        .aggregate(pipeline)
        .toArray();

      // Get total count
      const countMatchStage: any = { userID: new mongoose.Types.ObjectId(userId) };
      if (subjectId) {
        countMatchStage.subjectID = new mongoose.Types.ObjectId(subjectId as string);
      }

      const totalResult = await mongoose.connection.collection("score_tracking")
        .aggregate([
          { $match: countMatchStage },
          { $count: "total" }
        ])
        .toArray();

      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      // Calculate average
      let average = 0;
      if (scores.length > 0) {
        const sum = scores.reduce((acc, score) => acc + score.score, 0);
        average = sum / scores.length;
      }

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách điểm thành công", {
        items: scores,
        pagination: { total, page: Number(page), limit: Number(limit) },
        average: average.toFixed(1)
      }));
    } catch (error) {
      console.error("Get scores error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get scores grouped by subject with averages
  static async getScoresBySubject(req: Request, res: Response) {
    try {
      const userId = req.userId;

      const pipeline = [
        { $match: { userID: new mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: "subjects",
            localField: "subjectID",
            foreignField: "_id",
            as: "subject"
          }
        },
        { $unwind: "$subject" },
        {
          $group: {
            _id: "$subjectID",
            subject: { $first: "$subject" },
            scores: { $push: "$$ROOT" },
            averageScore: { $avg: "$score" },
            totalScores: { $sum: 1 },
            latestScore: { $max: "$examDate" }
          }
        },
        { $sort: { "subject.name": 1 } }
      ];

      const scoresBySubject = await mongoose.connection.collection("score_tracking")
        .aggregate(pipeline)
        .toArray();

      return res.status(200).json(ApiResponseWrapper.success("Lấy điểm theo môn học thành công", scoresBySubject));
    } catch (error) {
      console.error("Get scores by subject error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Add new score
  static async create(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { subjectId, score, examDate, examType, notes } = req.body;

      if (!subjectId || score === undefined || !examDate || !examType) {
        return res.status(400).json(ApiResponseWrapper.error("Vui lòng điền đầy đủ thông tin"));
      }

      if (score < 0 || score > 10) {
        return res.status(400).json(ApiResponseWrapper.error("Điểm số phải từ 0 đến 10"));
      }

      // Validate subject exists and is active
      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json(ApiResponseWrapper.error("ID môn học không hợp lệ"));
      }

      const subject = await Subject.findOne({ _id: subjectId, isActive: true });
      if (!subject) {
        return res.status(400).json(ApiResponseWrapper.error("Môn học không tồn tại hoặc đã bị vô hiệu hóa"));
      }

      const newScore = {
        userID: new mongoose.Types.ObjectId(userId),
        subjectID: new mongoose.Types.ObjectId(subjectId),
        score: parseFloat(score),
        examDate: new Date(examDate),
        examType,
        notes: notes || "",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await mongoose.connection.collection("score_tracking").insertOne(newScore);

      // Return the created score with subject information
      const createdScore = await mongoose.connection.collection("score_tracking")
        .aggregate([
          { $match: { _id: result.insertedId } },
          {
            $lookup: {
              from: "subjects",
              localField: "subjectID",
              foreignField: "_id",
              as: "subject"
            }
          },
          { $unwind: "$subject" }
        ])
        .toArray();

      return res.status(201).json(ApiResponseWrapper.success("Thêm điểm thành công", createdScore[0]));
    } catch (error) {
      console.error("Create score error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Update score
  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.userId;
      const { subjectId, score, examDate, examType, notes } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
      }

      const updateData: any = { updatedAt: new Date() };
      
      // Validate and update subject if provided
      if (subjectId) {
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
          return res.status(400).json(ApiResponseWrapper.error("ID môn học không hợp lệ"));
        }
        
        const subject = await Subject.findOne({ _id: subjectId, isActive: true });
        if (!subject) {
          return res.status(400).json(ApiResponseWrapper.error("Môn học không tồn tại hoặc đã bị vô hiệu hóa"));
        }
        
        updateData.subjectID = new mongoose.Types.ObjectId(subjectId);
      }
      
      if (score !== undefined) {
        if (score < 0 || score > 10) {
          return res.status(400).json(ApiResponseWrapper.error("Điểm số phải từ 0 đến 10"));
        }
        updateData.score = parseFloat(score);
      }
      if (examDate) updateData.examDate = new Date(examDate);
      if (examType) updateData.examType = examType;
      if (notes !== undefined) updateData.notes = notes;

      await mongoose.connection.collection("score_tracking").updateOne(
        { _id: new mongoose.Types.ObjectId(id), userID: new mongoose.Types.ObjectId(userId as string) },
        { $set: updateData }
      );

      return res.status(200).json(ApiResponseWrapper.success("Cập nhật điểm thành công"));
    } catch (error) {
      console.error("Update score error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Delete score
  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.userId;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
      }

      await mongoose.connection.collection("score_tracking").deleteOne(
        { _id: new mongoose.Types.ObjectId(id), userID: new mongoose.Types.ObjectId(userId as string) }
      );

      return res.status(200).json(ApiResponseWrapper.success("Xóa điểm thành công"));
    } catch (error) {
      console.error("Delete score error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default ScoreController;

