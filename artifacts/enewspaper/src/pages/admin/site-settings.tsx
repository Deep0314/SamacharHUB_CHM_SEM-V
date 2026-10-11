import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { getAdminToken } from "@/lib/auth";
import { Plus, Trash2, Save, Globe, Share2, Phone, Link2, FileText } from "lucide-react";

const API = "/api";

const SOCIAL_ICONS = ["facebook", "whatsapp", "instagram", "telegram", "twitter", "youtube", "linkedin", "website"];

interface QuickLink { label: string; labelMr: string; url: string; order: number; }
interface SocialLink { platform: string; url: string; icon: string; }
interface Settings {
  siteDescription: string;
  siteDescriptionMr: string;
  quickLinks: QuickLink[];
  socialLinks: SocialLink[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactAddressMr: string;
  aboutContent: string;
  aboutContentMr: string;
  poweredByText: string;
  poweredByUrl: string;
}

const DEFAULT: Settings = {
  siteDescription: "Maharashtra's trusted regional e-newspaper.",
  siteDescriptionMr: "महाराष्ट्राचे विश्वासू प्रादेशिक वृत्तपत्र.",
  quickLinks: [],
  socialLinks: [],
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  contactAddressMr: "",
  aboutContent: "",
  aboutContentMr: "",
  poweredByText: "Deep Kamble",
  poweredByUrl: "https://deepkamble.online",
};

export default function SiteSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`${API}/settings`);
    if (res.ok) {
      const data = await res.json();
      setSettings({ ...DEFAULT, ...data });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updateQuickLink(idx: number, field: keyof QuickLink, value: string | number) {
    const links = [...settings.quickLinks];
    links[idx] = { ...links[idx], [field]: value };
    set("quickLinks", links);
  }

  function addQuickLink() {
    set("quickLinks", [...settings.quickLinks, { label: "", labelMr: "", url: "", order: settings.quickLinks.length }]);
  }

  function removeQuickLink(idx: number) {
    set("quickLinks", settings.quickLinks.filter((_, i) => i !== idx));
  }

  function updateSocialLink(idx: number, field: keyof SocialLink, value: string) {
    const links = [...settings.socialLinks];
    links[idx] = { ...links[idx], [field]: value };
    set("socialLinks", links);
  }

  function addSocialLink() {
    set("socialLinks", [...settings.socialLinks, { platform: "", url: "", icon: "website" }]);
  }

  function removeSocialLink(idx: number) {
    set("socialLinks", settings.socialLinks.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    const token = getAdminToken();
    const res = await fetch(`${API}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      toast({ title: "Site settings saved" });
    } else {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <AdminLayout title="Footer & Site Settings">
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-sm" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Footer & Site Settings">
      <div className="max-w-2xl space-y-6">

        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Site Description
          </h2>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description (English)</label>
            <textarea
              className="w-full border border-border rounded-sm px-3 py-2 text-sm min-h-[70px] resize-y"
              value={settings.siteDescription}
              onChange={(e) => set("siteDescription", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description (Marathi)</label>
            <textarea
              className="w-full border border-border rounded-sm px-3 py-2 text-sm min-h-[70px] resize-y"
              value={settings.siteDescriptionMr}
              onChange={(e) => set("siteDescriptionMr", e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> About Us Content
          </h2>
          <p className="text-xs text-muted-foreground">This content will be displayed on your "About Us" page. You can use multiple paragraphs.</p>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">About Us (English)</label>
            <textarea
              className="w-full border border-border rounded-sm px-3 py-2 text-sm min-h-[150px] resize-y"
              value={settings.aboutContent}
              onChange={(e) => set("aboutContent", e.target.value)}
              placeholder="Tell your story..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">About Us (Marathi)</label>
            <textarea
              className="w-full border border-border rounded-sm px-3 py-2 text-sm min-h-[150px] resize-y"
              value={settings.aboutContentMr}
              onChange={(e) => set("aboutContentMr", e.target.value)}
              placeholder="तुमची कथा लिहा..."
            />
          </div>
        </div>

        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" /> Quick Links
            </h2>
            <button
              onClick={addQuickLink}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add Link
            </button>
          </div>
          {settings.quickLinks.length === 0 && (
            <p className="text-xs text-muted-foreground">No quick links yet. Add links for About, Contact, Categories, etc.</p>
          )}
          {settings.quickLinks.map((link, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-end">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Label (EN)</label>
                <input
                  className="w-full border border-border rounded-sm px-2 py-1.5 text-sm"
                  value={link.label}
                  onChange={(e) => updateQuickLink(idx, "label", e.target.value)}
                  placeholder="About Us"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Label (MR)</label>
                <input
                  className="w-full border border-border rounded-sm px-2 py-1.5 text-sm"
                  value={link.labelMr}
                  onChange={(e) => updateQuickLink(idx, "labelMr", e.target.value)}
                  placeholder="आमच्या विषयी"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">URL</label>
                <input
                  className="w-full border border-border rounded-sm px-2 py-1.5 text-sm"
                  value={link.url}
                  onChange={(e) => updateQuickLink(idx, "url", e.target.value)}
                  placeholder="/about"
                />
              </div>
              <button onClick={() => removeQuickLink(idx)} className="pb-0.5 p-1.5 hover:bg-red-50 rounded text-muted-foreground hover:text-red-600 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" /> Social Media Links
            </h2>
            <button
              onClick={addSocialLink}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add Social
            </button>
          </div>
          {settings.socialLinks.length === 0 && (
            <p className="text-xs text-muted-foreground">No social links yet.</p>
          )}
          {settings.socialLinks.map((link, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-end">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Platform</label>
                <input
                  className="w-full border border-border rounded-sm px-2 py-1.5 text-sm"
                  value={link.platform}
                  onChange={(e) => updateSocialLink(idx, "platform", e.target.value)}
                  placeholder="Facebook"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Icon</label>
                <select
                  className="w-full border border-border rounded-sm px-2 py-1.5 text-sm bg-white"
                  value={link.icon}
                  onChange={(e) => updateSocialLink(idx, "icon", e.target.value)}
                >
                  {SOCIAL_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">URL</label>
                <input
                  className="w-full border border-border rounded-sm px-2 py-1.5 text-sm"
                  value={link.url}
                  onChange={(e) => updateSocialLink(idx, "url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <button onClick={() => removeSocialLink(idx)} className="pb-0.5 p-1.5 hover:bg-red-50 rounded text-muted-foreground hover:text-red-600 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" /> Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={settings.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
              <input
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={settings.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                placeholder="+91 ..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address (English)</label>
              <input
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={settings.contactAddress}
                onChange={(e) => set("contactAddress", e.target.value)}
                placeholder="Nagpur, Maharashtra"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address (Marathi)</label>
              <input
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={settings.contactAddressMr}
                onChange={(e) => set("contactAddressMr", e.target.value)}
                placeholder="नागपूर, महाराष्ट्र"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold">Footer — Powered By</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Developer Name</label>
              <input
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={settings.poweredByText}
                onChange={(e) => set("poweredByText", e.target.value)}
                placeholder="Deep Kamble"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Developer URL</label>
              <input
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={settings.poweredByUrl}
                onChange={(e) => set("poweredByUrl", e.target.value)}
                placeholder="https://deepkamble.online"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </AdminLayout>
  );
}
