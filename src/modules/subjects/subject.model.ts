import mongoose, { Document } from "mongoose";

// Subject Model - Admin managed subjects for score tracking
export interface ISubject extends Document {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const SubjectSchema = new mongoose.Schema<ISubject>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Add indexes for better performance
SubjectSchema.index({ isActive: 1 });
SubjectSchema.index({ name: "text", description: "text" });

// Export model
export const Subject = mongoose.model<ISubject>("subjects", SubjectSchema);

export default Subject;