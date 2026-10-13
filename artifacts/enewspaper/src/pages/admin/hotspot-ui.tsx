import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_CONFIG,
  fetchHotspotUIConfig,
  saveHotspotUIConfig,
  type HotspotUIConfig,
} from "@/lib/hotspot-ui-config";
import { getAdminToken } from "@/lib/auth";
import { useUploadMedia } from "@samacharhub/api-client-react";
import { Save, RotateCcw, Upload, Loader2 } from "lucide-react";

function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-primary" : "bg-muted"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

const SHARE_LABELS: Record<keyof HotspotUIConfig["shareButtons"], string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram (link)",
  twitter: "X (Twitter)",
  telegram: "Telegram",
  email: "Email",
  linkedin: "LinkedIn",
};

export default function HotspotUIPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<HotspotUIConfig>(DEFAULT_CONFIG);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [loading, setLoading] = useState(true);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const uploadMedia = useUploadMedia({
    mutation: {
      onSuccess: (created: any) => {
        const url = (created as any).url ?? "";
        setConfig((c) => {
          const next = { ...c, logoUrl: url };
          const token = getAdminToken();
          if (token) saveHotspotUIConfig(next, token);
          return next;
        });
        setUploadingLogo(false);
        showSaved();
        toast({ title: "Logo uploaded and saved!" });
      },
      onError: () => {
        setUploadingLogo(false);
        toast({ title: "Upload failed", variant: "destructive" });
      },
    },
  });

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.currentTarget.value = "";
    setUploadingLogo(true);
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const base64Data = btoa(binary);
    uploadMedia.mutate({
      data: { filename: file.name, mimeType: file.type || "image/png", base64Data, altText: "Logo" } as any,
    });
  }

  useEffect(() => {
    fetchHotspotUIConfig().then((cfg) => {
      setConfig(cfg);
      setLoading(false);
    });
  }, []);

  function showSaved() {
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2500);
  }

  function set<K extends keyof HotspotUIConfig>(key: K, value: HotspotUIConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  function setShare(key: keyof HotspotUIConfig["shareButtons"], value: boolean) {
    setConfig((c) => ({ ...c, shareButtons: { ...c.shareButtons, [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    const token = getAdminToken();
    if (token) {
      await saveHotspotUIConfig(configRef.current, token);
      showSaved();
      toast({ title: "Settings saved." });
    }
    setSaving(false);
  }

  async function handleReset() {
    setConfig(DEFAULT_CONFIG);
    const token = getAdminToken();
    if (token) await saveHotspotUIConfig(DEFAULT_CONFIG, token);
    showSaved();
    toast({ title: "Reset to defaults." });
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title="Hotspot Popup UI">
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading settings…</span>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title="Hotspot Popup UI">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm text-muted-foreground">
            Configure what appears inside the article popup when a reader clicks a hotspot.
          </p>

          {/* Logo */}
          <div className="bg-white border border-border rounded-sm p-5 space-y-4">
            <h3 className="font-semibold text-sm">Logo / Masthead</h3>
            <Toggle
              label="Show logo at top"
              description="Displays the newspaper name or logo image at the top of the popup"
              checked={config.showLogo}
              onChange={(v) => set("showLogo", v)}
            />
            {config.showLogo && (
              <div className="space-y-3 pt-1">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logo Image</p>
                  <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                  {config.logoUrl ? (
                    <div className="border border-border rounded-sm p-3 bg-muted/30 space-y-2">
                      <img
                        src={config.logoUrl}
                        alt="Logo preview"
                        className="h-12 object-contain max-w-[200px]"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
                      />
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => logoFileRef.current?.click()}
                          disabled={uploadingLogo}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-border rounded-sm text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                        >
                          {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          {uploadingLogo ? "Uploading…" : "Replace image"}
                        </button>
                        <button
                          type="button"
                          onClick={() => set("logoUrl", "")}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove image
                        </button>
                      </div>
                      <p className="text-[11px] text-green-600 font-medium">✓ Image logo active — text fallback hidden</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoFileRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-sm text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingLogo ? "Uploading…" : "Upload logo image"}
                    </button>
                  )}
                  <Field
                    label="Or paste image URL"
                    value={config.logoUrl}
                    onChange={(v) => set("logoUrl", v)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                {!config.logoUrl && (
                  <Field
                    label="Logo Text (used when no image is set)"
                    value={config.logoText}
                    onChange={(v) => set("logoText", v)}
                    placeholder="SamacharHUB"
                  />
                )}
              </div>
            )}
          </div>

          {/* Header Tagline */}
          <div className="bg-white border border-border rounded-sm p-5 space-y-3">
            <h3 className="font-semibold text-sm">Header Tagline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field
                label="English"
                value={config.tagline || ""}
                onChange={(v) => set("tagline", v)}
                placeholder="Read without language barriers, share without limits."
              />
              <Field
                label="मराठी"
                value={config.taglineMr || ""}
                onChange={(v) => set("taglineMr", v)}
                placeholder="भाषेच्या मर्यादांशिवाय वाचा, अमर्याद शेअर करा."
              />
              <Field
                label="हिंदी"
                value={config.taglineHi || ""}
                onChange={(v) => set("taglineHi", v)}
                placeholder="बिना किसी भाषा बाधा के पढ़ें, असीमित साझा करें."
              />
            </div>
          </div>

          {/* Popup Header */}
          <div className="bg-white border border-border rounded-sm p-5 space-y-3">
            <h3 className="font-semibold text-sm">Popup Header Label</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field
                label="English"
                value={config.popupHeaderText}
                onChange={(v) => set("popupHeaderText", v)}
                placeholder="Newspaper Clip"
              />
              <Field
                label="मराठी"
                value={config.popupHeaderTextMr}
                onChange={(v) => set("popupHeaderTextMr", v)}
                placeholder="वृत्तपत्र क्लिप"
              />
              <Field
                label="हिंदी"
                value={config.popupHeaderTextHi || ""}
                onChange={(v) => set("popupHeaderTextHi", v)}
                placeholder="समाचार क्लिप"
              />
            </div>
          </div>

          {/* Footer / Popup Info */}
          <div className="bg-white border border-border rounded-sm p-5 space-y-4">
            <h3 className="font-semibold text-sm">Popup Footer Details</h3>
            <p className="text-xs text-muted-foreground -mt-2">These appear below the clipped article image in the popup.</p>
            <Toggle
              label="Show edition date"
              checked={config.showFooterDate}
              onChange={(v) => set("showFooterDate", v)}
            />
            <Toggle
              label="Show page number"
              checked={config.showFooterPage}
              onChange={(v) => set("showFooterPage", v)}
            />
            <Field
              label="Website URL"
              value={config.footerSiteUrl}
              onChange={(v) => set("footerSiteUrl", v)}
              placeholder="www.samacharhub.com"
            />
            <Field
              label="Powered by / Credit line"
              value={config.footerPoweredBy}
              onChange={(v) => set("footerPoweredBy", v)}
              placeholder="Powered by | Deep Kamble & Gufran Khan"
            />
          </div>

          {/* Content blocks */}
          <div className="bg-white border border-border rounded-sm p-5">
            <h3 className="font-semibold text-sm mb-1">Content Sections</h3>
            <Toggle
              label="Show article title & summary"
              description="Displays the linked article's headline and teaser below the clip"
              checked={config.showArticleDetails}
              onChange={(v) => set("showArticleDetails", v)}
            />
            <Toggle
              label="Show zoom hint"
              description="Small tip text: 'Zoom with Ctrl+scroll, drag to pan'"
              checked={config.showZoomHint}
              onChange={(v) => set("showZoomHint", v)}
            />
          </div>

          {/* Share buttons */}
          <div className="bg-white border border-border rounded-sm p-5">
            <h3 className="font-semibold text-sm mb-1">Share Buttons</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Toggle which social/share platforms appear in the popup
            </p>
            {(Object.keys(config.shareButtons) as Array<keyof HotspotUIConfig["shareButtons"]>).map(
              (key) => (
                <Toggle
                  key={key}
                  label={SHARE_LABELS[key]}
                  checked={config.shareButtons[key]}
                  onChange={(v) => setShare(key, v)}
                />
              )
            )}
          </div>

          {/* Save / Reset */}
          <div className="flex items-center gap-3 pb-8">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save Settings"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm text-sm hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </button>
            <span className={`text-xs font-medium transition-opacity duration-300 ${savedIndicator ? "text-green-600 opacity-100" : "opacity-0"}`}>
              ✓ Saved
            </span>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
