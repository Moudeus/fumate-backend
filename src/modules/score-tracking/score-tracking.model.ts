import mongoose, { Document, Types, Schema } from "mongoose";

// Score Tracking Model - Updated to reference Subject by ID
export interface IScoreTracking extends Document {
  userID: Types.ObjectId;
  subjectID: Types.ObjectId;
  score: number;
  examDate: Date;
  examType: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ScoreTrackingSchema = new mongoose.Schema<IScoreTracking>({
  userID: { type: Schema.Types.ObjectId, ref: "users", required: true },
  subjectID: { type: Schema.Types.ObjectId, ref: "subjects", required: true },
  score: { type: Number, required: true, min: 0, max: 10 },
  examDate: { type: Date, required: true },
  examType: { type: String, required: true },
  notes: { type: String, default: "" },
}, { timestamps: true });

export interface IFavoriteUniversity extends Document {
  userID: Types.ObjectId;
  universityID: Types.ObjectId;
  notes: string;
  createdAt: Date;
}

export const FavoriteUniversitySchema = new mongoose.Schema<IFavoriteUniversity>({
  userID: { type: Schema.Types.ObjectId, ref: "users", required: true },
  universityID: { type: Schema.Types.ObjectId, ref: "universities", required: true },
  notes: { type: String },
}, { timestamps: true });

// Export models
export const ScoreTracking = mongoose.model<IScoreTracking>("score_tracking", ScoreTrackingSchema);
export const FavoriteUniversity = mongoose.model<IFavoriteUniversity>("favorite_universities", FavoriteUniversitySchema);

export default { ScoreTracking, FavoriteUniversity };

