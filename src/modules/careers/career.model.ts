import mongoose, { Schema, Document } from "mongoose";

export interface ICareer extends Document {
  name: string;
  code: string;
  description: string;
  requiredSkills: string[];
  salaryRange: { min: number; max: number };
  jobProspects: string;
  relatedMajors: mongoose.Types.ObjectId[];
  workEnvironment: string;
  careerPath: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    requiredSkills: [
      {
        type: String,
      },
    ],
    salaryRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
    },
    jobProspects: {
      type: String,
      default: "",
    },
    relatedMajors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Major",
      },
    ],
    workEnvironment: {
      type: String,
      default: "",
    },
    careerPath: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CareerSchema.index({ name: "text", description: "text" });

export default mongoose.model<ICareer>("Career", CareerSchema);
