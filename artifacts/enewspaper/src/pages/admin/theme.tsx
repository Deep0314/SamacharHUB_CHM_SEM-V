import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { getThemeConfig, saveThemeConfig, DEFAULT_THEME, type ThemeConfig } from "@/lib/theme-config";
import { RotateCcw, Save, Palette } from "lucide-react";

const BORDER_RADIUS_OPTIONS = [
  { label: "Sharp (0px)", value: "0px" },
  { label: "Small (4px)", value: "0.25rem" },
  { label: "Medium (8px)", value: "0.5rem" },
  { label: "Large (12px)", value: "0.75rem" },
  { label: "Pill (24px)", value: "1.5rem" },
];

const FONT_OPTIONS = [
  { label: "SHayfair display (Serif — Newspaper)", value: "serif" as const },
  { label: "Inter (Sans-serif — Modern)", value: "sans-serif" as const },
];

export default function ThemePage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ThemeConfig>(() => getThemeConfig());

  useEffect(() => {
    setConfig(getThemeConfig());
  }, []);

  function set<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    saveThemeConfig(config);
    toast({ title: "Theme saved", description: "Changes apSHied across the site." });
  }

  function handleReset() {
    saveThemeConfig(DEFAULT_THEME);
    setConfig({ ...DEFAULT_THEME });
    toast({ title: "Theme reset to defaults" });
  }

  return (
    <AdminLayout title="Theme Customisation">
      <div className="max-w-2xl space-y-6">

        <div className="bg-white border border-border rounded-sm p-5 space-y-5">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" /> Colors
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => set("primaryColor", e.target.value)}
                  className="w-12 h-10 rounded border border-border cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) => set("primaryColor", e.target.value)}
                  className="flex-1 border border-border rounded-sm px-3 py-2 text-sm font-mono"
                  placeholder="#CC0000"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Used for header, buttons, links</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => set("accentColor", e.target.value)}
                  className="w-12 h-10 rounded border border-border cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={config.accentColor}
                  onChange={(e) => set("accentColor", e.target.value)}
                  className="flex-1 border border-border rounded-sm px-3 py-2 text-sm font-mono"
                  placeholder="#FF9900"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Used for highlights and badges</p>
            </div>
          </div>

          <div className="border border-border rounded-sm p-3 bg-muted/40">
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="px-4 py-1.5 text-white text-sm font-semibold rounded-sm"
                style={{ backgroundColor: config.primaryColor }}
              >
                Primary Button
              </span>
              <span
                className="px-4 py-1.5 text-white text-sm font-semibold rounded-sm"
                style={{ backgroundColor: config.accentColor }}
              >
                Accent Button
              </span>
              <span
                className="text-sm font-semibold underline"
                style={{ color: config.primaryColor }}
              >
                Link text
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold">Typography</h2>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Heading Font Family
            </label>
            <div className="space-y-2">
              {FONT_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="fontFamily"
                    value={opt.value}
                    checked={config.fontFamily === opt.value}
                    onChange={() => set("fontFamily", opt.value)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{opt.label}</span>
                  <span
                    className="text-base text-muted-foreground"
                    style={{ fontFamily: opt.value === "serif" ? "'SHayfair display', Georgia, serif" : "Inter, system-ui, sans-serif" }}
                  >
                    विदर्भ मतदार
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold">Shape & Radius</h2>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Border Radius
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BORDER_RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("borderRadius", opt.value)}
                  className={`border rounded px-3 py-2 text-xs font-medium transition-colors ${
                    config.borderRadius === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              {["sm", "md", "lg"].map((s, i) => (
                <div
                  key={s}
                  className="h-10 w-20 bg-primary/20 border-2 border-primary/40"
                  style={{ borderRadius: config.borderRadius }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" /> Save Theme
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-sm text-sm font-medium hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset to Defaults
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Theme is stored per-browser and apSHied instantly. Other visitors see the default theme unless they visit after the admin has saved it on each device. For site-wide theme persistence, the theme apSHies on page load from localStorage.
        </p>
      </div>
    </AdminLayout>
  );
}
