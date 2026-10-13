import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  nameMr: string | null;
  nameHi: string | null;
  slug: string;
  color: string;
  order: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    nameMr: { type: String, default: null },
    nameHi: { type: String, default: null },
    slug: { type: String, required: true, unique: true },
    color: { type: String, required: true, default: "#e53e3e" },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: false }
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
