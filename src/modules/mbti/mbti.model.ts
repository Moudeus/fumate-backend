import mongoose, { Document, Types, Schema } from "mongoose";

// ==================== Question Schema ====================
export interface IMBTIQuestion extends Document {
  question: string;
  category: "E-I" | "S-N" | "T-F" | "J-P";
  firstAnswer: string;  // Nội dung câu trả lời A
  secondAnswer: string; // Nội dung câu trả lời B
  order: number;
  isActive: boolean;
  inverted: boolean; // If true, choice "a" gives -1, choice "b" gives +1
  createdAt: Date;
  updatedAt: Date;
}

const MBTIQuestionSchema = new mongoose.Schema<IMBTIQuestion>({
  question: { 
    type: String, 
    required: [true, "Question text is required"],
    trim: true,
    maxlength: [500, "Question cannot exceed 500 characters"]
  },
  category: { 
    type: String, 
    enum: ["E-I", "S-N", "T-F", "J-P"],
    required: [true, "Category is required"]
  },
  firstAnswer: {
    type: String,
    required: [true, "First answer is required"],
    trim: true,
    maxlength: [200, "Answer cannot exceed 200 characters"]
  },
  secondAnswer: {
    type: String,
    required: [true, "Second answer is required"],
    trim: true,
    maxlength: [200, "Answer cannot exceed 200 characters"]
  },
  order: { 
    type: Number, 
    required: [true, "Order is required"],
    min: [0, "Order must be non-negative"]
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  inverted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index to ensure unique order within category
MBTIQuestionSchema.index({ category: 1, order: 1 }, { unique: true });

// ==================== MBTI Type Schema ====================
export interface IMBTIType extends Document {
  type: string; // INTJ, ENFP, etc.
  name: string; // The Architect, The Campaigner, etc.
  description: string;
  strengths: string[];
  weaknesses: string[];
  majors: Types.ObjectId[]; // Reference to Major model
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MBTITypeSchema = new mongoose.Schema<IMBTIType>({
  type: {
    type: String,
    required: [true, "MBTI type is required"],
    unique: true,
    uppercase: true,
    minlength: [4, "MBTI type must be 4 characters"],
    maxlength: [4, "MBTI type must be 4 characters"],
    match: [/^[EINTSFPJ]{4}$/, "Invalid MBTI type format"]
  },
  name: {
    type: String,
    required: [true, "Type name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
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
    maxlength: [100, "Strength cannot exceed 100 characters"]
  }],
  weaknesses: [{
    type: String,
    trim: true,
    maxlength: [100, "Weakness cannot exceed 100 characters"]
  }],
  majors: [{
    type: Schema.Types.ObjectId,
    ref: "majors"
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// ==================== Test Result Schema ====================
export interface IMBTIAnswer {
  questionID: Types.ObjectId;
  choice: "a" | "b";
}

export interface IMBTITestResult extends Document {
  userId: Types.ObjectId;
  answers: IMBTIAnswer[];
  resultType: string;
  scores: {
    "E-I": number;
    "S-N": number;
    "T-F": number;
    "J-P": number;
  };
  description: string;
  strengths: string[];
  weaknesses: string[];
  majors: Types.ObjectId[]; // Reference to Major model
  createdAt: Date;
}

const MBTITestResultSchema = new mongoose.Schema<IMBTITestResult>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "users", 
    required: [true, "User ID is required"],
    index: true
  },
  answers: [{
    questionID: { 
      type: Schema.Types.ObjectId, 
      ref: "mbti_questions",
      required: [true, "Question ID is required"]
    },
    choice: { 
      type: String, 
      enum: ["a", "b"],
      required: [true, "Choice is required"]
    }
  }],
  resultType: { 
    type: String, 
    required: [true, "Result type is required"],
    minlength: [4, "Result type must be 4 characters"],
    maxlength: [4, "Result type must be 4 characters"]
  },
  scores: {
    "E-I": { type: Number, default: 0 },
    "S-N": { type: Number, default: 0 },
    "T-F": { type: Number, default: 0 },
    "J-P": { type: Number, default: 0 }
  },
  description: { type: String },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  majors: [{
    type: Schema.Types.ObjectId,
    ref: "majors"
  }]
}, { timestamps: true });

// ==================== Export Models ====================
export const MBTIQuestion = mongoose.model<IMBTIQuestion>("mbti_questions", MBTIQuestionSchema);
export const MBTIType = mongoose.model<IMBTIType>("mbti_types", MBTITypeSchema);
export const MBTITestResult = mongoose.model<IMBTITestResult>("mbti_results", MBTITestResultSchema);
