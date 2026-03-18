import { Major, MBTICompatibility, IMajor, IMBTICompatibility } from './major.model';
import mongoose from 'mongoose';

export class MajorService {
  // ==================== Major CRUD Operations ====================
  
  /**
   * Get all active majors with optional pagination
   */
  static async getAllMajors(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const majors = await Major.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
    
    const total = await Major.countDocuments(query);
    
    return {
      majors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Get major by ID with full details
   */
  static async getMajorById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid major ID');
    }
    
    const major = await Major.findOne({ _id: id, isActive: true });
    
    if (!major) {
      throw new Error('Major not found');
    }
    
    return major;
  }
  
  /**
   * Create a new major
   */
  static async createMajor(majorData: Partial<IMajor>) {
    // Check if major code already exists
    const existingMajor = await Major.findOne({ code: majorData.code?.toUpperCase() });
    if (existingMajor) {
      throw new Error('Major code already exists');
    }
    
    const major = new Major(majorData);
    await major.save();
    
    return await this.getMajorById(major._id.toString());
  }
  
  /**
   * Update major by ID
   */
  static async updateMajor(id: string, updateData: Partial<IMajor>) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid major ID');
    }
    
    // If updating code, check for duplicates
    if (updateData.code) {
      const existingMajor = await Major.findOne({ 
        code: updateData.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingMajor) {
        throw new Error('Major code already exists');
      }
    }
    
    const major = await Major.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!major) {
      throw new Error('Major not found');
    }
    
    return await this.getMajorById(id);
  }
  
  /**
   * Soft delete major by ID
   */
  static async deleteMajor(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid major ID');
    }
    
    const major = await Major.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!major) {
      throw new Error('Major not found');
    }
    
    return { message: 'Major deleted successfully' };
  }
  
  // ==================== MBTI Compatibility Operations ====================
  
  /**
   * Get majors ranked by MBTI compatibility with related careers and universities
   */
  static async getMajorsByMBTICompatibility(mbtiType: string, limit: number = 10) {
    if (!mbtiType || mbtiType.length !== 4) {
      throw new Error('Invalid MBTI type format');
    }
    
    const majors = await (Major as any).getMajorsByMBTICompatibility(mbtiType.toUpperCase(), limit);
    
    // For each major, populate related careers and universities
    const enrichedMajors = await Promise.all(
      majors.map(async (major: any) => {
        // Get related careers
        const Career = (await import('../careers/career.model')).default;
        const relatedCareers = await Career.find({
          relatedMajors: major._id,
          isActive: true
        }).select('name code description salaryRange jobProspects');
        
        // Get universities offering this major
        const { University } = await import('../universities/university.model');
        const universities = await University.find({
          majors: major._id,
          isActive: true
        }).select('name code logo location tuitionRange');
        
        return {
          ...major,
          relatedCareers,
          universities
        };
      })
    );
    
    return enrichedMajors;
  }
  
  /**
   * Get compatibility data for a specific major and MBTI type
   */
  static async getCompatibilityByMajorAndType(majorId: string, mbtiType: string) {
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      throw new Error('Invalid major ID');
    }
    
    if (!mbtiType || mbtiType.length !== 4) {
      throw new Error('Invalid MBTI type format');
    }
    
    const compatibility = await (MBTICompatibility as any).getCompatibilityByMajorAndType(majorId, mbtiType);
    return compatibility;
  }
  
  /**
   * Create MBTI compatibility record
   */
  static async createMBTICompatibility(compatibilityData: Partial<IMBTICompatibility>) {
    // Validate major exists
    const major = await Major.findById(compatibilityData.majorId);
    if (!major) {
      throw new Error('Major not found');
    }
    
    // Check if compatibility already exists for this major-MBTI combination
    const existingCompatibility = await MBTICompatibility.findOne({
      majorId: compatibilityData.majorId,
      mbtiType: compatibilityData.mbtiType?.toUpperCase()
    });
    
    if (existingCompatibility) {
      throw new Error('Compatibility record already exists for this major-MBTI combination');
    }
    
    const compatibility = new MBTICompatibility(compatibilityData);
    await compatibility.save();
    
    return compatibility;
  }
  
  /**
   * Update MBTI compatibility record
   */
  static async updateMBTICompatibility(id: string, updateData: Partial<IMBTICompatibility>) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid compatibility ID');
    }
    
    const compatibility = await MBTICompatibility.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!compatibility) {
      throw new Error('Compatibility record not found');
    }
    
    return compatibility;
  }
  
  /**
   * Delete MBTI compatibility record
   */
  static async deleteMBTICompatibility(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid compatibility ID');
    }
    
    const compatibility = await MBTICompatibility.findById(id);
    if (!compatibility) {
      throw new Error('Compatibility record not found');
    }
    
    // Soft delete compatibility record
    await MBTICompatibility.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() }
    );
    
    return { message: 'Compatibility record deleted successfully' };
  }
  
  /**
   * Get all compatibility records for a major
   */
  static async getCompatibilityByMajor(majorId: string) {
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      throw new Error('Invalid major ID');
    }
    
    const compatibilities = await MBTICompatibility.find({
      majorId: new mongoose.Types.ObjectId(majorId),
      isActive: true
    }).sort({ compatibilityScore: -1 });
    
    return compatibilities;
  }
  
  /**
   * Get all compatibility records for an MBTI type
   */
  static async getCompatibilityByMBTIType(mbtiType: string) {
    if (!mbtiType || mbtiType.length !== 4) {
      throw new Error('Invalid MBTI type format');
    }
    
    const compatibilities = await MBTICompatibility.find({
      mbtiType: mbtiType.toUpperCase(),
      isActive: true
    })
    .sort({ compatibilityScore: -1 });
    
    return compatibilities;
  }
  
  // ==================== Analytics and Statistics ====================
  
  /**
   * Get major statistics
   */
  static async getMajorStatistics() {
    const stats = await Major.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalMajors: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          avgMinSalary: { $avg: '$salaryRange.min' },
          avgMaxSalary: { $avg: '$salaryRange.max' },
          degreeDistribution: {
            $push: '$degreeLevel'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalMajors: 1,
          avgDuration: { $round: ['$avgDuration', 1] },
          avgMinSalary: { $round: ['$avgMinSalary', 0] },
          avgMaxSalary: { $round: ['$avgMaxSalary', 0] },
          degreeDistribution: 1
        }
      }
    ]);
    
    return stats[0] || {};
  }
  
  /**
   * Get compatibility statistics
   */
  static async getCompatibilityStatistics() {
    const stats = await MBTICompatibility.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$mbtiType',
          count: { $sum: 1 },
          avgCompatibility: { $avg: '$compatibilityScore' },
          maxCompatibility: { $max: '$compatibilityScore' },
          minCompatibility: { $min: '$compatibilityScore' }
        }
      },
      {
        $sort: { avgCompatibility: -1 }
      }
    ]);
    
    return stats;
  }
}