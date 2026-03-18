import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";
import Career, { ICareer } from "./career.model";
import mongoose from "mongoose";

export class CareerService {
  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<{ items: ICareer[]; total: number; page: number; limit: number }> {
    const query: any = { isActive: true };

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Career.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .then(docs => docs as unknown as ICareer[]),
      Career.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  static async findById(id: string): Promise<ICareer | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Career.findById(id).lean().then(doc => doc as unknown as ICareer | null);
  }

  static async findByMajor(majorId: string): Promise<ICareer[]> {
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      return [];
    }
    return Career.find({ relatedMajors: new mongoose.Types.ObjectId(majorId), isActive: true })
      .lean()
      .then(docs => docs as unknown as ICareer[]);
  }

  static async create(data: Partial<ICareer>): Promise<ICareer> {
    const career = new Career(data);
    return career.save();
  }

  static async update(id: string, data: Partial<ICareer>): Promise<ICareer | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Career.findByIdAndUpdate(id, data, { new: true }).lean().then(doc => doc as unknown as ICareer | null);
  }

  static async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Career.findByIdAndDelete(id);
    return !!result;
  }
}

export default CareerService;

