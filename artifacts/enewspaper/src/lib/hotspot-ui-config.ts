export interface CityEntry {
  en: string;
  mr: string;
}

export interface HotspotUIConfig {
  showLogo: boolean;
  logoUrl: string;
  logoText: string;
  showArticleDetails: boolean;
  showZoomHint: boolean;
  showCopyLink: boolean;
  showDownload: boolean;
  showReadArticle: boolean;
  showPrint: boolean;
  showEditionShareBar: boolean;
  tickerContinuous: boolean;
  showBreakingNewsStrip: boolean;
  showEditionsStrip: boolean;
  shareButtons: {
    whatsapp: boolean;
    facebook: boolean;
    instagram: boolean;
    twitter: boolean;
    telegram: boolean;
    email: boolean;
    linkedin: boolean;
  };
  popupHeaderText: string;
  popupHeaderTextMr: string;
  footerSiteUrl: string;
  footerPoweredBy: string;
  showFooterDate: boolean;
  showFooterPage: boolean;
  homeScrollEnabled: boolean;
  homeScrollSpeed: number;
  editionCities: CityEntry[];
  homePageMode: "all" | "today";
  defaultMastheadUrl: string;
}

export const DEFAULT_CITIES: CityEntry[] = [
  { en: "Amravati", mr: "अमरावती" },
  { en: "Namaskar Amravati", mr: "नमस्कार अमरावती" },
  { en: "Yavatmal", mr: "यवतमाळ" },
  { en: "Buldhana", mr: "बुलढाणा" },
  { en: "Akola", mr: "अकोला" },
  { en: "Washim", mr: "वाशीम" },
  { en: "Wardha", mr: "वर्धा" },
  { en: "Weekly", mr: "साप्ताहिक" },
];

export const DEFAULT_CONFIG: HotspotUIConfig = {
  showLogo: true,
  logoUrl: "/logo.jpg",
  logoText: "SamacharHUB",
  showArticleDetails: true,
  showZoomHint: true,
  showCopyLink: true,
  showDownload: true,
  showReadArticle: true,
  showPrint: true,
  showEditionShareBar: true,
  tickerContinuous: true,
  showBreakingNewsStrip: true,
  showEditionsStrip: true,
  shareButtons: {
    whatsapp: true,
    facebook: true,
    instagram: true,
    twitter: true,
    telegram: true,
    email: true,
    linkedin: false,
  },
  popupHeaderText: "Newspaper Clip",
  popupHeaderTextMr: "वर्तमानपत्र क्लिप",
  footerSiteUrl: "www.samacharhub.com",
  footerPoweredBy: "Powered by | Deep Kamble",
  showFooterDate: true,
  showFooterPage: true,
  homeScrollEnabled: true,
  homeScrollSpeed: 30,
  editionCities: DEFAULT_CITIES,
  homePageMode: "today",
  defaultMastheadUrl: "",
};

function mergeConfig(stored: Partial<HotspotUIConfig>): HotspotUIConfig {
  return {
    ...DEFAULT_CONFIG,
    ...stored,
    shareButtons: {
      ...DEFAULT_CONFIG.shareButtons,
      ...(stored.shareButtons ?? {}),
    },
    editionCities:
      stored.editionCities && stored.editionCities.length > 0
        ? stored.editionCities
        : DEFAULT_CONFIG.editionCities,
  };
}

export async function fetchHotspotUIConfig(): Promise<HotspotUIConfig> {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return { ...DEFAULT_CONFIG, shareButtons: { ...DEFAULT_CONFIG.shareButtons }, editionCities: [...DEFAULT_CONFIG.editionCities] };
    const data = await res.json();
    if (!data.hotspotUIConfig) return { ...DEFAULT_CONFIG, shareButtons: { ...DEFAULT_CONFIG.shareButtons }, editionCities: [...DEFAULT_CONFIG.editionCities] };
    return mergeConfig(data.hotspotUIConfig);
  } catch {
    return { ...DEFAULT_CONFIG, shareButtons: { ...DEFAULT_CONFIG.shareButtons }, editionCities: [...DEFAULT_CONFIG.editionCities] };
  }
}

export async function saveHotspotUIConfig(config: HotspotUIConfig, token: string): Promise<void> {
  await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "apSHication/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ hotspotUIConfig: config }),
  });
}
