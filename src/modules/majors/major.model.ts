import mongoose, { Document, Types, Schema } from "mongoose";

// ==================== Major Interface ====================
export interface IMajor extends Document {
  code: string;
  name: string;
  description: string;
  duration: number; // Duration in years
  degreeLevel: string; // Bachelor, Master, PhD, etc.
  careerPaths: string[]; // Career opportunities
  requiredSkills: string[]; // Skills needed for this major
  salaryRange: { min: number; max: number }; // Expected salary range
  universities: Types.ObjectId[]; // Universities offering this major
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== MBTI Compatibility Interface ====================
export interface IMBTICompatibility extends Document {
  majorId: Types.ObjectId; // Reference to Major
  mbtiType: string; // MBTI type (INTJ, ENFP, etc.)
  compatibilityScore: number; // Compatibility percentage (0-100)
  description: string; // Why this major fits this MBTI type
  strengths: string[]; // Strengths of this MBTI type in this major
  challenges: string[]; // Potential challenges
  careerExamples: string[]; // Specific career examples for this combination
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Major Schema ====================
const MajorSchema = new mongoose.Schema<IMajor>({
  code: {
    type: String,
    required: [true, "Major code is required"],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, "Major code cannot exceed 10 characters"]
  },
  name: {
    type: String,
    required: [true, "Major name is required"],
    trim: true,
    maxlength: [200, "Major name cannot exceed 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Major description is required"],
    trim: true,
    maxlength: [2000, "Description cannot exceed 2000 characters"]
  },
  duration: {
    type: Number,
    required: [true, "Duration is required"],
    min: [1, "Duration must be at least 1 year"],
    max: [10, "Duration cannot exceed 10 years"],
    default: 4
  },
  degreeLevel: {
    type: String,
    required: [true, "Degree level is required"],
    enum: {
      values: ["Bachelor", "Master", "PhD", "Associate", "Certificate"],
      message: "Invalid degree level"
    },
    default: "Bachelor"
  },
  careerPaths: [{
    type: String,
    trim: true,
    maxlength: [100, "Career path cannot exceed 100 characters"]
  }],
  requiredSkills: [{
    type: String,
    trim: true,
    maxlength: [100, "Required skill cannot exceed 100 characters"]
  }],
  salaryRange: {
    min: {
      type: Number,
      required: [true, "Minimum salary is required"],
      min: [0, "Minimum salary cannot be negative"],
      default: 0
    },
    max: {
      type: Number,
      required: [true, "Maximum salary is required"],
      min: [0, "Maximum salary cannot be negative"],
      default: 0
    }
  },
  universities: [{
    type: Schema.Types.ObjectId,
    ref: "universities"
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== MBTI Compatibility Schema ====================
const MBTICompatibilitySchema = new mongoose.Schema<IMBTICompatibility>({
  majorId: {
    type: Schema.Types.ObjectId,
    ref: "majors",
    required: [true, "Major ID is required"],
    index: true
  },
  mbtiType: {
    type: String,
    required: [true, "MBTI type is required"],
    uppercase: true,
    minlength: [4, "MBTI type must be 4 characters"],
    maxlength: [4, "MBTI type must be 4 characters"],
    match: [/^[EINTSFPJ]{4}$/, "Invalid MBTI type format"]
  },
  compatibilityScore: {
    type: Number,
    required: [true, "Compatibility score is required"],
    min: [0, "Compatibility score cannot be less than 0"],
    max: [100, "Compatibility score cannot exceed 100"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  strengths: [{
    type: String,
    trim: true,
    maxlength: [200, "Strength cannot exceed 200 characters"]
  }],
  challenges: [{
    type: String,
    trim: true,
    maxlength: [200, "Challenge cannot exceed 200 characters"]
  }],
  careerExamples: [{
    type: String,
    trim: true,
    maxlength: [100, "Career example cannot exceed 100 characters"]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== Indexes ====================
// Compound index to ensure unique MBTI type per major
MBTICompatibilitySchema.index({ majorId: 1, mbtiType: 1 }, { unique: true });

// Text search indexes
MajorSchema.index({ name: "text", description: "text" });
MBTICompatibilitySchema.index({ description: "text" });

// ==================== Virtual Fields ====================
// Virtual field to get average compatibility score for a major
MajorSchema.virtual('averageCompatibilityScore', {
  ref: 'mbti_compatibility',
  localField: '_id',
  foreignField: 'majorId',
  justOne: false,
  options: { match: { isActive: true } }
});

// ==================== Middleware ====================
// Pre-save validation for salary range
MajorSchema.pre('save', function(next) {
  if (this.salaryRange.min > this.salaryRange.max) {
    next(new Error('Minimum salary cannot be greater than maximum salary'));
  }
  next();
});

// Pre-save validation for compatibility score calculation
MBTICompatibilitySchema.pre('save', function(next) {
  // Ensure compatibility score is within valid range
  if (this.compatibilityScore < 0 || this.compatibilityScore > 100) {
    next(new Error('Compatibility score must be between 0 and 100'));
  }
  next();
});

// ==================== Static Methods ====================
// Get majors ranked by MBTI compatibility
MajorSchema.statics.getMajorsByMBTICompatibility = async function(mbtiType: string, limit: number = 10) {
  return await this.aggregate([
    {
      $lookup: {
        from: 'mbti_compatibilities',
        localField: '_id',
        foreignField: 'majorId',
        as: 'compatibility'
      }
    },
    {
      $unwind: '$compatibility'
    },
    {
      $match: {
        'compatibility.mbtiType': mbtiType.toUpperCase(),
        'compatibility.isActive': true,
        'isActive': true
      }
    },
    {
      $sort: { 'compatibility.compatibilityScore': -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        code: 1,
        name: 1,
        description: 1,
        careerPaths: 1,
        compatibilityScore: '$compatibility.compatibilityScore',
        compatibilityDescription: '$compatibility.description',
        strengths: '$compatibility.strengths',
        challenges: '$compatibility.challenges',
        careerExamples: '$compatibility.careerExamples'
      }
    }
  ]);
};

// Get compatibility data for a specific major and MBTI type
MBTICompatibilitySchema.statics.getCompatibilityByMajorAndType = async function(majorId: string, mbtiType: string) {
  return await this.findOne({
    majorId: new mongoose.Types.ObjectId(majorId),
    mbtiType: mbtiType.toUpperCase(),
    isActive: true
  }).populate('majorId', 'name code description careerPaths');
};

// ==================== Export Models ====================
export const Major = mongoose.model<IMajor>("majors", MajorSchema);
export const MBTICompatibility = mongoose.model<IMBTICompatibility>("mbti_compatibility", MBTICompatibilitySchema);

export default { Major, MBTICompatibility };