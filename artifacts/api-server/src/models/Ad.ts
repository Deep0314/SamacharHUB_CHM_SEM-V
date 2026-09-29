import mongoose, { Schema, Document } from "mongoose";

export type AdPosition =
  | "popup"
  | "banner-top"
  | "banner-bottom"
  | "sidebar-right"
  | "inline-edition"
  | "inline-article";

export interface IAd extends Document {
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: AdPosition;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: "" },
    position: {
      type: String,
      enum: ["popup", "banner-top", "banner-bottom", "sidebar-right", "inline-edition", "inline-article"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Ad = mongoose.model<IAd>("Ad", AdSchema);
