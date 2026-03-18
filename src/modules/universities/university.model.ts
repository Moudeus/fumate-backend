import mongoose, { Document, Types, Schema } from "mongoose";
import { Major } from "../majors/major.model";

export interface IUniversity extends Document {
  name: string;
  code: string;
  logo: string;
  coverImage: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  strengths: string[];
  majors: Types.ObjectId[];
  admissionMethods: string[];
  tuitionRange: { min: number; max: number };
  scholarshipInfo: string;
  location: { city: string; region: string };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const UniversitySchema = new mongoose.Schema<IUniversity>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  logo: { type: String },
  coverImage: { type: String },
  website: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  description: { type: String },
  strengths: [{ type: String }],
  majors: [{ type: Schema.Types.ObjectId, ref: "majors" }],
  admissionMethods: [{ type: String }],
  tuitionRange: { min: { type: Number }, max: { type: Number } },
  scholarshipInfo: { type: String },
  location: { city: { type: String }, region: { type: String } },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export interface IAdmissionScore extends Document {
  universityID: Types.ObjectId;
  majorID: Types.ObjectId;
  year: number;
  method: string;
  score: number;
  quota: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AdmissionScoreSchema = new mongoose.Schema<IAdmissionScore>({
  universityID: { type: Schema.Types.ObjectId, ref: "universities", required: true },
  majorID: { type: Schema.Types.ObjectId, ref: "majors", required: true },
  year: { type: Number, required: true },
  method: { type: String, required: true },
  score: { type: Number, required: true },
  quota: { type: Number },
  notes: { type: String },
}, { timestamps: true });

// AdmissionRequirement Model - Links universities, majors, and sectors with minimum scores
export interface IAdmissionRequirement extends Document {
  universityId: Types.ObjectId;
  majorId: Types.ObjectId;
  sectorId: Types.ObjectId;
  minimumScore: number; // 0-30 range (sum of 3 subjects)
  academicYear: number;
  additionalRequirements?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const AdmissionRequirementSchema = new mongoose.Schema<IAdmissionRequirement>({
  universityId: { type: Schema.Types.ObjectId, ref: "universities", required: true },
  majorId: { type: Schema.Types.ObjectId, ref: "majors", required: true },
  sectorId: { type: Schema.Types.ObjectId, ref: "sectors", required: true },
  minimumScore: { 
    type: Number, 
    required: true,
    min: 0,
    max: 30,
    validate: {
      validator: function(score: number) {
        return score >= 0 && score <= 30;
      },
      message: "Minimum score must be between 0 and 30"
    }
  },
  academicYear: { type: Number, required: true },
  additionalRequirements: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Add compound index to prevent duplicate requirements
AdmissionRequirementSchema.index({ 
  universityId: 1, 
  majorId: 1, 
  sectorId: 1, 
  academicYear: 1 
}, { unique: true });

// Add indexes for better performance
AdmissionRequirementSchema.index({ isActive: 1 });
AdmissionRequirementSchema.index({ academicYear: -1 });

// Export models
export const University = mongoose.model<IUniversity>("universities", UniversitySchema);
export const AdmissionScore = mongoose.model<IAdmissionScore>("admission_scores", AdmissionScoreSchema);
export const AdmissionRequirement = mongoose.model<IAdmissionRequirement>("admission_requirements", AdmissionRequirementSchema);

export default { University, Major, AdmissionScore, AdmissionRequirement };

