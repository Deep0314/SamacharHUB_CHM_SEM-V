import mongoose, { Schema, Document } from "mongoose";

export interface IBreakingNews extends Document {
  text: string;
  textMr: string | null;
  textHi: string | null;
  link: string | null;
  active: boolean;
  lang: "en" | "mr" | "hi" | "both" | "all";
  createdAt: Date;
}

const BreakingNewsSchema = new Schema<IBreakingNews>(
  {
    text: { type: String, required: true },
    textMr: { type: String, default: null },
    textHi: { type: String, default: null },
    link: { type: String, default: null },
    active: { type: Boolean, default: true },
    lang: { type: String, enum: ["en", "mr", "hi", "both", "all"], default: "all" },
  },
  { timestamps: true }
);

export const BreakingNews = mongoose.model<IBreakingNews>(
  "BreakingNews",
  BreakingNewsSchema
);
