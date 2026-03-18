import mongoose from "mongoose";
import { University, AdmissionRequirement } from "./university.model";
import { Major } from "../majors/major.model";
import { Sector } from "./sector.model";
import User from "../users/user.model";

export class UniversityService {
  // Get all universities with optional filtering by major
  static async getUniversities(params: {
    page?: number;
    limit?: number;
    search?: string;
    majorId?: string;
  }) {
    const { page = 1, limit = 10, search, majorId } = params;
    const skip = (page - 1) * limit;

    let query: any = { isActive: true };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        { "location.region": { $regex: search, $options: "i" } }
      ];
    }

    // Filter by major if specified
    if (majorId && mongoose.Types.ObjectId.isValid(majorId)) {
      query.majors = new mongoose.Types.ObjectId(majorId);
    }

    const universities = await University.find(query)
      .populate('majors', 'name code description careerProspects')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await University.countDocuments(query);

    return {
      universities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get university by ID with detailed information
  static async getUniversityById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid university ID");
    }

    const university = await University.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      isActive: true 
    }).populate('majors', 'name code description careerProspects requiredSkills salaryRange');

    if (!university) {
      throw new Error("University not found");
    }

    return university;
  }

  // Get universities offering a specific major
  static async getUniversitiesByMajor(majorId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      throw new Error("Invalid major ID");
    }

    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    let query: any = { 
      isActive: true,
      majors: new mongoose.Types.ObjectId(majorId)
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } }
      ];
    }

    const universities = await University.find(query)
      .populate('majors', 'name code description')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await University.countDocuments(query);

    return {
      universities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get admission requirements for a university and major
  static async getAdmissionRequirements(universityId: string, majorId?: string, academicYear?: number) {
    if (!mongoose.Types.ObjectId.isValid(universityId)) {
      throw new Error("Invalid university ID");
    }

    let query: any = { 
      universityId: new mongoose.Types.ObjectId(universityId),
      isActive: true
    };

    if (majorId && mongoose.Types.ObjectId.isValid(majorId)) {
      query.majorId = new mongoose.Types.ObjectId(majorId);
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    const requirements = await AdmissionRequirement.find(query)
      .populate('majorId', 'name code description')
      .populate('sectorId', 'name code description subjects')
      .populate({
        path: 'sectorId',
        populate: {
          path: 'subjects',
          model: 'subjects',
          select: 'name code'
        }
      })
      .sort({ academicYear: -1, minimumScore: 1 });

    return requirements;
  }

  // Get all majors with optional filtering
  static async getMajors(params: {
    page?: number;
    limit?: number;
    search?: string;
    universityId?: string;
  } = {}) {
    const { page = 1, limit = 50, search, universityId } = params;
    const skip = (page - 1) * limit;

    let query: any = { isActive: true };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by university if specified
    if (universityId && mongoose.Types.ObjectId.isValid(universityId)) {
      query.universities = new mongoose.Types.ObjectId(universityId);
    }

    const majors = await Major.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Major.countDocuments(query);

    return {
      majors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get sectors (for admission requirements)
  static async getSectors() {
    const sectors = await Sector.find({ isActive: true })
      .populate('subjects', 'name code')
      .sort({ code: 1 });

    return sectors;
  }

  // Calculate admission probability for a student
  static async calculateAdmissionProbability(
    universityId: string, 
    majorId: string, 
    studentScores: { [subjectId: string]: number }
  ) {
    if (!mongoose.Types.ObjectId.isValid(universityId) || !mongoose.Types.ObjectId.isValid(majorId)) {
      throw new Error("Invalid university or major ID");
    }

    // Get admission requirements for the university and major
    const requirements = await this.getAdmissionRequirements(universityId, majorId);
    
    if (!requirements.length) {
      return {
        bestResult: undefined,
        allResults: [],
        hasResults: false
      };
    }

    const results = [];

    for (const requirement of requirements) {
      const sector = requirement.sectorId as any;
      if (!sector || !sector.subjects) continue;

      // Calculate total score for this sector
      let totalScore = 0;
      let hasAllScores = true;

      for (const subject of sector.subjects) {
        const subjectScore = studentScores[subject._id.toString()];
        if (subjectScore === undefined || subjectScore === null) {
          hasAllScores = false;
          break;
        }
        totalScore += subjectScore;
      }

      if (!hasAllScores) continue;

      const scoreGap = totalScore - requirement.minimumScore;
      let probability: 'high' | 'medium' | 'low';
      let message: string;

      if (scoreGap >= 2) {
        probability = 'high';
        message = 'Khả năng đỗ cao';
      } else if (scoreGap >= 0) {
        probability = 'medium';
        message = 'Khả năng đỗ trung bình';
      } else {
        probability = 'low';
        message = 'Cần cố gắng';
      }

      results.push({
        sectorId: sector._id,
        sectorName: sector.name,
        sectorCode: sector.code,
        studentScore: totalScore,
        minimumScore: requirement.minimumScore,
        scoreGap,
        probability,
        message,
        academicYear: requirement.academicYear
      });
    }

    // Find the best probability
    const bestResult = results.reduce((best, current) => {
      const probabilityOrder = { high: 3, medium: 2, low: 1 };
      return probabilityOrder[current.probability] > probabilityOrder[best?.probability || 'low'] 
        ? current 
        : best;
    }, results[0]);

    return {
      bestResult,
      allResults: results,
      hasResults: results.length > 0
    };
  }

  // Add university to user's favorites
  static async addToFavorites(userId: string, universityId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(universityId)) {
      throw new Error("Invalid user or university ID");
    }

    // Check if university exists
    const university = await University.findOne({ 
      _id: new mongoose.Types.ObjectId(universityId), 
      isActive: true 
    });
    
    if (!university) {
      throw new Error("University not found");
    }

    // Add to favorites if not already present
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteUniversities: new mongoose.Types.ObjectId(universityId) } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return { success: true, message: "University added to favorites" };
  }

  // Remove university from user's favorites
  static async removeFromFavorites(userId: string, universityId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(universityId)) {
      throw new Error("Invalid user or university ID");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteUniversities: new mongoose.Types.ObjectId(universityId) } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return { success: true, message: "University removed from favorites" };
  }

  // Get user's favorite universities
  static async getFavoriteUniversities(userId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select('favoriteUniversities');
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.favoriteUniversities || user.favoriteUniversities.length === 0) {
      return {
        universities: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }

    let query: any = { 
      _id: { $in: user.favoriteUniversities },
      isActive: true 
    };

    // Add search functionality
    if (search) {
      query.$and = [
        { _id: { $in: user.favoriteUniversities } },
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { code: { $regex: search, $options: "i" } },
            { "location.city": { $regex: search, $options: "i" } },
            { "location.region": { $regex: search, $options: "i" } }
          ]
        }
      ];
    }

    const universities = await University.find(query)
      .populate('majors', 'name code description careerProspects')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await University.countDocuments(query);

    return {
      universities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Check if university is in user's favorites
  static async isFavorite(userId: string, universityId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(universityId)) {
      return false;
    }

    const user = await User.findById(userId).select('favoriteUniversities');
    if (!user) {
      return false;
    }

    return user.favoriteUniversities?.some(
      (favId: mongoose.Types.ObjectId) => favId.toString() === universityId
    ) || false;
  }
}

export default UniversityService;