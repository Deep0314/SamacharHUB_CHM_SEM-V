import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Subscriber } from "../models/Subscriber.js";
import { SiteSettings } from "../models/SiteSettings.js";
import { sendEmail, testSmtp, newsletterHtml, contactEmailHtml, type SmtpConfig } from "../lib/email.js";

const router = Router();

router.post("/contact", async (req: any, res: any): Promise<void> => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: "name, email, and message are required" });
    return;
  }

  const settings = await SiteSettings.findOne();
  const adminEmail = settings?.contactEmail || (settings as any)?.smtpConfig?.user;
  const siteName = "SamacharHUB";

  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `Contact Form: ${name}`,
      html: contactEmailHtml({ name, email, phone: phone || "", message, siteName }),
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || ""}\nMessage: ${message}`,
    });
  }

  res.json({ ok: true });
});

router.post("/subscribe", async (req: any, res: any): Promise<void> => {
  const { email, name } = req.body;
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }
  try {
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.json({ ok: true, message: "Already subscribed" });
      return;
    }
    const subscriber = await Subscriber.create({ email, name: name || "" });

    // Notify admin — fire and forget, do NOT await (avoids blocking the response)
    SiteSettings.findOne().then((settings) => {
      const adminEmail = settings?.contactEmail || (settings as any)?.smtpConfig?.user;
      if (!adminEmail) return;
      const displayName = name ? ` (${name})` : "";
      sendEmail({
        to: adminEmail,
        subject: `New Subscriber: ${email}`,
        html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:500px;"><h2 style="color:#CC0000;">New Newsletter Subscriber</h2><p><strong>${email}</strong>${displayName} has subscribed to email notifications.</p><p style="font-size:12px;color:#888;">SamacharHUB — Admin Notification</p></div>`,
        text: `New subscriber: ${email}${displayName}`,
      });
    }).catch(() => {});

    res.json({ ok: true, message: "Subscribed successfully", unsubscribeToken: subscriber.unsubscribeToken });
  } catch {
    res.status(500).json({ error: "Subscription failed" });
  }
});

router.get("/unsubscribe", async (req: any, res: any): Promise<void> => {
  const { token } = req.query as Record<string, string>;
  if (!token) {
    res.status(400).send("Invalid unsubscribe link.");
    return;
  }
  const sub = await Subscriber.findOne({ unsubscribeToken: token });
  if (!sub) {
    res.send("<html><body style='font-family:sans-serif;text-align:center;padding:60px;'><h2>Already unsubscribed or invalid link.</h2></body></html>");
    return;
  }
  await sub.deleteOne();
  res.send("<html><body style='font-family:sans-serif;text-align:center;padding:60px;'><h2 style='color:#CC0000'>You have been unsubscribed.</h2><p>You will no longer receive emails from SamacharHUB.</p></body></html>");
});

router.get("/admin/subscribers", requireAuth, async (_req: any, res: any): Promise<void> => {
  const subs = await Subscriber.find().sort({ subscribedAt: -1 });
  res.json(subs);
});

router.delete("/admin/subscribers/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  await Subscriber.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

router.post("/admin/notifications/test", requireAuth, async (req: any, res: any): Promise<void> => {
  const cfg = req.body as SmtpConfig;
  if (!cfg.host || !cfg.user || !cfg.pass) {
    res.status(400).json({ ok: false, error: "host, user, and pass are required" });
    return;
  }
  const result = await testSmtp(cfg);
  res.json(result);
});

router.post("/admin/notifications/send", requireAuth, async (req: any, res: any): Promise<void> => {
  const { subject, body, siteUrl } = req.body;
  if (!subject || !body) {
    res.status(400).json({ error: "subject and body are required" });
    return;
  }

  const subscribers = await Subscriber.find();
  if (subscribers.length === 0) {
    res.json({ ok: true, sent: 0, failed: 0, message: "No subscribers" });
    return;
  }

  const settings = await SiteSettings.findOne();
  const siteName = "SamacharHUB";
  const baseUrl = siteUrl || "https://www.samacharhub.com";

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${sub.unsubscribeToken}`;
    const result = await sendEmail({
      to: sub.email,
      subject,
      html: newsletterHtml({ subject, body, siteName, siteUrl: baseUrl, unsubscribeUrl }),
      text: body,
    });
    if (result.ok) sent++;
    else failed++;
  }

  res.json({ ok: true, sent, failed });
});

router.post("/admin/notifications/send-to-admin", requireAuth, async (req: any, res: any): Promise<void> => {
  const { subject, body } = req.body;
  const settings = await SiteSettings.findOne();
  const adminEmail = settings?.contactEmail || (settings as any)?.smtpConfig?.user;
  if (!adminEmail) {
    res.status(400).json({ error: "No admin email configured" });
    return;
  }
  const result = await sendEmail({ to: adminEmail, subject, html: `<p>${body}</p>`, text: body });
  res.json(result);
});

export { router as notificationsRouter };
export default router;
