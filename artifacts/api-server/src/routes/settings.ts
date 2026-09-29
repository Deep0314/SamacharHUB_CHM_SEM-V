import { Router } from "express";
import { SiteSettings } from "../models/SiteSettings.js";
import { requireAuth } from "../middleware/auth.js";
import { Edition } from "../models/Edition.js";
import { Article } from "../models/Article.js";
import { sendEmail } from "../lib/email.js";

async function notifyMaintenanceChange(enabled: boolean, adminEmail: string) {
  if (!adminEmail) return;
  const siteName = "SamacharHUB";
  const subject = enabled
    ? `⚠️ ${siteName} — Maintenance Mode ENABLED`
    : `✅ ${siteName} — Site is Back Online`;
  const body = enabled
    ? `<p>The website has been put into <strong>Maintenance Mode</strong>. Public visitors will see the maintenance message until it is turned off.</p><p>To disable it, go to <strong>Admin → General Settings → Maintenance Mode</strong>.</p>`
    : `<p>Maintenance mode has been <strong>disabled</strong>. Your website is now live and accessible to all visitors.</p>`;
  await sendEmail({ to: adminEmail, subject, html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:500px;">${body}<hr/><p style="font-size:12px;color:#888;">${siteName} — Admin Notification</p></div>`, text: body.reSHace(/<[^>]+>/g, "") });
}

const router = Router();

async function getOrCreateSettings() {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
}

router.get("/settings", async (_req: any, res: any): Promise<void> => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings.toObject());
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    // Return default settings if DB is down
    res.json({
      siteDescription: "SamacharHUB E-Newspaper",
      maintenanceMode: false,
      defaultLanguage: "mr"
    });
  }
});

router.patch("/settings", requireAuth, async (req: any, res: any): Promise<void> => {
  const settings = await getOrCreateSettings();
  const allowed = [
    "siteDescription", "siteDescriptionMr",
    "quickLinks", "socialLinks",
    "contactEmail", "contactPhone",
    "contactAddress", "contactAddressMr",
    "maintenanceMode", "maintenanceMessage", "maintenanceMessageMr",
    "defaultLanguage",
    "smtpConfig",
    "poweredByText", "poweredByUrl",
    "hotspotUIConfig",
  ];
  const prevMaintenance = settings.maintenanceMode;
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      (settings as any)[key] = req.body[key];
    }
  }
  await settings.save();
  if (req.body.maintenanceMode !== undefined && req.body.maintenanceMode !== prevMaintenance) {
    const adminEmail = settings.contactEmail || (settings as any).smtpConfig?.user;
    if (adminEmail) notifyMaintenanceChange(req.body.maintenanceMode, adminEmail);
  }
  res.json(settings.toObject());
});

router.post("/admin/cleanup", requireAuth, async (req: any, res: any): Promise<void> => {
  const { collection, beforeDate } = req.body;
  if (!collection || !beforeDate) {
    res.status(400).json({ error: "collection and beforeDate are required" });
    return;
  }
  const date = new Date(beforeDate);
  if (isNaN(date.getTime())) {
    res.status(400).json({ error: "Invalid date" });
    return;
  }
  let deletedCount = 0;
  if (collection === "editions") {
    const result = await Edition.deleteMany({ date: { $lt: date } });
    deletedCount = result.deletedCount;
  } else if (collection === "articles") {
    const result = await Article.deleteMany({ createdAt: { $lt: date } });
    deletedCount = result.deletedCount;
  } else {
    res.status(400).json({ error: "Invalid collection. Use 'editions' or 'articles'" });
    return;
  }
  res.json({ deleted: deletedCount, collection, beforeDate: date.toISOString() });
});

export default router;
