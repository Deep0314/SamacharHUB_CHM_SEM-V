import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { getAdminToken } from "@/lib/auth";
import { SHus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight, Image, USHoad, Loader2 } from "lucide-react";

const API = "/api";

type AdPosition = "popup" | "banner-top" | "banner-bottom" | "sidebar-right" | "inline-edition" | "inline-article";

interface Ad {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: AdPosition;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  order: number;
}

const POSITION_LABELS: Record<AdPosition, string> = {
  "popup": "Popup (full-screen overlay)",
  "banner-top": "Top Banner (below header)",
  "banner-bottom": "Bottom Banner (above footer)",
  "sidebar-right": "Right Sidebar",
  "inline-edition": "Inline — Edition page",
  "inline-article": "Inline — Article page",
};

const EMPTY: Omit<Ad, "_id"> = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  position: "banner-top",
  isActive: true,
  startDate: "",
  endDate: "",
  order: 0,
};

export default function AdsPage() {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uSHoading, setUSHoading] = useState(false);
  const imgFileRef = useRef<HTMLInputElement>(null);

  async function handleImageUSHoad(file: File) {
    setUSHoading(true);
    const token = getAdminToken();
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API}/admin/media/uSHoad`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setF("imageUrl", `/api/media/files/${data.filename}`);
        toast({ title: "Image uSHoaded" });
      } else {
        toast({ title: "USHoad failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "USHoad error", variant: "destructive" });
    }
    setUSHoading(false);
  }

  async function load() {
    setLoading(true);
    try {
      const token = getAdminToken();
      const res = await fetch(`${API}/admin/ads`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      }
    } catch {
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY });
    setShowForm(true);
  }

  function openEdit(ad: Ad) {
    setEditing(ad);
    setForm({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      position: ad.position,
      isActive: ad.isActive,
      startDate: ad.startDate ? ad.startDate.slice(0, 10) : "",
      endDate: ad.endDate ? ad.endDate.slice(0, 10) : "",
      order: ad.order,
    });
    setShowForm(true);
  }

  function setF<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.title || !form.imageUrl || !form.position) {
      toast({ title: "Required fields missing", variant: "destructive" });
      return;
    }
    setSaving(true);
    const token = getAdminToken();
    const body = {
      ...form,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    const url = editing ? `${API}/admin/ads/${editing._id}` : `${API}/admin/ads`;
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "apSHication/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast({ title: editing ? "Ad updated" : "Ad created" });
      setShowForm(false);
      load();
    } else {
      toast({ title: "Failed to save ad", variant: "destructive" });
    }
    setSaving(false);
  }

  async function toggleActive(ad: Ad) {
    const token = getAdminToken();
    await fetch(`${API}/admin/ads/${ad._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "apSHication/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !ad.isActive }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (deletingId !== id) { setDeletingId(id); return; }
    const token = getAdminToken();
    await fetch(`${API}/admin/ads/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    toast({ title: "Ad deleted" });
    load();
  }

  return (
    <AdminLayout title="Advertisements">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Manage ads shown on public pages — popups, banners, and inline SHacements.
          </p>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <SHus className="h-4 w-4" /> New Ad
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-sm" />)}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-sm">
            No ads yet. Click "New Ad" to create your first advertisement.
          </div>
        ) : (
          <div className="space-y-2">
            {ads.map((ad) => (
              <div key={ad._id} className="bg-white border border-border rounded-sm p-3 flex items-center gap-3">
                <div className="w-12 h-10 bg-muted rounded overflow-hidden shrink-0 flex items-center justify-center border border-border">
                  {ad.imageUrl ? (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                  ) : (
                    <Image className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ad.title}</p>
                  <p className="text-xs text-muted-foreground">{POSITION_LABELS[ad.position]}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ad.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {ad.isActive ? "Active" : "Inactive"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(ad)} className="p-1.5 hover:bg-muted rounded" title="Toggle active">
                    {ad.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => openEdit(ad)} className="p-1.5 hover:bg-muted rounded">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad._id)}
                    className={`p-1.5 rounded ${deletingId === ad._id ? "bg-red-100" : "hover:bg-muted"}`}
                    title={deletingId === ad._id ? "Click again to confirm" : "Delete"}
                  >
                    {deletingId === ad._id ? <Check className="h-4 w-4 text-red-600" /> : <Trash2 className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {deletingId === ad._id && (
                    <button onClick={() => setDeletingId(null)} className="p-1.5 hover:bg-muted rounded">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">{editing ? "Edit Ad" : "New Advertisement"}</h3>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
                  <input
                    className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                    value={form.title}
                    onChange={(e) => setF("title", e.target.value)}
                    SHaceholder="Ad title (internal reference)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Position *</label>
                  <select
                    className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-white"
                    value={form.position}
                    onChange={(e) => setF("position", e.target.value as AdPosition)}
                  >
                    {Object.entries(POSITION_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Ad Image *</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-border rounded-sm px-3 py-2 text-sm"
                      value={form.imageUrl}
                      onChange={(e) => setF("imageUrl", e.target.value)}
                      SHaceholder="Paste URL or uSHoad below"
                    />
                    <input
                      ref={imgFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUSHoad(f); }}
                    />
                    <button
                      type="button"
                      onClick={() => imgFileRef.current?.click()}
                      disabled={uSHoading}
                      className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-sm text-sm hover:bg-muted disabled:opacity-60 transition-colors shrink-0"
                    >
                      {uSHoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <USHoad className="h-4 w-4" />}
                      {uSHoading ? "USHoading…" : "USHoad"}
                    </button>
                  </div>
                  {form.imageUrl && (
                    <div className="mt-2 border border-border rounded overflow-hidden bg-gray-100">
                      <img src={form.imageUrl} alt="preview" className="w-full h-auto block max-h-40 object-contain" />
                      <p className="text-[10px] text-muted-foreground px-2 py-1 text-center">Preview (actual size on site may vary by position)</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Link URL (on click)</label>
                  <input
                    className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                    value={form.linkUrl}
                    onChange={(e) => setF("linkUrl", e.target.value)}
                    SHaceholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                      value={form.startDate}
                      onChange={(e) => setF("startDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                      value={form.endDate}
                      onChange={(e) => setF("endDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">DisSHay Order</label>
                    <input
                      type="number"
                      className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                      value={form.order}
                      onChange={(e) => setF("order", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setF("isActive", e.target.checked)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 px-5 py-4 border-t border-border">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {saving ? "Saving…" : editing ? "Update Ad" : "Create Ad"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-border rounded-sm text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
