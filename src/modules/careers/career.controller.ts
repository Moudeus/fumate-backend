import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import Career, { ICareer } from "./career.model";
import CareerService from "./career.service";

export class CareerController {
  static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await CareerService.findAll(page, limit, { search });
      return res.status(200).json(ApiResponseWrapper.paginated(
        "Lấy danh sách nghề nghiệp thành công",
        result.items,
        result.total,
        result.page,
        result.limit
      ));
    } catch (error) {
      console.error("Get careers error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const career = await CareerService.findById(id);

      if (!career) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy nghề nghiệp"));
      }

      return res.status(200).json(ApiResponseWrapper.success("Lấy thông tin nghề nghiệp thành công", career));
    } catch (error) {
      console.error("Get career error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async getByMajor(req: Request, res: Response) {
    try {
      const majorId = req.params.majorId as string;
      const careers = await CareerService.findByMajor(majorId);
      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách nghề nghiệp thành công", careers));
    } catch (error) {
      console.error("Get careers by major error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, code, description, requiredSkills, salaryRange, jobProspects, relatedMajors, workEnvironment, careerPath } = req.body;

      if (!name || !code) {
        return res.status(400).json(ApiResponseWrapper.error("Tên và mã nghề nghiệp là bắt buộc"));
      }

      const career = await CareerService.create({
        name,
        code,
        description,
        requiredSkills,
        salaryRange,
        jobProspects,
        relatedMajors,
        workEnvironment,
        careerPath,
      });

      return res.status(201).json(ApiResponseWrapper.success("Tạo nghề nghiệp thành công", career));
    } catch (error) {
      console.error("Create career error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const career = await CareerService.update(id, req.body);

      if (!career) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy nghề nghiệp"));
      }

      return res.status(200).json(ApiResponseWrapper.success("Cập nhật nghề nghiệp thành công", career));
    } catch (error) {
      console.error("Update career error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const success = await CareerService.delete(id);

      if (!success) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy nghề nghiệp"));
      }

      return res.status(200).json(ApiResponseWrapper.success("Xóa nghề nghiệp thành công"));
    } catch (error) {
      console.error("Delete career error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default CareerController;
