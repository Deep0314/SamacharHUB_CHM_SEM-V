import mongoose, { Schema, Document } from "mongoose";

export interface IArticleHotspot {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  articleId?: string;
  articleTitle?: string;
  articleTitleMr?: string;
  articleSlug?: string;
  articleSummary?: string;
  articleSummaryMr?: string;
}

export interface IEdition extends Document {
  cities: string[];
  citiesMr: string[];
  date: Date;
  coverUrl: string;
  pages: string[];
  published: boolean;
  viewCount: number;
  articleHotspots: IArticleHotspot[];
  hotspotPopupHeader?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleHotspotSchema = new Schema<IArticleHotspot>(
  {
    pageIndex: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    articleId: { type: String },
    articleTitle: { type: String },
    articleTitleMr: { type: String },
    articleSlug: { type: String },
    articleSummary: { type: String },
    articleSummaryMr: { type: String },
  },
  { _id: false }
);

const EditionSchema = new Schema<IEdition>(
  {
    cities: { type: [String], required: true },
    citiesMr: { type: [String], required: true },
    date: { type: Date, required: true },
    coverUrl: { type: String, required: true },
    pages: [{ type: String }],
    published: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    articleHotspots: { type: [ArticleHotspotSchema], default: [] },
    hotspotPopupHeader: { type: String },
  },
  { timestamps: true }
);

export const Edition = mongoose.model<IEdition>("Edition", EditionSchema);
