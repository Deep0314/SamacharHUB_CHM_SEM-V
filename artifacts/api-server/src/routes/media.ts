import { Router } from "express";
import { Media } from "../models/Media.js";
import { requireAuth } from "../middleware/auth.js";
import path from "path";
import fs from "fs";
import { uploadToBase64 } from "../lib/cloudinary.js";

const router = Router();

// We use Cloudinary for all media storage, so local filesystem uploads are disabled
// to ensure compatibility with serverless environments like Vercel.

function serializeMedia(item: any) {
  return {
    _id: item._id.toString(),
    filename: item.filename,
    url: item.url,
    mimeType: item.mimeType,
    altText: item.altText ?? null,
    size: item.size,
    createdAt: item.createdAt.toISOString(),
  };
}

router.post("/media/upload", requireAuth, async (req: any, res: any): Promise<void> => {
  const { filename, mimeType, base64Data, altText } = req.body;
  if (!filename || !mimeType || !base64Data) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const buffer = Buffer.from(base64Data, "base64");
    // Cloudinary requires a data URL prefix if passing base64 directly
    const dataUrl = base64Data.startsWith("data:") ? base64Data : `data:${mimeType};base64,${base64Data}`;
    const url = await uploadToBase64(dataUrl, "newspaper");
    
    const media = await Media.create({
      filename: filename, // Keep original filename in DB for reference
      url,
      mimeType,
      altText: altText || null,
      size: buffer.length,
    });

    res.status(201).json(serializeMedia(media));
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error?.message || error);
    res.status(500).json({ error: "upload to cloud failed", details: error?.message });
  }
});

router.get("/media", requireAuth, async (req: any, res: any): Promise<void> => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const skip = (Number(page) - 1) * Number(limit);
  const items = await Media.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  res.json(items.map(serializeMedia));
});

router.get("/media/files/:filename", (req, res): void => {
  res.status(410).json({ error: "Local file serving is disabled. Please use the Cloudinary URL." });
});

router.delete("/media/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  const media = await Media.findById(req.params.id);
  if (!media) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  
  // Local file deletion is disabled as we use Cloudinary
  // In a production environment, you would also call cloudinary.v2.uploader.destroy(public_id) here.
  await media.deleteOne();
  res.json({ success: true });
});

export default router;
