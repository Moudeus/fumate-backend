import mongoose, { Document, Schema, Types } from "mongoose";

// Sector Model - Combination of exactly 3 subjects for university admission
export interface ISector extends Document {
  name: string;
  code: string; // e.g., "A00", "A01", "B00"
  description: string;
  subjects: Types.ObjectId[]; // Exactly 3 subjects
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const SectorSchema = new mongoose.Schema<ISector>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, default: "" },
  subjects: [{ 
    type: Schema.Types.ObjectId, 
    ref: "subjects"
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Add validation for exactly 3 subjects
SectorSchema.pre('save', function(next) {
  if (this.subjects.length !== 3) {
    return next(new Error('Sector must have exactly 3 subjects'));
  }
  next();
});

// Add indexes for better performance
SectorSchema.index({ isActive: 1 });
SectorSchema.index({ code: 1 });
SectorSchema.index({ name: "text", description: "text" });

// Export model
export const Sector = mongoose.model<ISector>("sectors", SectorSchema);

export default Sector;