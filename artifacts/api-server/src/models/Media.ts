import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  filename: string;
  url: string;
  mimeType: string;
  altText: string | null;
  size: number;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    altText: { type: String, default: null },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Media = mongoose.model<IMedia>("Media", MediaSchema);
