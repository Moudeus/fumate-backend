import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import Article, { IArticle } from "./article.model";
import mongoose, { Types } from "mongoose";

export class ArticleService {
  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<{ items: IArticle[]; total: number; page: number; limit: number }> {
    const query: any = { isActive: true };

    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.isPublished !== undefined) {
      query.isPublished = filters.isPublished;
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Article.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .then(docs => docs as unknown as IArticle[]),
      Article.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  static async findById(id: string): Promise<IArticle | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Article.findById(id).lean().then(doc => doc as unknown as IArticle | null);
  }

  static async findBySlug(slug: string): Promise<IArticle | null> {
    return Article.findOne({ slug, isActive: true }).lean().then(doc => doc as unknown as IArticle | null);
  }

  static async create(data: Partial<IArticle>): Promise<IArticle> {
    const article = new Article({
      ...data,
      slug: data.slug || this.generateSlug(data.title || ""),
    });
    return article.save();
  }

  static async update(id: string, data: Partial<IArticle>): Promise<IArticle | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Article.findByIdAndUpdate(id, data, { new: true }).lean().then(doc => doc as unknown as IArticle | null);
  }

  static async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Article.findByIdAndDelete(id);
    return !!result;
  }

  static async incrementView(id: string): Promise<void> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Article.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    }
  }

  static async getFeatured(limit: number = 5): Promise<IArticle[]> {
    return Article.find({ isActive: true, isPublished: true, isFeatured: true })
      .sort({ viewCount: -1 })
      .limit(limit)
      .lean()
      .then(docs => docs as unknown as IArticle[]);
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
}

export default ArticleService;

