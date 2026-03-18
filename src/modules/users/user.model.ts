import mongoose, { Document } from "mongoose";
import * as bcrypt from "bcryptjs";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  coverImage?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  loginFailedCounts: number;
  loginFailedTime?: Date;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  verificationOTP?: string;
  verificationOTPExpires?: Date;
  mbtiType?: string;
  favoriteUniversities: mongoose.Types.ObjectId[];
  subscriptionTier: "free" | "premium" | "enterprise";
  subscriptionExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  phoneNumber: { type: String },
  address: { type: String },
  avatar: { type: String },
  coverImage: { type: String },
  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  loginFailedCounts: { type: Number, default: 0 },
  loginFailedTime: { type: Date },
  refreshToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  verificationOTP: { type: String },
  verificationOTPExpires: { type: Date },
  mbtiType: { type: String },
  favoriteUniversities: [{ type: mongoose.Schema.Types.ObjectId, ref: "universities" }],
  subscriptionTier: { type: String, enum: ["free", "premium", "enterprise"], default: "free" },
  subscriptionExpiry: { type: Date },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("users", UserSchema);
