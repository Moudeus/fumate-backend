import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import { Subject } from "./subject.model";
import mongoose from "mongoose";

export class SubjectController {
  // Get all active subjects (for students)
  static async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, search = "" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build query for active subjects
      const query: any = { isActive: true };
      if (search) {
        query.$text = { $search: search as string };
      }

      const subjects = await Subject
        .find(query)
        .select("name code description")
        .skip(skip)
        .limit(Number(limit))
        .sort({ name: 1 });

      const total = await Subject.countDocuments(query);

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách môn học thành công", {
        items: subjects,
        pagination: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (error) {
      console.error("Get subjects error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get subject by ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID môn học không hợp lệ"));
      }

      const subject = await Subject.findById(id);
      if (!subject) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy môn học"));
      }

      return res.status(200).json(ApiResponseWrapper.success("Lấy thông tin môn học thành công", subject));
    } catch (error) {
      console.error("Get subject by ID error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Create new subject
  static async create(req: Request, res: Response) {
    try {
      const { name, code, description } = req.body;

      if (!name || !code) {
        return res.status(400).json(ApiResponseWrapper.error("Tên và mã môn học là bắt buộc"));
      }

      // Check if subject code already exists
      const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
      if (existingSubject) {
        return res.status(400).json(ApiResponseWrapper.error("Mã môn học đã tồn tại"));
      }

      const newSubject = new Subject({
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description || "",
        isActive: true
      });

      await newSubject.save();

      return res.status(201).json(ApiResponseWrapper.success("Tạo môn học thành công", newSubject));
    } catch (error) {
      console.error("Create subject error:", error);
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return res.status(400).json(ApiResponseWrapper.error("Mã môn học đã tồn tại"));
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Update subject
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, description, isActive } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID môn học không hợp lệ"));
      }

      const subject = await Subject.findById(id);
      if (!subject) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy môn học"));
      }

      // Check if new code conflicts with existing subjects
      if (code && code.toUpperCase() !== subject.code) {
        const existingSubject = await Subject.findOne({ 
          code: code.toUpperCase(), 
          _id: { $ne: id } 
        });
        if (existingSubject) {
          return res.status(400).json(ApiResponseWrapper.error("Mã môn học đã tồn tại"));
        }
      }

      // Update fields
      if (name) subject.name = name.trim();
      if (code) subject.code = code.toUpperCase().trim();
      if (description !== undefined) subject.description = description;
      if (isActive !== undefined) subject.isActive = isActive;

      await subject.save();

      return res.status(200).json(ApiResponseWrapper.success("Cập nhật môn học thành công", subject));
    } catch (error) {
      console.error("Update subject error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Delete subject (soft delete by setting isActive to false)
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID môn học không hợp lệ"));
      }

      // Check if subject has associated scores
      const hasScores = await mongoose.connection.collection("score_tracking")
        .findOne({ subjectID: new mongoose.Types.ObjectId(id as string) });

      if (hasScores) {
        // Soft delete - set isActive to false
        await Subject.findByIdAndUpdate(id, { isActive: false });
        return res.status(200).json(ApiResponseWrapper.success("Môn học đã được vô hiệu hóa do có dữ liệu điểm liên quan"));
      } else {
        // Hard delete if no associated data
        await Subject.findByIdAndDelete(id);
        return res.status(200).json(ApiResponseWrapper.success("Xóa môn học thành công"));
      }
    } catch (error) {
      console.error("Delete subject error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Get all subjects (including inactive)
  static async getAllForAdmin(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, search = "", status = "all" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build query
      const query: any = {};
      if (search) {
        query.$text = { $search: search as string };
      }
      if (status === "active") {
        query.isActive = true;
      } else if (status === "inactive") {
        query.isActive = false;
      }

      const subjects = await Subject
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await Subject.countDocuments(query);

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách môn học thành công", {
        items: subjects,
        pagination: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (error) {
      console.error("Get all subjects for admin error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default SubjectController;