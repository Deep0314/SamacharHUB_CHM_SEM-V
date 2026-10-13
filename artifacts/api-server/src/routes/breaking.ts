import { Router } from "express";
import { BreakingNews } from "../models/BreakingNews.js";
import { requireAuth } from "../middleware/auth.js";
import { Subscriber } from "../models/Subscriber.js";
import { sendEmail, newsletterHtml } from "../lib/email.js";

async function notifyBreakingNews(text: string) {
  try {
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) return;
    const siteName = "SamacharHUB";
    const baseUrl = "https://www.samacharhub.com";
    const subject = `Breaking News — ${siteName}`;
    const body = `<p style="font-size:18px;font-weight:700;color:#CC0000;">🔴 Breaking News</p><p style="font-size:16px;line-height:1.6;">${text}</p>`;
    for (const sub of subscribers) {
      const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${sub.unsubscribeToken}`;
      await sendEmail({ to: sub.email, subject, html: newsletterHtml({ subject, body, siteName, siteUrl: baseUrl, unsubscribeUrl }), text: `Breaking News: ${text}` });
    }
  } catch { /* non-fatal */ }
}

const router = Router();

function serializeBreaking(item: any) {
  return {
    _id: item._id.toString(),
    text: item.text,
    textMr: item.textMr ?? null,
    textHi: item.textHi ?? null,
    link: item.link ?? null,
    active: item.active,
    lang: item.lang,
    createdAt: item.createdAt.toISOString(),
  };
}

router.get("/breaking-news", async (req: any, res: any): Promise<void> => {
  const { lang } = req.query as Record<string, string>;
  const query: Record<string, unknown> = { active: true };
  if (lang) query.lang = { $in: [lang, "both", "all"] };
  const items = await BreakingNews.find(query).sort({ createdAt: -1 }).limit(10);
  res.json(items.map(serializeBreaking));
});

router.post("/breaking-news", requireAuth, async (req: any, res: any): Promise<void> => {
  const { text, textMr, textHi, link, lang } = req.body;
  if (!text || !lang) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const item = await BreakingNews.create({
    text,
    textMr: textMr || null,
    textHi: textHi || null,
    link: link || null,
    lang,
  });
  notifyBreakingNews(text);
  res.status(201).json(serializeBreaking(item));
});

router.delete(
  "/breaking-news/:id",
  requireAuth,
  async (req: any, res: any): Promise<void> => {
    const rawId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const item = await BreakingNews.findByIdAndDelete(rawId);
    if (!item) {
      res.status(404).json({ error: "Breaking news not found" });
      return;
    }
    res.sendStatus(204);
  }
);

export default router;
