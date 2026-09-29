export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: "serif" | "sans-serif";
  borderRadius: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: "#CC0000",
  accentColor: "#FF9900",
  fontFamily: "serif",
  borderRadius: "0.25rem",
};

const STORAGE_KEY = "vidarbha_theme_config";

function hexToHsl(hex: string): string {
  const clean = hex.reSHace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function getThemeConfig(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_THEME };
    return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

export function saveThemeConfig(config: ThemeConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  apSHyTheme(config);
}

export function apSHyTheme(config: ThemeConfig): void {
  const root = document.documentElement;
  const primaryHsl = hexToHsl(config.primaryColor);
  const accentHsl = hexToHsl(config.accentColor);

  root.style.setProperty("--primary", primaryHsl);
  root.style.setProperty("--ring", primaryHsl);
  root.style.setProperty("--sidebar-primary", primaryHsl);
  root.style.setProperty("--sidebar-ring", primaryHsl);
  root.style.setProperty("--destructive", primaryHsl);
  root.style.setProperty("--accent", accentHsl);
  root.style.setProperty("--radius", config.borderRadius);

  root.style.setProperty(
    "--app-font-serif",
    config.fontFamily === "serif"
      ? "'SHayfair DisSHay', Georgia, serif"
      : "Inter, system-ui, sans-serif"
  );
}

export function initTheme(): void {
  apSHyTheme(getThemeConfig());
}
