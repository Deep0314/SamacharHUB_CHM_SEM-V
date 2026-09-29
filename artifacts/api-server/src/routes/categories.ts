import { Router } from "express";
import { Category } from "../models/Category.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function serializeCategory(cat: any) {
  return {
    _id: cat._id.toString(),
    name: cat.name,
    nameMr: cat.nameMr ?? null,
    slug: cat.slug,
    color: cat.color,
    order: cat.order,
  };
}

router.get("/categories", async (_req: any, res: any): Promise<void> => {
  const cats = await Category.find().sort({ order: 1 });
  res.json(cats.map(serializeCategory));
});

router.post("/categories", requireAuth, async (req: any, res: any): Promise<void> => {
  const { name, nameMr, slug, color, order } = req.body;
  if (!name || !slug || !color) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const cat = await Category.create({
    name,
    nameMr: nameMr || null,
    slug,
    color,
    order: order ?? 0,
  });
  res.status(201).json(serializeCategory(cat));
});

router.patch(
  "/categories/:id",
  requireAuth,
  async (req: any, res: any): Promise<void> => {
    const rawId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const cat = await Category.findByIdAndUpdate(rawId, req.body, {
      new: true,
    });
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(serializeCategory(cat));
  }
);

router.delete(
  "/categories/:id",
  requireAuth,
  async (req: any, res: any): Promise<void> => {
    const rawId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const cat = await Category.findByIdAndDelete(rawId);
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.sendStatus(204);
  }
);

export default router;
