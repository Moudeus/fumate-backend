import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import { AdmissionRequirement } from "./university.model";
import { University } from "./university.model";
import { Major } from "../majors/major.model";
import { Sector } from "./sector.model";
import mongoose from "mongoose";

export class AdmissionRequirementController {
  // Get all admission requirements (for students)
  static async getAll(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        universityId, 
        majorId, 
        sectorId, 
        academicYear 
      } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build query for active admission requirements
      const query: any = { isActive: true };
      if (universityId) query.universityId = universityId;
      if (majorId) query.majorId = majorId;
      if (sectorId) query.sectorId = sectorId;
      if (academicYear) query.academicYear = Number(academicYear);

      const admissionRequirements = await AdmissionRequirement
        .find(query)
        .populate("universityId", "name code")
        .populate("majorId", "name code")
        .populate("sectorId", "name code subjects")
        .skip(skip)
        .limit(Number(limit))
        .sort({ academicYear: -1, minimumScore: -1 });

      const total = await AdmissionRequirement.countDocuments(query);

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách điểm chuẩn thành công", {
        items: admissionRequirements,
        pagination: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (error) {
      console.error("Get admission requirements error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get admission requirement by ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID điểm chuẩn không hợp lệ"));
      }

      const admissionRequirement = await AdmissionRequirement
        .findById(id)
        .populate("universityId", "name code")
        .populate("majorId", "name code")
        .populate("sectorId", "name code subjects");
        
      if (!admissionRequirement) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy điểm chuẩn"));
      }

      return res.status(200).json(ApiResponseWrapper.success("Lấy thông tin điểm chuẩn thành công", admissionRequirement));
    } catch (error) {
      console.error("Get admission requirement by ID error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Create new admission requirement
  static async create(req: Request, res: Response) {
    try {
      const { universityId, majorId, sectorId, minimumScore, academicYear, additionalRequirements } = req.body;

      if (!universityId || !majorId || !sectorId || minimumScore === undefined || !academicYear) {
        return res.status(400).json(ApiResponseWrapper.error("Thiếu thông tin bắt buộc"));
      }

      // Validate score range (0-30)
      if (minimumScore < 0 || minimumScore > 30) {
        return res.status(400).json(ApiResponseWrapper.error("Điểm chuẩn phải trong khoảng 0-30"));
      }

      // Validate references exist
      const [university, major, sector] = await Promise.all([
        University.findById(universityId),
        Major.findById(majorId),
        Sector.findById(sectorId)
      ]);

      if (!university) {
        return res.status(400).json(ApiResponseWrapper.error("Trường đại học không tồn tại"));
      }
      if (!major) {
        return res.status(400).json(ApiResponseWrapper.error("Ngành học không tồn tại"));
      }
      if (!sector) {
        return res.status(400).json(ApiResponseWrapper.error("Khối thi không tồn tại"));
      }

      // Check if admission requirement already exists for this combination
      const existingRequirement = await AdmissionRequirement.findOne({
        universityId,
        majorId,
        sectorId,
        academicYear
      });

      if (existingRequirement) {
        return res.status(400).json(ApiResponseWrapper.error("Điểm chuẩn cho tổ hợp này đã tồn tại"));
      }

      const newAdmissionRequirement = new AdmissionRequirement({
        universityId,
        majorId,
        sectorId,
        minimumScore,
        academicYear,
        additionalRequirements: additionalRequirements || [],
        isActive: true
      });

      await newAdmissionRequirement.save();
      
      // Populate for response
      await newAdmissionRequirement.populate([
        { path: "universityId", select: "name code" },
        { path: "majorId", select: "name code" },
        { path: "sectorId", select: "name code subjects" }
      ]);

      return res.status(201).json(ApiResponseWrapper.success("Tạo điểm chuẩn thành công", newAdmissionRequirement));
    } catch (error) {
      console.error("Create admission requirement error:", error);
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return res.status(400).json(ApiResponseWrapper.error("Điểm chuẩn cho tổ hợp này đã tồn tại"));
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Update admission requirement
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { universityId, majorId, sectorId, minimumScore, academicYear, additionalRequirements, isActive } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID điểm chuẩn không hợp lệ"));
      }

      const admissionRequirement = await AdmissionRequirement.findById(id);
      if (!admissionRequirement) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy điểm chuẩn"));
      }

      // Validate score range if provided
      if (minimumScore !== undefined && (minimumScore < 0 || minimumScore > 30)) {
        return res.status(400).json(ApiResponseWrapper.error("Điểm chuẩn phải trong khoảng 0-30"));
      }

      // Validate references if provided
      if (universityId || majorId || sectorId) {
        const validationPromises = [];
        if (universityId) validationPromises.push(University.findById(universityId));
        if (majorId) validationPromises.push(Major.findById(majorId));
        if (sectorId) validationPromises.push(Sector.findById(sectorId));

        const validationResults = await Promise.all(validationPromises);
        let index = 0;
        if (universityId && !validationResults[index++]) {
          return res.status(400).json(ApiResponseWrapper.error("Trường đại học không tồn tại"));
        }
        if (majorId && !validationResults[index++]) {
          return res.status(400).json(ApiResponseWrapper.error("Ngành học không tồn tại"));
        }
        if (sectorId && !validationResults[index++]) {
          return res.status(400).json(ApiResponseWrapper.error("Khối thi không tồn tại"));
        }
      }

      // Check for duplicate if key fields are being changed
      if (universityId || majorId || sectorId || academicYear) {
        const checkUniversityId = universityId || admissionRequirement.universityId;
        const checkMajorId = majorId || admissionRequirement.majorId;
        const checkSectorId = sectorId || admissionRequirement.sectorId;
        const checkAcademicYear = academicYear || admissionRequirement.academicYear;

        const existingRequirement = await AdmissionRequirement.findOne({
          universityId: checkUniversityId,
          majorId: checkMajorId,
          sectorId: checkSectorId,
          academicYear: checkAcademicYear,
          _id: { $ne: id }
        });

        if (existingRequirement) {
          return res.status(400).json(ApiResponseWrapper.error("Điểm chuẩn cho tổ hợp này đã tồn tại"));
        }
      }

      // Update fields
      if (universityId) admissionRequirement.universityId = universityId;
      if (majorId) admissionRequirement.majorId = majorId;
      if (sectorId) admissionRequirement.sectorId = sectorId;
      if (minimumScore !== undefined) admissionRequirement.minimumScore = minimumScore;
      if (academicYear) admissionRequirement.academicYear = academicYear;
      if (additionalRequirements !== undefined) admissionRequirement.additionalRequirements = additionalRequirements;
      if (isActive !== undefined) admissionRequirement.isActive = isActive;

      await admissionRequirement.save();
      await admissionRequirement.populate([
        { path: "universityId", select: "name code" },
        { path: "majorId", select: "name code" },
        { path: "sectorId", select: "name code subjects" }
      ]);

      return res.status(200).json(ApiResponseWrapper.success("Cập nhật điểm chuẩn thành công", admissionRequirement));
    } catch (error) {
      console.error("Update admission requirement error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Delete admission requirement
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID điểm chuẩn không hợp lệ"));
      }

      const admissionRequirement = await AdmissionRequirement.findById(id);
      if (!admissionRequirement) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy điểm chuẩn"));
      }

      // Hard delete since admission requirements are historical data
      await AdmissionRequirement.findByIdAndDelete(id);
      return res.status(200).json(ApiResponseWrapper.success("Xóa điểm chuẩn thành công"));
    } catch (error) {
      console.error("Delete admission requirement error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Admin: Get all admission requirements (including inactive)
  static async getAllForAdmin(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        search = "", 
        status = "all",
        universityId,
        majorId,
        sectorId,
        academicYear
      } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build query
      const query: any = {};
      if (status === "active") {
        query.isActive = true;
      } else if (status === "inactive") {
        query.isActive = false;
      }
      if (universityId) query.universityId = universityId;
      if (majorId) query.majorId = majorId;
      if (sectorId) query.sectorId = sectorId;
      if (academicYear) query.academicYear = Number(academicYear);

      const admissionRequirements = await AdmissionRequirement
        .find(query)
        .populate("universityId", "name code")
        .populate("majorId", "name code")
        .populate("sectorId", "name code subjects")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await AdmissionRequirement.countDocuments(query);

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách điểm chuẩn thành công", {
        items: admissionRequirements,
        pagination: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (error) {
      console.error("Get all admission requirements for admin error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get admission requirements for a specific university and major
  static async getByUniversityAndMajor(req: Request, res: Response) {
    try {
      const { universityId, majorId } = req.params;
      const { academicYear } = req.query;

      if (!mongoose.Types.ObjectId.isValid(universityId as string) || !mongoose.Types.ObjectId.isValid(majorId as string)) {
        return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
      }

      const query: any = {
        universityId,
        majorId,
        isActive: true
      };

      if (academicYear) {
        query.academicYear = Number(academicYear);
      }

      const admissionRequirements = await AdmissionRequirement
        .find(query)
        .populate("sectorId", "name code subjects")
        .sort({ minimumScore: -1 });

      return res.status(200).json(ApiResponseWrapper.success("Lấy điểm chuẩn thành công", admissionRequirements));
    } catch (error) {
      console.error("Get admission requirements by university and major error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get available academic years
  static async getAcademicYears(req: Request, res: Response) {
    try {
      const years = await AdmissionRequirement.distinct("academicYear", { isActive: true });
      const sortedYears = years.sort((a, b) => b - a); // Descending order

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách năm học thành công", sortedYears));
    } catch (error) {
      console.error("Get academic years error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default AdmissionRequirementController;