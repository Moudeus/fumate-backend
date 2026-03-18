import mongoose from "mongoose";
import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import UniversityService from "./university.service";
import { AuthenticatedRequest } from "../../interfaces/AuthenticatedRequest";

export class UniversityController {
  // Get all universities with pagination, search, and major filtering
  static async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, majorId } = req.query;

      const result = await UniversityService.getUniversities({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        majorId: majorId as string
      });

      return res.status(200).json(ApiResponseWrapper.paginated(
        "Lấy danh sách trường đại học thành công",
        result.universities,
        result.total,
        result.page,
        result.limit
      ));
    } catch (error) {
      console.error("Get universities error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get university by ID
  static async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      
      const university = await UniversityService.getUniversityById(id);
      return res.status(200).json(ApiResponseWrapper.success("Lấy thông tin trường thành công", university));
    } catch (error) {
      console.error("Get university error:", error);
      if (error instanceof Error) {
        if (error.message === "Invalid university ID") {
          return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
        }
        if (error.message === "University not found") {
          return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy trường đại học"));
        }
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get universities by major
  static async getUniversitiesByMajor(req: Request, res: Response) {
    try {
      const { majorId } = req.params;
      const { page = 1, limit = 10, search } = req.query;

      const result = await UniversityService.getUniversitiesByMajor(majorId as string, {
        page: Number(page),
        limit: Number(limit),
        search: search as string
      });

      return res.status(200).json(ApiResponseWrapper.paginated(
        "Lấy danh sách trường theo ngành thành công",
        result.universities,
        result.total,
        result.page,
        result.limit
      ));
    } catch (error) {
      console.error("Get universities by major error:", error);
      if (error instanceof Error && error.message === "Invalid major ID") {
        return res.status(400).json(ApiResponseWrapper.error("ID ngành không hợp lệ"));
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get admission requirements for a university
  static async getAdmissionRequirements(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { majorId, year } = req.query;

      const requirements = await UniversityService.getAdmissionRequirements(
        id as string,
        majorId as string,
        year ? Number(year) : undefined
      );

      return res.status(200).json(ApiResponseWrapper.success("Lấy yêu cầu tuyển sinh thành công", requirements));
    } catch (error) {
      console.error("Get admission requirements error:", error);
      if (error instanceof Error && error.message === "Invalid university ID") {
        return res.status(400).json(ApiResponseWrapper.error("ID trường không hợp lệ"));
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get admission scores for a university (legacy support)
  static async getAdmissionScores(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { year } = req.query;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
      }

      const query: any = { universityID: new mongoose.Types.ObjectId(id) };
      if (year) {
        query.year = Number(year);
      }

      const scores = await mongoose.connection.collection("admission_scores")
        .find(query)
        .sort({ year: -1 })
        .toArray();

      return res.status(200).json(ApiResponseWrapper.success("Lấy điểm chuẩn thành công", scores));
    } catch (error) {
      console.error("Get admission scores error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get all majors
  static async getMajors(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, search, universityId } = req.query;

      const result = await UniversityService.getMajors({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        universityId: universityId as string
      });

      return res.status(200).json(ApiResponseWrapper.paginated(
        "Lấy danh sách ngành thành công",
        result.majors,
        result.total,
        result.page,
        result.limit
      ));
    } catch (error) {
      console.error("Get majors error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get majors by university
  static async getMajorsByUniversity(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
      }

      const university = await mongoose.connection.collection("universities")
        .findOne({ _id: new mongoose.Types.ObjectId(id) });

      if (!university) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy trường"));
      }

      const majors = await mongoose.connection.collection("majors")
        .find({ _id: { $in: university.majors as any }, isActive: true })
        .toArray();

      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách ngành thành công", majors));
    } catch (error) {
      console.error("Get majors by university error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get sectors
  static async getSectors(req: Request, res: Response) {
    try {
      const sectors = await UniversityService.getSectors();
      return res.status(200).json(ApiResponseWrapper.success("Lấy danh sách khối thi thành công", sectors));
    } catch (error) {
      console.error("Get sectors error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Calculate admission probability
  static async calculateAdmissionProbability(req: Request, res: Response) {
    try {
      const { universityId, majorId } = req.params;
      const { scores } = req.body;

      if (!scores || typeof scores !== 'object') {
        return res.status(400).json(ApiResponseWrapper.error("Điểm số không hợp lệ"));
      }

      const result = await UniversityService.calculateAdmissionProbability(
        universityId as string,
        majorId as string,
        scores
      );

      return res.status(200).json(ApiResponseWrapper.success("Tính toán xác suất đỗ thành công", result));
    } catch (error) {
      console.error("Calculate admission probability error:", error);
      if (error instanceof Error && error.message.includes("Invalid")) {
        return res.status(400).json(ApiResponseWrapper.error("Thông tin không hợp lệ"));
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Add university to favorites
  static async addToFavorites(req: AuthenticatedRequest, res: Response) {
    try {
      const { universityId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(ApiResponseWrapper.error("Không có quyền truy cập"));
      }

      const result = await UniversityService.addToFavorites(userId, universityId as string);
      return res.status(200).json(ApiResponseWrapper.success("Đã thêm vào danh sách yêu thích", result));
    } catch (error) {
      console.error("Add to favorites error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Invalid")) {
          return res.status(400).json(ApiResponseWrapper.error("Thông tin không hợp lệ"));
        }
        if (error.message === "University not found") {
          return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy trường đại học"));
        }
        if (error.message === "User not found") {
          return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy người dùng"));
        }
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Remove university from favorites
  static async removeFromFavorites(req: AuthenticatedRequest, res: Response) {
    try {
      const { universityId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(ApiResponseWrapper.error("Không có quyền truy cập"));
      }

      const result = await UniversityService.removeFromFavorites(userId, universityId as string);
      return res.status(200).json(ApiResponseWrapper.success("Đã xóa khỏi danh sách yêu thích", result));
    } catch (error) {
      console.error("Remove from favorites error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Invalid")) {
          return res.status(400).json(ApiResponseWrapper.error("Thông tin không hợp lệ"));
        }
        if (error.message === "User not found") {
          return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy người dùng"));
        }
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get user's favorite universities
  static async getFavorites(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10, search } = req.query;

      if (!userId) {
        return res.status(401).json(ApiResponseWrapper.error("Không có quyền truy cập"));
      }

      const result = await UniversityService.getFavoriteUniversities(userId, {
        page: Number(page),
        limit: Number(limit),
        search: search as string
      });

      return res.status(200).json(ApiResponseWrapper.paginated(
        "Lấy danh sách trường yêu thích thành công",
        result.universities,
        result.total,
        result.page,
        result.limit
      ));
    } catch (error) {
      console.error("Get favorites error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Invalid")) {
          return res.status(400).json(ApiResponseWrapper.error("Thông tin không hợp lệ"));
        }
        if (error.message === "User not found") {
          return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy người dùng"));
        }
      }
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Check if university is favorite
  static async checkFavorite(req: AuthenticatedRequest, res: Response) {
    try {
      const { universityId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(ApiResponseWrapper.error("Không có quyền truy cập"));
      }

      const isFavorite = await UniversityService.isFavorite(userId, universityId as string);
      return res.status(200).json(ApiResponseWrapper.success("Kiểm tra yêu thích thành công", { isFavorite }));
    } catch (error) {
      console.error("Check favorite error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default UniversityController;
