import mongoose, { Schema, Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  author: {
    userID: mongoose.Types.ObjectId;
    name: string;
  };
  tags: string[];
  coverImage: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    summary: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["study_tips", "career_guidance", "university_info", "events", "news"],
      default: "news",
    },
    author: {
      userID: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
        default: "FU Mate",
      },
    },
    tags: [
      {
        type: String,
      },
    ],
    coverImage: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
ArticleSchema.index({ title: "text", summary: "text", content: "text" });

export default mongoose.model<IArticle>("Article", ArticleSchema);
