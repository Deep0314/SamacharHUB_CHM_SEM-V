import { Router } from "express";
import { Article } from "../models/Article.js";
import { Category } from "../models/Category.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function serializeArticle(article: any) {
  const cat = article.category;
  return {
    _id: article._id.toString(),
    title: article.title,
    titleMr: article.titleMr ?? null,
    titleHi: article.titleHi ?? null,
    slug: article.slug,
    summary: article.summary,
    summaryMr: article.summaryMr ?? null,
    summaryHi: article.summaryHi ?? null,
    content: article.content,
    contentMr: article.contentMr ?? null,
    contentHi: article.contentHi ?? null,
    category: cat
      ? {
          _id: cat._id.toString(),
          name: cat.name,
          nameMr: cat.nameMr ?? null,
          nameHi: cat.nameHi ?? null,
          slug: cat.slug,
          color: cat.color,
          order: cat.order,
        }
      : null,
    author: article.author,
    imageUrl: article.imageUrl ?? null,
    tags: article.tags || [],
    status: article.status,
    featured: article.featured,
    lang: article.lang,
    viewCount: article.viewCount,
    publishedAt: article.publishedAt
      ? article.publishedAt.toISOString()
      : null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

router.get("/articles/featured", async (req: any, res: any): Promise<void> => {
  const { lang, limit = "5" } = req.query as Record<string, string>;
  const query: Record<string, unknown> = { status: "published", featured: true };
  if (lang) query.lang = { $in: [lang, "both", "all"] };
  const articles = await Article.find(query)
    .populate("category")
    .sort({ publishedAt: -1 })
    .limit(Number(limit));
  res.json(articles.map(serializeArticle));
});

router.get("/articles/latest", async (req: any, res: any): Promise<void> => {
  const { lang, limit = "12" } = req.query as Record<string, string>;
  const query: Record<string, unknown> = { status: "published" };
  if (lang) query.lang = { $in: [lang, "both", "all"] };
  const articles = await Article.find(query)
    .populate("category")
    .sort({ publishedAt: -1 })
    .limit(Number(limit));
  res.json(articles.map(serializeArticle));
});

router.get("/articles", async (req: any, res: any): Promise<void> => {
  const {
    category,
    lang,
    page = "1",
    limit = "10",
    featured,
    search,
    status,
  } = req.query as Record<string, string>;

  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  else query.status = "published";
  if (lang) query.lang = { $in: [lang, "both", "all"] };
  if (featured !== undefined) query.featured = featured === "true";
  if (search) query.$text = { $search: search };

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) query.category = cat._id;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate("category")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Article.countDocuments(query),
  ]);

  res.json({
    articles: articles.map(serializeArticle),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.post("/articles", requireAuth, async (req: any, res: any): Promise<void> => {
  const {
    title,
    titleMr,
    titleHi,
    summary,
    summaryMr,
    summaryHi,
    content,
    contentMr,
    contentHi,
    categoryId,
    author,
    imageUrl,
    tags,
    featured,
    lang,
    status,
  } = req.body;

  if (!title || !summary || !content || !categoryId || !author || !lang) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const slug = slugify(title) + "-" + Date.now();

  const article = await Article.create({
    title,
    titleMr: titleMr || null,
    titleHi: titleHi || null,
    slug,
    summary,
    summaryMr: summaryMr || null,
    summaryHi: summaryHi || null,
    content,
    contentMr: contentMr || null,
    contentHi: contentHi || null,
    category: categoryId,
    author,
    imageUrl: imageUrl || null,
    tags: tags || [],
    featured: featured ?? false,
    lang,
    status: status || "draft",
    publishedAt: status === "published" ? new Date() : null,
  });

  const populated = await Article.findById(article._id).populate("category");
  res.status(201).json(serializeArticle(populated));
});

router.get("/articles/:id", async (req: any, res: any): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const article = await Article.findById(rawId).populate("category");
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  article.viewCount += 1;
  await article.save();
  res.json(serializeArticle(article));
});

router.get("/articles/:id/slug", async (req: any, res: any): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const article = await Article.findOne({ slug: rawId }).populate("category");
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  article.viewCount += 1;
  await article.save();
  res.json(serializeArticle(article));
});

router.patch("/articles/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const update = { ...req.body };
  if (update.categoryId) {
    update.category = update.categoryId;
    delete update.categoryId;
  }
  if (update.status === "published") {
    update.publishedAt = new Date();
  }
  const article = await Article.findByIdAndUpdate(rawId, update, {
    new: true,
  }).populate("category");
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(serializeArticle(article));
});

router.patch(
  "/articles/:id/publish",
  requireAuth,
  async (req: any, res: any): Promise<void> => {
    const rawId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }
    const article = await Article.findByIdAndUpdate(
      rawId,
      {
        status,
        publishedAt: status === "published" ? new Date() : null,
      },
      { new: true }
    ).populate("category");
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json(serializeArticle(article));
  }
);

router.delete(
  "/articles/:id",
  requireAuth,
  async (req: any, res: any): Promise<void> => {
    const rawId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const article = await Article.findByIdAndDelete(rawId);
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.sendStatus(204);
  }
);

export default router;
