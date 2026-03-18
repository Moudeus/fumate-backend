import mongoose, { Document, Schema } from "mongoose";

// ==================== OTP Schema ====================
export interface IOTP extends Document {
  email: string;
  otp: string;
  type: "register" | "forgot_password";
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OTPSchema = new mongoose.Schema<IOTP>({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    index: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["register", "forgot_password"], 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index - MongoDB will auto-delete
  },
  attempts: { 
    type: Number, 
    default: 0,
    max: 5 // Max 5 attempts
  }
}, { timestamps: true });

// Compound index for efficient lookup
OTPSchema.index({ email: 1, type: 1 });

// ==================== Pending Registration Schema ====================
export interface IPendingRegistration extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  expiresAt: Date;
  createdAt: Date;
}

const PendingRegistrationSchema = new mongoose.Schema<IPendingRegistration>({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, { timestamps: true });

// ==================== Export Models ====================
export const OTP = mongoose.model<IOTP>("otps", OTPSchema);
export const PendingRegistration = mongoose.model<IPendingRegistration>("pending_registrations", PendingRegistrationSchema);

