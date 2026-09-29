import { Router } from "express";
import { Edition } from "../models/Edition.js";
import { requireAuth } from "../middleware/auth.js";
import { Subscriber } from "../models/Subscriber.js";
import { SiteSettings } from "../models/SiteSettings.js";
import { sendEmail, newsletterHtml } from "../lib/email.js";

async function notifyNewEdition(cities: string[], date: string) {
  try {
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) return;
    const settings = await SiteSettings.findOne();
    const siteName = "SamacharHUB";
    const baseUrl = "https://www.samacharhub.com";
    const subject = `New Edition: ${cities.join(", ")} — ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`;
    const body = `<p>A new edition of <strong>${siteName}</strong> is now available.</p><p><strong>Cities:</strong> ${cities.join(", ")}<br/><strong>Date:</strong> ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p><p>Click the button below to read today's paper.</p>`;
    for (const sub of subscribers) {
      const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${sub.unsubscribeToken}`;
      await sendEmail({ to: sub.email, subject, html: newsletterHtml({ subject, body, siteName, siteUrl: baseUrl, unsubscribeUrl }), text: `${subject}\n\nA new edition is available at ${baseUrl}` });
    }
  } catch { /* non-fatal */ }
}

const router = Router();

function serializeHotspot(h: any) {
  return {
    pageIndex: h.pageIndex,
    x: h.x,
    y: h.y,
    width: h.width,
    height: h.height,
    articleId: h.articleId,
    articleTitle: h.articleTitle,
    articleTitleMr: h.articleTitleMr ?? null,
    articleSlug: h.articleSlug,
    articleSummary: h.articleSummary,
    articleSummaryMr: h.articleSummaryMr ?? null,
  };
}

function normalizeHotspots(articleHotspots: any[] | undefined) {
  return (articleHotspots ?? []).map((h) => ({
    pageIndex: h.pageIndex,
    x: h.x,
    y: h.y,
    width: h.width,
    height: h.height,
    articleId: h.articleId || undefined,
    articleTitle: h.articleTitle || undefined,
    articleTitleMr: h.articleTitleMr || undefined,
    articleSlug: h.articleSlug || undefined,
    articleSummary: h.articleSummary || undefined,
    articleSummaryMr: h.articleSummaryMr || undefined,
  }));
}

function serializeEdition(e: any) {
  return {
    _id: e._id.toString(),
    cities: e.cities ?? [],
    citiesMr: e.citiesMr ?? [],
    date: e.date instanceof Date ? e.date.toISOString() : e.date,
    coverUrl: e.coverUrl,
    pages: e.pages ?? [],
    published: e.published,
    viewCount: e.viewCount ?? 0,
    articleHotspots: (e.articleHotspots ?? []).map(serializeHotspot),
    hotspotPopupHeader: e.hotspotPopupHeader ?? null,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
    updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : e.updatedAt,
  };
}

router.get("/editions", async (req: any, res: any): Promise<void> => {
  const { city, limit = "50", all } = req.query as Record<string, string>;
  const filter: Record<string, any> = all === "1" ? {} : { published: true };
  if (city) filter.cities = city;
  const editions = await Edition.find(filter)
    .sort({ date: -1 })
    .limit(Number(limit));
  res.json(editions.map(serializeEdition));
});

router.get("/editions/:id", async (req: any, res: any): Promise<void> => {
  const edition = await Edition.findById(req.params.id);
  if (!edition) {
    res.status(404).json({ error: "Edition not found" });
    return;
  }
  // Increment view count
  edition.viewCount = (edition.viewCount ?? 0) + 1;
  await edition.save();

  res.json(serializeEdition(edition));
});

router.post("/editions", requireAuth, async (req: any, res: any): Promise<void> => {
  let { cities, citiesMr, date, coverUrl, pages, published, articleHotspots, hotspotPopupHeader } = req.body;

  // Backward compatibility: handle old singular fields
  if (!cities && (req.body as any).city) {
    cities = [(req.body as any).city];
  }
  if (!citiesMr && (req.body as any).cityMr) {
    citiesMr = [(req.body as any).cityMr];
  }

  console.log("POST /editions processed body:", JSON.stringify({ cities, citiesMr, date, coverUrl }, null, 2));

  if (!cities || !cities.length || !citiesMr || !citiesMr.length || !date || !coverUrl) {
    const missing = [];
    if (!cities || !cities.length) missing.push("cities (or city)");
    if (!citiesMr || !citiesMr.length) missing.push("citiesMr (or cityMr)");
    if (!date) missing.push("date");
    if (!coverUrl) missing.push("coverUrl");
    
    res.status(400).json({ 
      error: "Validation failed", 
      missing,
      received: Object.keys(req.body)
    });
    return;
  }
  try {
    const edition = await Edition.create({
      cities,
      citiesMr,
      date: new Date(date + "T00:00:00Z"),
      coverUrl,
      pages: pages ?? [],
      published: published !== false,
      articleHotspots: normalizeHotspots(articleHotspots),
      hotspotPopupHeader: hotspotPopupHeader || undefined,
    });
    if (edition.published) notifyNewEdition(cities, date);
    res.status(201).json(serializeEdition(edition));
  } catch (error: any) {
    console.error("Error creating edition:", error);
    res.status(500).json({ error: "Failed to create edition in database", details: error?.message });
  }
});

router.patch("/editions/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  let { cities, citiesMr, date, coverUrl, pages, published, articleHotspots, hotspotPopupHeader } = req.body;
  
  // Backward compatibility
  if (!cities && (req.body as any).city) cities = [(req.body as any).city];
  if (!citiesMr && (req.body as any).cityMr) citiesMr = [(req.body as any).cityMr];

  const update: Record<string, any> = {};
  if (cities !== undefined) update.cities = cities;
  if (citiesMr !== undefined) update.citiesMr = citiesMr;
  if (date !== undefined) update.date = new Date(date + "T00:00:00Z");
  if (coverUrl !== undefined) update.coverUrl = coverUrl;
  if (pages !== undefined) update.pages = pages;
  if (published !== undefined) update.published = published;
  if (articleHotspots !== undefined) update.articleHotspots = normalizeHotspots(articleHotspots);
  if (hotspotPopupHeader !== undefined) update.hotspotPopupHeader = hotspotPopupHeader || undefined;

  const edition = await Edition.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!edition) {
    res.status(404).json({ error: "Edition not found" });
    return;
  }
  res.json(serializeEdition(edition));
});

router.delete("/editions/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  await Edition.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

export default router;
