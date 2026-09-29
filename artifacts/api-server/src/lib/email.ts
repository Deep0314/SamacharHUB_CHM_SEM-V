import nodemailer from "nodemailer";
import { SiteSettings } from "../models/SiteSettings.js";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const settings = await SiteSettings.findOne();
  if (!settings) return null;
  const s = (settings as any).smtpConfig;
  if (!s?.host || !s?.user || !s?.pass) return null;
  return s as SmtpConfig;
}

function createTransport(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port || 587,
    secure: cfg.secure ?? false,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = await getSmtpConfig();
    if (!cfg) return { ok: false, error: "SMTP not configured" };
    const transport = createTransport(cfg);
    const from = `"${cfg.fromName || "SamacharHUB"}" <${cfg.fromEmail || cfg.user}>`;
    await transport.sendMail({ from, ...opts });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error" };
  }
}

export async function testSmtp(cfg: SmtpConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const transport = createTransport(cfg);
    await transport.verify();
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error" };
  }
}

export function newsletterHtml(opts: {
  subject: string;
  body: string;
  siteName: string;
  siteUrl: string;
  unsubscribeUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${opts.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
      <tr>
        <td style="background:#CC0000;padding:24px 32px;text-align:center;">
          <span style="font-family:Georgia,serif;font-size:24px;font-weight:900;color:#fff;letter-spacing:1px;">${opts.siteName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#1a1a1a;">${opts.subject}</h2>
          <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#333;">${opts.body}</div>
          <div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee;text-align:center;">
            <a href="${opts.siteUrl}" style="display:inline-block;background:#CC0000;color:#fff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;padding:12px 28px;border-radius:3px;text-decoration:none;letter-spacing:.5px;">Visit ${opts.siteName}</a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="background:#1a1a1a;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#999;">
            &copy; ${new Date().getFullYear()} ${opts.siteName} &nbsp;&bull;&nbsp;
            <a href="${opts.unsubscribeUrl}" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function contactEmailHtml(opts: {
  name: string;
  email: string;
  phone: string;
  message: string;
  siteName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Contact Form Submission</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
      <tr>
        <td style="background:#CC0000;padding:20px 32px;">
          <span style="font-family:Georgia,serif;font-size:20px;font-weight:900;color:#fff;">${opts.siteName}</span>
          <span style="font-family:Arial,sans-serif;font-size:13px;color:#ffcccc;margin-left:12px;">New Contact Form Submission</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
              <span style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Name</span><br/>
              <span style="font-size:15px;color:#1a1a1a;font-weight:600;">${opts.name}</span>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
              <span style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Email</span><br/>
              <a href="mailto:${opts.email}" style="font-size:15px;color:#CC0000;">${opts.email}</a>
            </td></tr>
            ${opts.phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
              <span style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Phone</span><br/>
              <span style="font-size:15px;color:#1a1a1a;">${opts.phone}</span>
            </td></tr>` : ""}
            <tr><td style="padding:8px 0;">
              <span style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Message</span><br/>
              <div style="font-size:15px;color:#333;line-height:1.6;margin-top:6px;white-space:pre-wrap;">${opts.message}</div>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#1a1a1a;padding:14px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#999;">&copy; ${new Date().getFullYear()} ${opts.siteName}</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
