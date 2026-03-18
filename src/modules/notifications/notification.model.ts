import mongoose, { Document, Types, Schema } from "mongoose";

export interface INotification extends Document {
  userID: Types.ObjectId;
  title: string;
  message: string;
  type: "system" | "admission" | "reminder" | "result";
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export const NotificationSchema = new mongoose.Schema<INotification>({
  userID: { type: Schema.Types.ObjectId, ref: "users", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["system", "admission", "reminder", "result"], default: "system" },
  isRead: { type: Boolean, default: false },
  data: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model<INotification>("notifications", NotificationSchema);

