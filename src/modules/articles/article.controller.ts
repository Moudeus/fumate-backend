import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import Article, { IArticle } from "./article.model";
import ArticleService from "./article.service";

export class ArticleController {
  // Get all articles
  static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        category: req.query.category,
        isPublished: req.query.isPublished !== "false",
        search: req.query.search,
      };

      const result = await ArticleService.findAll(page, limit, filters);
      return res.status(200).json(ApiResponseWrapper.paginated(
        "Lấy danh sách bài viết thành công",
        result.items,
        result.total,
        result.page,
        result.limit
      ));
    } catch (error) {
      console.error("Get articles error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get article by ID
  static async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const article = await ArticleService.findById(id);

      if (!article) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy bài viết"));
      }

      // Increment view count
      await ArticleService.incrementView(id);

      return res.status(200).json(ApiResponseWrapper.success("Lấy bài viết thành công", article));
    } catch (error) {
      console.error("Get article error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Get featured articles
  static async getFeatured(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const articles = await ArticleService.getFeatured(limit);
      return res.status(200).json(ApiResponseWrapper.success("Lấy bài viết nổi bật thành công", articles));
    } catch (error) {
      console.error("Get featured articles error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Create article (admin only)
  static async create(req: Request, res: Response) {
    try {
      const { title, summary, content, category, tags, coverImage, isPublished, isFeatured } = req.body;

      if (!title || !content) {
        return res.status(400).json(ApiResponseWrapper.error("Tiêu đề và nội dung là bắt buộc"));
      }

      const articleData: Partial<IArticle> = {
        title,
        summary,
        content,
        category,
        tags,
        coverImage,
        isPublished,
        isFeatured,
        author: {
          userID: new mongoose.Types.ObjectId(req.userId),
          name: (req as any).user?.firstName || "Admin",
        },
      };

      if (isPublished) {
        articleData.publishedAt = new Date();
      }

      const article = await ArticleService.create(articleData);
      return res.status(201).json(ApiResponseWrapper.success("Tạo bài viết thành công", article));
    } catch (error) {
      console.error("Create article error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Update article (admin only)
  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { title, summary, content, category, tags, coverImage, isPublished, isFeatured } = req.body;

      const updateData: Partial<IArticle> = {
        title,
        summary,
        content,
        category,
        tags,
        coverImage,
        isPublished,
        isFeatured,
      };

      if (isPublished) {
        (updateData as any).publishedAt = new Date();
      }

      const article = await ArticleService.update(id, updateData);
      if (!article) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy bài viết"));
      }

      return res.status(200).json(ApiResponseWrapper.success("Cập nhật bài viết thành công", article));
    } catch (error) {
      console.error("Update article error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }

  // Delete article (admin only)
  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const success = await ArticleService.delete(id);

      if (!success) {
        return res.status(404).json(ApiResponseWrapper.error("Không tìm thấy bài viết"));
      }

      return res.status(200).json(ApiResponseWrapper.success("Xóa bài viết thành công"));
    } catch (error) {
      console.error("Delete article error:", error);
      return res.status(500).json(ApiResponseWrapper.error("Lỗi server", String(error)));
    }
  }
}

export default ArticleController;
