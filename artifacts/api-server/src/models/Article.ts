import mongoose, { Schema, Document, Types } from "mongoose";

export interface IArticle extends Document {
  title: string;
  titleMr: string | null;
  titleHi: string | null;
  slug: string;
  summary: string;
  summaryMr: string | null;
  summaryHi: string | null;
  content: string;
  contentMr: string | null;
  contentHi: string | null;
  category: Types.ObjectId;
  author: string;
  imageUrl: string | null;
  tags: string[];
  status: "draft" | "published" | "archived";
  featured: boolean;
  lang: "en" | "mr" | "hi" | "both" | "all";
  viewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    titleMr: { type: String, default: null },
    titleHi: { type: String, default: null },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    summaryMr: { type: String, default: null },
    summaryHi: { type: String, default: null },
    content: { type: String, required: true },
    contentMr: { type: String, default: null },
    contentHi: { type: String, default: null },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, default: null },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    lang: { type: String, enum: ["en", "mr", "hi", "both", "all"], default: "all" },
    viewCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ featured: 1 });

export const Article = mongoose.model<IArticle>("Article", ArticleSchema);
