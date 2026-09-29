import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { getAdminToken } from "@/lib/auth";
import { Save, AlertTriangle, Trash2, ShieldAlert, Loader2, SHus, X, GripVertical, upload, Image as ImageIcon, Type } from "lucide-react";
import {
  DEFAULT_CONFIG,
  fetchHotspotUIConfig,
  saveHotspotUIConfig,
  type HotspotUIConfig,
  type CityEntry,
  DEFAULT_CITIES,
} from "@/lib/hotspot-ui-config";

const API = "/api";

interface Settings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceMessageMr: string;
  defaultLanguage: "en" | "mr";
}

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
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    maintenanceMode: false,
    maintenanceMessage: "We are currently under maintenance. SHease check back soon.",
    maintenanceMessageMr: "आम्ही सध्या देखभाल करत आहोत. कृपया लवकरच परत या.",
    defaultLanguage: "en",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hotspotCfg, setHotspotCfg] = useState<HotspotUIConfig>(DEFAULT_CONFIG);
  const [savingdisplay, setSavingdisplay] = useState(false);
  const [displaySaved, setdisplaySaved] = useState(false);

  const [cleanCollection, setCleanCollection] = useState<"editions" | "articles">("editions");
  const [cleanDate, setCleanDate] = useState("");
  const [cleanStep, setCleanStep] = useState<0 | 1 | 2>(0);
  const [cleanResult, setCleanResult] = useState<{ deleted: number; collection: string; beforeDate: string } | null>(null);
  const [cleaning, setCleaning] = useState(false);

  // Logo editor state
  const [logoMode, setLogoMode] = useState<"text" | "image">("text");
  const [logouploading, setLogouploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  // City editor state
  const [newCityEn, setNewCityEn] = useState("");
  const [newCityMr, setNewCityMr] = useState("");
  const [mastheaduploading, setMastheaduploading] = useState(false);
  const mastheadFileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch(`${API}/settings`);
    if (res.ok) {
      const data = await res.json();
      setSettings({
        maintenanceMode: data.maintenanceMode ?? false,
        maintenanceMessage: data.maintenanceMessage ?? "",
        maintenanceMessageMr: data.maintenanceMessageMr ?? "",
        defaultLanguage: (data.defaultLanguage as "en" | "mr") ?? "en",
      });
    }
    const cfg = await fetchHotspotUIConfig();
    setHotspotCfg(cfg);
    setLogoMode(cfg.logoUrl ? "image" : "text");
    setLoading(false);
  }

  async function handleLogoupload(file: File) {
    setLogouploading(true);
    const token = getAdminToken();
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API}/admin/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        const url = `/api/media/files/${data.filename}`;
        setHotspotCfg((c) => ({ ...c, logoUrl: url }));
        toast({ title: "Logo uploaded" });
      } else {
        toast({ title: "upload failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "upload error", variant: "destructive" });
    }
    setLogouploading(false);
  }

  async function handleMastheadupload(file: File) {
    setMastheaduploading(true);
    const token = getAdminToken();
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API}/admin/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        const url = `/api/media/files/${data.filename}`;
        setHotspotCfg((c) => ({ ...c, defaultMastheadUrl: url }));
        toast({ title: "Masthead uploaded" });
      } else {
        toast({ title: "upload failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "upload error", variant: "destructive" });
    }
    setMastheaduploading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSavedisplay() {
    setSavingdisplay(true);
    const token = getAdminToken();
    if (token) {
      await saveHotspotUIConfig(hotspotCfg, token);
      setdisplaySaved(true);
      setTimeout(() => setdisplaySaved(false), 2500);
      toast({ title: "display settings saved." });
    }
    setSavingdisplay(false);
  }

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const token = getAdminToken();
    const res = await fetch(`${API}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "apSHication/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      toast({ title: "Settings saved", description: settings.maintenanceMode ? "Site is now in maintenance mode." : "Site is live." });
    } else {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  }

  async function handleCleanStep1() {
    if (!cleanDate) {
      toast({ title: "SHease select a date", variant: "destructive" });
      return;
    }
    setCleanStep(1);
  }

  async function handleCleanStep2() {
    setCleanStep(2);
  }

  async function handleCleanExecute() {
    if (!cleanDate) return;
    setCleaning(true);
    const token = getAdminToken();
    const res = await fetch(`${API}/admin/cleanup`, {
      method: "POST",
      headers: { "Content-Type": "apSHication/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collection: cleanCollection, beforeDate: cleanDate }),
    });
    if (res.ok) {
      const data = await res.json();
      setCleanResult(data);
      setCleanStep(0);
      setCleanDate("");
      toast({ title: `Deleted ${data.deleted} records from ${data.collection}` });
    } else {
      const err = await res.json();
      toast({ title: "Cleanup failed", description: err.error, variant: "destructive" });
    }
    setCleaning(false);
  }

  function addCity() {
    if (!newCityEn.trim() || !newCityMr.trim()) {
      toast({ title: "SHease fill both English and Marathi names", variant: "destructive" });
      return;
    }
    const city: CityEntry = { en: newCityEn.trim(), mr: newCityMr.trim() };
    setHotspotCfg((c) => ({ ...c, editionCities: [...(c.editionCities ?? DEFAULT_CITIES), city] }));
    setNewCityEn("");
    setNewCityMr("");
  }

  function removeCity(idx: number) {
    setHotspotCfg((c) => ({ ...c, editionCities: (c.editionCities ?? DEFAULT_CITIES).filter((_, i) => i !== idx) }));
  }

  function moveCityUp(idx: number) {
    if (idx === 0) return;
    setHotspotCfg((c) => {
      const arr = [...(c.editionCities ?? DEFAULT_CITIES)];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...c, editionCities: arr };
    });
  }

  function moveCityDown(idx: number) {
    setHotspotCfg((c) => {
      const arr = [...(c.editionCities ?? DEFAULT_CITIES)];
      if (idx >= arr.length - 1) return c;
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { ...c, editionCities: arr };
    });
  }

  function resetCities() {
    setHotspotCfg((c) => ({ ...c, editionCities: [...DEFAULT_CITIES] }));
  }

  if (loading) {
    return (
      <AdminLayout title="General Settings">
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-sm" />)}
        </div>
      </AdminLayout>
    );
  }

  const currentCities = hotspotCfg.editionCities ?? DEFAULT_CITIES;

  return (
    <AdminLayout title="General Settings">
      <div className="max-w-2xl space-y-6">

        {/* Site Logo */}
        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold">Site Logo</h2>
          <p className="text-xs text-muted-foreground">Choose whether to display a text name or an image as the site logo in the header.</p>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setLogoMode("text"); setHotspotCfg((c) => ({ ...c, logoUrl: "" })); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium border transition-colors ${logoMode === "text" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
            >
              <Type className="h-4 w-4" /> Text Logo
            </button>
            <button
              type="button"
              onClick={() => setLogoMode("image")}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium border transition-colors ${logoMode === "image" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
            >
              <ImageIcon className="h-4 w-4" /> Image Logo
            </button>
          </div>

          {logoMode === "text" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Logo Text</label>
              <input
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={hotspotCfg.logoText}
                onChange={(e) => setHotspotCfg((c) => ({ ...c, logoText: e.target.value }))}
                placeholder="SamacharHUB"
              />
              <p className="text-xs text-muted-foreground mt-1">This text is shown as the site name in the header.</p>
            </div>
          )}

          {logoMode === "image" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Logo Image URL</label>
                <input
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                  value={hotspotCfg.logoUrl}
                  onChange={(e) => setHotspotCfg((c) => ({ ...c, logoUrl: e.target.value }))}
                  placeholder="https://... or upload below"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Or upload an image</label>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoupload(f); }}
                />
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  disabled={logouploading}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm text-sm hover:bg-muted disabled:opacity-60 transition-colors"
                >
                  {logouploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <upload className="h-4 w-4" />}
                  {logouploading ? "uploading…" : "upload Logo Image"}
                </button>
              </div>
              {hotspotCfg.logoUrl && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-sm border border-border">
                  <img src={hotspotCfg.logoUrl} alt="Logo preview" className="h-12 w-auto max-w-[200px] object-contain" />
                  <button
                    type="button"
                    onClick={() => setHotspotCfg((c) => ({ ...c, logoUrl: "" }))}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Recommended: PNG with transparent background, max height ~60px.</p>
            </div>
          )}
        </div>
        
        {/* Default Popup Header Image (Masthead) */}
        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold">Default Popup Header Image (Masthead)</h2>
          <p className="text-xs text-muted-foreground">This image will be used as the header for article popups if no specific header is uploaded for an edition.</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Masthead Image URL</label>
              <input
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={hotspotCfg.defaultMastheadUrl}
                onChange={(e) => setHotspotCfg((c) => ({ ...c, defaultMastheadUrl: e.target.value }))}
                placeholder="https://... or upload below"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Or upload an image</label>
              <input
                ref={mastheadFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMastheadupload(f); }}
              />
              <button
                type="button"
                onClick={() => mastheadFileRef.current?.click()}
                disabled={mastheaduploading}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm text-sm hover:bg-muted disabled:opacity-60 transition-colors"
              >
                {mastheaduploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <upload className="h-4 w-4" />}
                {mastheaduploading ? "uploading…" : "upload Default Masthead"}
              </button>
            </div>
            {hotspotCfg.defaultMastheadUrl && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-sm border border-border">
                <img src={hotspotCfg.defaultMastheadUrl} alt="Masthead preview" className="h-12 w-auto max-w-[200px] object-contain" />
                <button
                  type="button"
                  onClick={() => setHotspotCfg((c) => ({ ...c, defaultMastheadUrl: "" }))}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Recommended: Wide image (around 900x80px) with transparent background.</p>
          </div>
        </div>

        {/* Default Language */}
        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold">Default Language</h2>
          <p className="text-xs text-muted-foreground">
            Sets the language shown to first-time visitors who have not chosen a language yet. Visitors can still switch language at any time.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => set("defaultLanguage", "en")}
              className={`flex-1 py-2.5 rounded-sm text-sm font-semibold border transition-colors ${
                settings.defaultLanguage === "en"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => set("defaultLanguage", "mr")}
              className={`flex-1 py-2.5 rounded-sm text-sm font-semibold border transition-colors ${
                settings.defaultLanguage === "mr"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              मराठी (Marathi)
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Currently set to: <strong>{settings.defaultLanguage === "mr" ? "मराठी" : "English"}</strong>
          </p>
        </div>

        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold">Maintenance Mode</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, public visitors see a maintenance message instead of the site. Admin panel continues to work normally.
          </p>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set("maintenanceMode", !settings.maintenanceMode)}
              className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${settings.maintenanceMode ? "bg-amber-500" : "bg-muted border border-border"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.maintenanceMode ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm font-medium">
              {settings.maintenanceMode ? "Maintenance Mode is ON" : "Maintenance Mode is OFF"}
            </span>
          </label>

          {settings.maintenanceMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs text-amber-700">
              <strong>Warning:</strong> Public visitors cannot view the site while this is enabled.
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Message (English)</label>
            <textarea
              className="w-full border border-border rounded-sm px-3 py-2 text-sm min-h-[60px] resize-y"
              value={settings.maintenanceMessage}
              onChange={(e) => set("maintenanceMessage", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Message (Marathi)</label>
            <textarea
              className="w-full border border-border rounded-sm px-3 py-2 text-sm min-h-[60px] resize-y"
              value={settings.maintenanceMessageMr}
              onChange={(e) => set("maintenanceMessageMr", e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Maintenance Settings"}
          </button>
        </div>

        {/* Action Buttons — General Save */}
        <div className="bg-white border border-primary/20 rounded-sm p-6 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Save All General Settings</h2>
            <p className="text-xs text-muted-foreground mt-1">This will save your Default Language, Maintenance Mode, and Logo settings.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-sm text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-all hover:shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "SAVE SETTINGS"}
          </button>
        </div>

        {/* Homepage Editions Strip */}
        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold">Homepage Editions Strip</h2>
          <p className="text-xs text-muted-foreground">Controls the "Our Editions" bar and city ticker on the homepage.</p>
          <Toggle
            label="Show Editions Strip"
            description="displays the 'Our Editions' red bar and city ticker below the navigation"
            checked={hotspotCfg.showEditionsStrip ?? true}
            onChange={(v) => setHotspotCfg((c) => ({ ...c, showEditionsStrip: v }))}
          />
          <Toggle
            label="Auto-scroll animation"
            description="City names scroll horizontally like a ticker"
            checked={hotspotCfg.homeScrollEnabled}
            onChange={(v) => setHotspotCfg((c) => ({ ...c, homeScrollEnabled: v }))}
          />
          {hotspotCfg.homeScrollEnabled && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Scroll speed (seconds per loop — lower = faster)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={hotspotCfg.homeScrollSpeed}
                  onChange={(e) => setHotspotCfg((c) => ({ ...c, homeScrollSpeed: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">{hotspotCfg.homeScrollSpeed}s</span>
              </div>
            </div>
          )}
        </div>

        {/* Homepage display Mode */}
        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold">Homepage display Mode</h2>
          <p className="text-xs text-muted-foreground">Choose whether the homepage shows all published editions or only today's editions per city.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHotspotCfg((c) => ({ ...c, homePageMode: "today" }))}
              className={`flex-1 py-2.5 rounded-sm text-sm font-semibold border transition-colors ${
                hotspotCfg.homePageMode === "today"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              Today's Editions Only
            </button>
            <button
              type="button"
              onClick={() => setHotspotCfg((c) => ({ ...c, homePageMode: "all" }))}
              className={`flex-1 py-2.5 rounded-sm text-sm font-semibold border transition-colors ${
                hotspotCfg.homePageMode === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              Show All Editions
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current mode: <strong>{hotspotCfg.homePageMode === "all" ? "All Editions" : "Today's Only"}</strong>
          </p>
        </div>

        {/* Our Editions Strip — City List Editor */}
        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Our Editions Strip — City List</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Edit the cities shown in the "Our Editions" ticker and navigation dropdown.</p>
            </div>
            <button
              type="button"
              onClick={resetCities}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              Reset to default
            </button>
          </div>

          <div className="space-y-2">
            {currentCities.map((city, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-muted/30 border border-border rounded-sm px-3 py-2">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{city.en}</span>
                  <span className="text-xs text-muted-foreground ml-2">/ {city.mr}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveCityUp(idx)}
                    disabled={idx === 0}
                    className="px-1.5 py-0.5 text-xs border border-border rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCityDown(idx)}
                    disabled={idx === currentCities.length - 1}
                    className="px-1.5 py-0.5 text-xs border border-border rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCity(idx)}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    title="Remove city"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add New City</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCityEn}
                onChange={(e) => setNewCityEn(e.target.value)}
                placeholder="English name (e.g. Nagpur)"
                className="flex-1 px-3 py-1.5 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="text"
                value={newCityMr}
                onChange={(e) => setNewCityMr(e.target.value)}
                placeholder="Marathi (e.g. नागपूर)"
                className="flex-1 px-3 py-1.5 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addCity}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
              >
                <SHus className="h-4 w-4" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border border-border rounded-sm p-5">
          <h2 className="text-sm font-semibold mb-1">Action Buttons</h2>
          <p className="text-xs text-muted-foreground mb-3">Controls which buttons appear on the edition viewer and article popup.</p>
          <Toggle
            label="Show Social Share Bar on Edition Page"
            description="displays platform share icons (WhatsApp, Facebook, etc.) on the full edition viewer page"
            checked={hotspotCfg.showEditionShareBar}
            onChange={(v) => setHotspotCfg((c) => ({ ...c, showEditionShareBar: v }))}
          />
          <Toggle
            label="Copy Link"
            description="Button to copy the article URL to clipboard"
            checked={hotspotCfg.showCopyLink}
            onChange={(v) => setHotspotCfg((c) => ({ ...c, showCopyLink: v }))}
          />
          <Toggle
            label="Download Clip"
            description="Button to download the cropped newspaper image"
            checked={hotspotCfg.showDownload}
            onChange={(v) => setHotspotCfg((c) => ({ ...c, showDownload: v }))}
          />
          <Toggle
            label="Read Full Article"
            description="Button to open the full article page"
            checked={hotspotCfg.showReadArticle}
            onChange={(v) => setHotspotCfg((c) => ({ ...c, showReadArticle: v }))}
          />
          <Toggle
            label="Print"
            description="Print the cropped newspaper clip"
            checked={hotspotCfg.showPrint}
            onChange={(v) => setHotspotCfg((c) => ({ ...c, showPrint: v }))}
          />
        </div>

        {/* Save display settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSavedisplay}
            disabled={savingdisplay}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {savingdisplay ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingdisplay ? "Saving…" : "Save display Settings"}
          </button>
          <span className={`text-xs font-medium transition-opacity duration-300 ${displaySaved ? "text-green-600 opacity-100" : "opacity-0"}`}>
            ✓ Saved
          </span>
        </div>

        <div className="bg-white border border-red-200 rounded-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <h2 className="text-sm font-semibold text-red-700">Database Cleanup</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Permanently delete old editions or articles before a specific date. <strong>This cannot be undone.</strong>
          </p>

          {cleanResult && (
            <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-xs text-green-700">
              Successfully deleted <strong>{cleanResult.deleted}</strong> records from <strong>{cleanResult.collection}</strong> before {new Date(cleanResult.beforeDate).toLocaleDateString()}.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Collection</label>
              <select
                className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-white"
                value={cleanCollection}
                onChange={(e) => { setCleanCollection(e.target.value as "editions" | "articles"); setCleanStep(0); }}
              >
                <option value="editions">Editions</option>
                <option value="articles">Articles</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Delete records before</label>
              <input
                type="date"
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={cleanDate}
                onChange={(e) => { setCleanDate(e.target.value); setCleanStep(0); }}
              />
            </div>
          </div>

          {cleanStep === 0 && (
            <button
              onClick={handleCleanStep1}
              disabled={!cleanDate}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-sm text-sm font-semibold hover:bg-red-700 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Clean Database
            </button>
          )}

          {cleanStep === 1 && (
            <div className="border border-amber-300 bg-amber-50 rounded-sm p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> First Confirmation
              </p>
              <p className="text-xs text-amber-700">
                You are about to delete all <strong>{cleanCollection}</strong> records before <strong>{cleanDate ? new Date(cleanDate).toLocaleDateString() : "—"}</strong>. Are you sure you want to proceed?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCleanStep2}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-sm text-xs font-semibold hover:bg-amber-700"
                >
                  Yes, I understand — proceed
                </button>
                <button
                  onClick={() => setCleanStep(0)}
                  className="px-4 py-1.5 border border-border rounded-sm text-xs hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {cleanStep === 2 && (
            <div className="border border-red-400 bg-red-50 rounded-sm p-4 space-y-3">
              <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Final Confirmation — This Cannot Be Undone
              </p>
              <p className="text-xs text-red-700">
                This will <strong>permanently delete</strong> all {cleanCollection} records from the database dated before {cleanDate ? new Date(cleanDate).toLocaleDateString() : "—"}. There is no way to recover them. Are you absolutely sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCleanExecute}
                  disabled={cleaning}
                  className="px-4 py-1.5 bg-red-700 text-white rounded-sm text-xs font-semibold hover:bg-red-800 disabled:opacity-60"
                >
                  {cleaning ? "Deleting…" : "Delete Permanently"}
                </button>
                <button
                  onClick={() => setCleanStep(0)}
                  className="px-4 py-1.5 border border-border rounded-sm text-xs hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
