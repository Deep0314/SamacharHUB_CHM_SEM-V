import { Router } from "express";
import { Article } from "../models/Article.js";
import { Category } from "../models/Category.js";
import { Edition } from "../models/Edition.js";
import { AdminUser } from "../models/AdminUser.js";
import { requireAuth, signToken, signRefreshToken, verifyRefreshToken } from "../middleware/auth.js";
import { validate, LoginSchema } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rate-limit.js";
import bcryptjs from "bcryptjs";


const router = Router();

router.post("/admin/login", authLimiter, validate(LoginSchema), async (req: any, res: any): Promise<void> => {
  const { email, password } = req.body;

  try {
    const admin = await AdminUser.findOne({ email });
    if (!admin) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcryptjs.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const adminId = admin._id.toString();
    const token = signToken(adminId);
    const refreshToken = signRefreshToken(adminId);

    res.json({
      token,
      refreshToken,
      admin: {
        id: adminId,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

/** Refresh an expired access token using a valid refresh token */
router.post("/admin/refresh-token", async (req: any, res: any): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: "refreshToken is required" });
    return;
  }

  const adminId = verifyRefreshToken(refreshToken);
  if (!adminId) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }

  const admin = await AdminUser.findById(adminId);
  if (!admin) {
    res.status(401).json({ error: "Admin account not found" });
    return;
  }

  const newToken = signToken(adminId);
  const newRefreshToken = signRefreshToken(adminId);
  res.json({ token: newToken, refreshToken: newRefreshToken });
});


router.get("/admin/me", requireAuth, async (req: any, res: any): Promise<void> => {
  try {
    const admin = await AdminUser.findById(req.adminId);
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.json({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get(
  "/admin/stats",
  requireAuth,
  async (_req: any, res: any): Promise<void> => {
    const [totalArticles, publishedArticles, draftArticles, totalCategories, viewAgg, editionViewAgg, recentArticles, topArticles] =
      await Promise.all([
        Article.countDocuments(),
        Article.countDocuments({ status: "published" }),
        Article.countDocuments({ status: "draft" }),
        Category.countDocuments(),
        Article.aggregate([
          { $group: { _id: null, total: { $sum: "$viewCount" } } },
        ]),
        Edition.aggregate([
          { $group: { _id: null, total: { $sum: "$viewCount" } } },
        ]),
        Article.find()
          .populate("category")
          .sort({ createdAt: -1 })
          .limit(5),
        Article.find({ status: "published" })
          .populate("category")
          .sort({ viewCount: -1 })
          .limit(5),
      ]);

    const totalArticleViews = viewAgg[0]?.total ?? 0;
    const totalEditionViews = editionViewAgg[0]?.total ?? 0;

    res.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      totalCategories,
      totalArticleViews,
      totalEditionViews,
      totalViews: totalArticleViews + totalEditionViews,
      recentArticles: recentArticles.map((a) => ({
        _id: a._id.toString(),
        title: a.title,
        titleMr: a.titleMr ?? null,
        slug: a.slug,
        summary: a.summary,
        summaryMr: a.summaryMr ?? null,
        content: a.content,
        contentMr: a.contentMr ?? null,
        category: a.category
          ? {
              _id: (a.category as any)._id?.toString(),
              name: (a.category as any).name,
              nameMr: (a.category as any).nameMr ?? null,
              slug: (a.category as any).slug,
              color: (a.category as any).color,
              order: (a.category as any).order,
            }
          : null,
        author: a.author,
        imageUrl: a.imageUrl ?? null,
        tags: a.tags || [],
        status: a.status,
        featured: a.featured,
        lang: a.lang,
        viewCount: a.viewCount,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      topArticles: topArticles.map((a) => ({
        _id: a._id.toString(),
        title: a.title,
        viewCount: a.viewCount,
        category: (a.category as any)?.name || "Uncategorized",
      })),
    });
  }
);

router.get(
  "/admin/stats/category-breakdown",
  requireAuth,
  async (_req: any, res: any): Promise<void> => {
    const breakdown = await Article.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "cat",
        },
      },
      { $unwind: "$cat" },
      {
        $project: {
          category: "$cat.name",
          count: 1,
          color: "$cat.color",
        },
      },
    ]);
    res.json(
      breakdown.map((b) => ({
        category: b.category,
        count: b.count,
        color: b.color,
      }))
    );
  }
);

export default router;
