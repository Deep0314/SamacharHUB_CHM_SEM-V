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
  labelHi?: string;
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
  siteDescriptionHi?: string;
  quickLinks: QuickLink[];
  socialLinks: SocialLink[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactAddressMr: string;
  contactAddressHi?: string;
  poweredByText: string;
  poweredByUrl: string;
  hotspotUIConfig?: { logoUrl?: string; logoText?: string; showLogo?: boolean; footerSiteUrl?: string };
}

const DEFAULT: Settings = {
  siteDescription:
    "Vidarbha's trusted regional e-newspaper. Covering politics, sports, business, and more from the heart of Maharashtra.",
  siteDescriptionMr:
    "विदर्भाचे विश्वासू प्रादेशिक वृत्तपत्र. महाराष्ट्राच्या हृदयातून राजकारण, क्रीडा, व्यापार आणि अधिक.",
  siteDescriptionHi:
    "विदर्भ का विश्वसनीय क्षेत्रीय ई-समाचार पत्र। महाराष्ट्र के दिल से राजनीति, खेल, व्यापार और बहुत कुछ।",
  quickLinks: [
    { label: "About Us", labelMr: "आमच्या विषयी", labelHi: "हमारे बारे में", url: "/about", order: 0 },
    { label: "Contact Us", labelMr: "संपर्क", labelHi: "संपर्क करें", url: "/contact", order: 1 },
    {
      label: "Politics",
      labelMr: "राजकारण",
      labelHi: "राजनीति",
      url: "/category/politics",
      order: 2,
    },
    { label: "Sports", labelMr: "क्रीडा", labelHi: "खेल", url: "/category/sports", order: 3 },
  ],
  socialLinks: [],
  contactEmail: "",
  contactPhone: "",
  contactAddress: "Maharashtra, India",
  contactAddressMr: "महाराष्ट्र, भारत",
  contactAddressHi: "महाराष्ट्र, भारत",
  poweredByText: "Deep Kamble & Gufran Khan",
  poweredByUrl: "http://localhost:3000",
  hotspotUIConfig: { footerSiteUrl: "http://localhost:3000" },
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
  const { lang, t } = useLang();
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT });

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings({ ...DEFAULT, ...data });
      })
      .catch(() => { });
  }, []);

  const sortedLinks = [...settings.quickLinks].sort(
    (a, b) => a.order - b.order,
  );
  const logoUrl = settings.hotspotUIConfig?.logoUrl;
  const logoText =
    settings.hotspotUIConfig?.logoText ||
    t("SamacharHUB", "पंचनामा लक्षवेधी", "समाचार हब");

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
              {t(
                settings.siteDescription,
                settings.siteDescriptionMr,
                settings.siteDescriptionHi,
              )}
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
              {t("Quick Links", "जलद दुवे", "त्वरित लिंक")}
            </h4>
            <ul className="space-y-2 text-sm">
              {sortedLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.url}>
                    <span className="hover:text-primary cursor-pointer transition-colors">
                      {t(link.label, link.labelMr, link.labelHi)}
                    </span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/admin">
                  <span className="hover:text-primary cursor-pointer transition-colors text-background/50">
                    {t("Admin Login", "प्रशासक", "प्रशासक")}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-background/60">
              {t("Contact", "संपर्क", "संपर्क")}
            </h4>
            <ul className="space-y-2 text-sm text-background/70">
              {settings.contactEmail && <li>{settings.contactEmail}</li>}
              {settings.contactPhone && <li>{settings.contactPhone}</li>}
              {(settings.contactAddress || settings.contactAddressMr || settings.contactAddressHi) && (
                <li>
                  {t(
                    settings.contactAddress,
                    settings.contactAddressMr,
                    settings.contactAddressHi,
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-background/40">
          <span>
            &copy; {new Date().getFullYear()} SamacharHUB. {t("All rights reserved.", "सर्व हक्क राखीव.", "सर्वाधिकार सुरक्षित।")}
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
