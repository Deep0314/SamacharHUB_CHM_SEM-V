import { Router } from "express";
import { Ad } from "../models/Ad.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/ads", async (req: any, res: any): Promise<void> => {
  const now = new Date();
  const query: Record<string, unknown> = { isActive: true };
  if (req.query.position) {
    query.position = req.query.position;
  }
  const ads = await Ad.find({
    ...query,
    $and: [
      { $or: [{ startDate: { $lte: now } }, { startDate: { $exists: false } }] },
      { $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }] },
    ],
  }).sort({ order: 1, createdAt: -1 });
  res.json(ads.map((a) => a.toObject()));
});

router.get("/admin/ads", requireAuth, async (_req: any, res: any): Promise<void> => {
  const ads = await Ad.find().sort({ order: 1, createdAt: -1 });
  res.json(ads.map((a) => a.toObject()));
});

router.post("/admin/ads", requireAuth, async (req: any, res: any): Promise<void> => {
  const { title, imageUrl, linkUrl, position, isActive, startDate, endDate, order } = req.body;
  if (!title || !imageUrl || !position) {
    res.status(400).json({ error: "title, imageUrl, position required" });
    return;
  }
  const ad = await Ad.create({
    title, imageUrl,
    linkUrl: linkUrl ?? "",
    position,
    isActive: isActive ?? true,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    order: order ?? 0,
  });
  res.status(201).json(ad.toObject());
});

router.patch("/admin/ads/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ad) { res.status(404).json({ error: "Ad not found" }); return; }
  res.json(ad.toObject());
});

router.delete("/admin/ads/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  await Ad.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
