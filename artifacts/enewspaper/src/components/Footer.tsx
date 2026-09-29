import { Link } from "wouter";
import { useLang } from "@/lib/lang";
import { useState, useEffect } from "react";
import {
  Facebook,
  Instagram,
  Send,
  Youtube,
  Linkedin,
  Globe,
  MessageCircle,
} from "lucide-react";

const API = "/api";

interface QuickLink {
  label: string;
  labelMr: string;
  url: string;
  order: number;
}
interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}
interface Settings {
  siteDescription: string;
  siteDescriptionMr: string;
  quickLinks: QuickLink[];
  socialLinks: SocialLink[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactAddressMr: string;
  poweredByText: string;
  poweredByUrl: string;
  hotspotUIConfig?: { logoUrl?: string; logoText?: string; showLogo?: boolean; footerSiteUrl?: string };
}

const DEFAULT: Settings = {
  siteDescription:
    "Vidarbha's trusted regional e-newspaper. Covering politics, sports, business, and more from the heart of Maharashtra.",
  siteDescriptionMr:
    "विदर्भाचे विश्वासू प्रादेशिक वृत्तपत्र. महाराष्ट्राच्या हृदयातून राजकारण, क्रीडा, व्यापार आणि अधिक.",
  quickLinks: [
    { label: "About Us", labelMr: "आमच्या विषयी", url: "/about", order: 0 },
    { label: "Contact Us", labelMr: "संपर्क", url: "/contact", order: 1 },
    {
      label: "Politics",
      labelMr: "राजकारण",
      url: "/category/politics",
      order: 2,
    },
    { label: "Sports", labelMr: "क्रीडा", url: "/category/sports", order: 3 },
  ],
  socialLinks: [],
  contactEmail: "",
  contactPhone: "",
  contactAddress: "Maharashtra, India",
  contactAddressMr: "महाराष्ट्र, भारत",
  poweredByText: "Deep Kamble",
  poweredByUrl: "https://deepkamble.online",
  hotspotUIConfig: { footerSiteUrl: "www.samacharhub.com" },
};

function SocialIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className ?? "h-4 w-4";
  switch (icon.toLowerCase()) {
    case "facebook":
      return <Facebook className={cls} />;
    case "instagram":
      return <Instagram className={cls} />;
    case "telegram":
      return <Send className={cls} />;
    case "youtube":
      return <Youtube className={cls} />;
    case "linkedin":
      return <Linkedin className={cls} />;
    case "whatsapp":
      return <MessageCircle className={cls} />;
    default:
      return <Globe className={cls} />;
  }
}

export function Footer() {
  const { lang } = useLang();
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT });

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings({ ...DEFAULT, ...data });
      })
      .catch(() => {});
  }, []);

  const sortedLinks = [...settings.quickLinks].sort(
    (a, b) => a.order - b.order,
  );
  const logoUrl = settings.hotspotUIConfig?.logoUrl;
  const logoText =
    settings.hotspotUIConfig?.logoText ||
    (lang === "mr" ? "पंचनामा लक्षवेधी" : "SamacharHUB");

  return (
    <footer className="bg-foreground text-background mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={logoText}
                  className="max-h-10 md:max-h-14 w-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                    const next = e.currentTarget
                      .nextElementSibling as HTMLElement | null;
                    if (next) next.style.display = "block";
                  }}
                />
              ) : null}
              <h3
                className="font-serif text-xl font-bold text-primary"
                style={{ display: logoUrl ? "none" : "block" }}
              >
                {logoText}
              </h3>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              {lang === "mr"
                ? settings.siteDescriptionMr
                : settings.siteDescription}
            </p>
            {settings.socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                {settings.socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    title={s.platform}
                    className="w-8 h-8 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                  >
                    <SocialIcon icon={s.icon} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-background/60">
              {lang === "mr" ? "जलद दुवे" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-sm">
              {sortedLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.url}>
                    <span className="hover:text-primary cursor-pointer transition-colors">
                      {lang === "mr" ? link.labelMr || link.label : link.label}
                    </span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/admin">
                  <span className="hover:text-primary cursor-pointer transition-colors text-background/50">
                    {lang === "mr" ? "प्रशासक" : "Admin Login"}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-background/60">
              {lang === "mr" ? "संपर्क" : "Contact"}
            </h4>
            <ul className="space-y-2 text-sm text-background/70">
              {settings.contactEmail && <li>{settings.contactEmail}</li>}
              {settings.contactPhone && <li>{settings.contactPhone}</li>}
              {(settings.contactAddress || settings.contactAddressMr) && (
                <li>
                  {lang === "mr"
                    ? settings.contactAddressMr || settings.contactAddress
                    : settings.contactAddress}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-background/40">
          <span>
            &copy; {new Date().getFullYear()} SamacharHUB. All rights
            reserved.
          </span>
          <span className="flex items-center gap-1.5">
            Powered by{" "}
            <a
              href={settings.poweredByUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-primary hover:text-primary/80 transition-colors underline underline-offset-2 text-sm tracking-wide"
              style={{ textShadow: "0 0 8px rgba(204,0,0,0.3)" }}
            >
              {settings.poweredByText}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
