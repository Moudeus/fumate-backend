import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import { Sector } from "./sector.model";
import { Subject } from "../subjects/subject.model";
import mongoose from "mongoose";

export class SectorController {
  // Get all active sectors (for students)
  static async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, search = "" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build query for active sectors
      const query: any = { isActive: true };
      if (search) {
        query.$text = { $search: search as string };
      }

      const sectors = await Sector
        .find(query)
        .populate("subjects", "name code description")
        .select("name code description subjects")
        .skip(skip)
        .limit(Number(limit))
        .sort({ name: 1 });

      const total = await Sector.countDocuments(query);

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách khối thi thành công", {
        items: sectors,
        pagination: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (error) {
      console.error("Get sectors error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get sector by ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID khối thi không hợp lệ"));
      }

      const sector = await Sector
        .findById(id)
        .populate("subjects", "name code description");
        
      if (!sector) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy khối thi"));
      }

      return res.status(200).json(ApiResponseWrapper.success("Lấy thông tin khối thi thành công", sector));
    } catch (error) {
      console.error("Get sector by ID error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Create new sector
  static async create(req: Request, res: Response) {
    try {
      const { name, code, description, subjects } = req.body;

      if (!name || !code) {
        return res.status(400).json(ApiResponseWrapper.error("Tên và mã khối thi là bắt buộc"));
      }

      if (!subjects || !Array.isArray(subjects) || subjects.length !== 3) {
        return res.status(400).json(ApiResponseWrapper.error("Khối thi phải có đúng 3 môn học"));
      }

      // Validate all subject IDs
      const validSubjects = await Subject.find({ 
        _id: { $in: subjects },
        isActive: true 
      });

      if (validSubjects.length !== 3) {
        return res.status(400).json(ApiResponseWrapper.error("Một hoặc nhiều môn học không hợp lệ"));
      }

      // Check if sector code already exists
      const existingSector = await Sector.findOne({ code: code.toUpperCase() });
      if (existingSector) {
        return res.status(400).json(ApiResponseWrapper.error("Mã khối thi đã tồn tại"));
      }

      const newSector = new Sector({
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description || "",
        subjects: subjects,
        isActive: true
      });

      await newSector.save();
      
      // Populate subjects for response
      await newSector.populate("subjects", "name code description");

      return res.status(201).json(ApiResponseWrapper.success("Tạo khối thi thành công", newSector));
    } catch (error) {
      console.error("Create sector error:", error);
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return res.status(400).json(ApiResponseWrapper.error("Mã khối thi đã tồn tại"));
      }
      if (error instanceof Error && error.message.includes("exactly 3 subjects")) {
        return res.status(400).json(ApiResponseWrapper.error("Khối thi phải có đúng 3 môn học"));
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Update sector
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, description, subjects, isActive } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID khối thi không hợp lệ"));
      }

      const sector = await Sector.findById(id);
      if (!sector) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy khối thi"));
      }

      // Check if new code conflicts with existing sectors
      if (code && code.toUpperCase() !== sector.code) {
        const existingSector = await Sector.findOne({ 
          code: code.toUpperCase(), 
          _id: { $ne: id } 
        });
        if (existingSector) {
          return res.status(400).json(ApiResponseWrapper.error("Mã khối thi đã tồn tại"));
        }
      }

      // Validate subjects if provided
      if (subjects) {
        if (!Array.isArray(subjects) || subjects.length !== 3) {
          return res.status(400).json(ApiResponseWrapper.error("Khối thi phải có đúng 3 môn học"));
        }

        const validSubjects = await Subject.find({ 
          _id: { $in: subjects },
          isActive: true 
        });

        if (validSubjects.length !== 3) {
          return res.status(400).json(ApiResponseWrapper.error("Một hoặc nhiều môn học không hợp lệ"));
        }
      }

      // Update fields
      if (name) sector.name = name.trim();
      if (code) sector.code = code.toUpperCase().trim();
      if (description !== undefined) sector.description = description;
      if (subjects) sector.subjects = subjects;
      if (isActive !== undefined) sector.isActive = isActive;

      await sector.save();
      await sector.populate("subjects", "name code description");

      return res.status(200).json(ApiResponseWrapper.success("Cập nhật khối thi thành công", sector));
    } catch (error) {
      console.error("Update sector error:", error);
      if (error instanceof Error && error.message.includes("exactly 3 subjects")) {
        return res.status(400).json(ApiResponseWrapper.error("Khối thi phải có đúng 3 môn học"));
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Delete sector (soft delete by setting isActive to false)
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID khối thi không hợp lệ"));
      }

      // Check if sector has associated admission requirements
      const hasAdmissionRequirements = await mongoose.connection.collection("admission_requirements")
        .findOne({ sectorId: new mongoose.Types.ObjectId(id as string) });

      if (hasAdmissionRequirements) {
        // Soft delete - set isActive to false
        await Sector.findByIdAndUpdate(id, { isActive: false });
        return res.status(200).json(ApiResponseWrapper.success("Khối thi đã được vô hiệu hóa do có dữ liệu điểm chuẩn liên quan"));
      } else {
        // Hard delete if no associated data
        await Sector.findByIdAndDelete(id);
        return res.status(200).json(ApiResponseWrapper.success("Xóa khối thi thành công"));
      }
    } catch (error) {
      console.error("Delete sector error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Get all sectors (including inactive)
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

      const sectors = await Sector
        .find(query)
        .populate("subjects", "name code description")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await Sector.countDocuments(query);

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách khối thi thành công", {
        items: sectors,
        pagination: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (error) {
      console.error("Get all sectors for admin error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get available subjects for sector creation
  static async getAvailableSubjects(req: Request, res: Response) {
    try {
      const subjects = await Subject
        .find({ isActive: true })
        .select("name code description")
        .sort({ name: 1 });

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách môn học thành công", subjects));
    } catch (error) {
      console.error("Get available subjects error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default SectorController;