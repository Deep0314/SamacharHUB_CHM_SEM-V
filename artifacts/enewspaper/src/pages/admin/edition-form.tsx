import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import {
  useGetEdition,
  useCreateEdition,
  useUpdateEdition,
  useUploadMedia,
  getListEditionsQueryKey,
} from "@samacharhub/api-client-react";
import type { ArticleHotspot } from "@samacharhub/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Loader2, FileText, Image, Info } from "lucide-react";
import { HotspotEditor } from "@/components/HotspotEditor";
import * as pdfjsLib from "pdfjs-dist";
import { fetchHotspotUIConfig, DEFAULT_CITIES, type CityEntry } from "@/lib/hotspot-ui-config";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result will already be in "data:image/jpeg;base64,..." format
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractPdfPages(
  file: File,
  maxPages?: number
): Promise<Array<{ base64: string; name: string }>> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const numPages = maxPages != null ? Math.min(maxPages, pdf.numPages) : pdf.numPages;
  const results: Array<{ base64: string; name: string }> = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx as any, viewport, canvas }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    results.push({
      base64: dataUrl.split(",")[1],
      name: file.name.replace(/\.pdf$/i, "") + `-page${i}.jpg`,
    });
  }

  return results;
}

export default function EditionFormPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isEditing = !!id;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: existing } = useGetEdition(id ?? "");

  const [cities, setCities] = useState<CityEntry[]>(DEFAULT_CITIES);
  const [selectedCities, setSelectedCities] = useState<string[]>(["Amravati"]);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [published, setPublished] = useState(true);
  const [allPages, setAllPages] = useState<string[]>([]);
  const [articleHotspots, setArticleHotspots] = useState<ArticleHotspot[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hotspotPopupHeader, setHotspotPopupHeader] = useState<string>("");
  const [uploadingHeader, setUploadingHeader] = useState(false);

  useEffect(() => {
    fetchHotspotUIConfig().then((cfg) => {
      if (cfg.editionCities && cfg.editionCities.length > 0) {
        setCities(cfg.editionCities);
      }
    });
  }, []);

  useEffect(() => {
    if (existing) {
      if (existing.cities?.length) {
        setSelectedCities(existing.cities);
      } else if ((existing as any).city) {
        setSelectedCities([(existing as any).city]);
      }
      setDate(existing.date.split("T")[0]);
      setPublished(existing.published);
      const combined = [existing.coverUrl, ...(existing.pages ?? [])].filter(Boolean);
      setAllPages([...new Set(combined)]);
      setArticleHotspots(existing.articleHotspots ?? []);
      setHotspotPopupHeader(existing.hotspotPopupHeader ?? "");
    }
  }, [existing]);

  const uploadMutation = useUploadMedia({});

  async function uploadBase64(name: string, base64Data: string): Promise<string> {
    const result = await uploadMutation.mutateAsync({
      data: { filename: name, mimeType: "image/jpeg", base64Data, altText: name.replace(/\.jpg$/i, "") },
    });
    return result.url;
  }

  async function uploadFile(file: File): Promise<string> {
    const base64Data = await fileToBase64(file);
    const result = await uploadMutation.mutateAsync({
      data: { filename: file.name, mimeType: file.type || "image/jpeg", base64Data, altText: file.name.replace(/\.[^.]+$/, "") },
    });
    return result.url;
  }

  const createMutation = useCreateEdition({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEditionsQueryKey() });
        toast({ title: "Edition created!" });
        navigate("/admin/editions");
      },
    },
  });

  const updateMutation = useUpdateEdition({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEditionsQueryKey() });
        toast({ title: "Edition updated!" });
        navigate("/admin/editions");
      },
    },
  });

  function toggleCitySelection(en: string) {
    setSelectedCities((prev) =>
      prev.includes(en) ? prev.filter((c) => c !== en) : [...prev, en]
    );
  }

  function toggleAllCities() {
    if (selectedCities.length === cities.length) {
      setSelectedCities([cities[0].en]);
    } else {
      setSelectedCities(cities.map((c) => c.en));
    }
  }

  async function handlePagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        if (file.type === "application/pdf") {
          toast({ title: `Extracting pages from ${file.name}…` });
          const pdfPages = await extractPdfPages(file);
          for (const p of pdfPages) {
            const url = await uploadBase64(p.name, p.base64);
            urls.push(url);
          }
        } else {
          const url = await uploadFile(file);
          urls.push(url);
        }
      }
      setAllPages((prev) => [...prev, ...urls]);
      toast({ title: `${urls.length} page(s) uploaded!` });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  }

  function removePage(idx: number) {
    setAllPages((prev) => prev.filter((_, i) => i !== idx));
    setArticleHotspots((prev) =>
      prev
        .filter((h) => h.pageIndex !== idx)
        .map((h) => (h.pageIndex > idx ? { ...h, pageIndex: h.pageIndex - 1 } : h))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (allPages.length === 0) {
      toast({ title: "Please upload at least one page", variant: "destructive" });
      return;
    }
    const coverUrl = allPages[0];
    const pages = allPages.slice(1);

    if (selectedCities.length === 0) {
      toast({ title: "Please select at least one city", variant: "destructive" });
      return;
    }

    const payloadCities: string[] = [];
    const payloadCitiesMr: string[] = [];
    const payloadCitiesHi: string[] = [];
    for (const cityEn of selectedCities) {
      const c = cities.find((x) => x.en === cityEn);
      if (c) {
        payloadCities.push(c.en);
        payloadCitiesMr.push(c.mr);
        payloadCitiesHi.push(c.hi || c.mr);
      }
    }

    const payload = {
      cities: payloadCities,
      citiesMr: payloadCitiesMr,
      citiesHi: payloadCitiesHi,
      date,
      coverUrl,
      pages,
      published,
      articleHotspots,
      hotspotPopupHeader: hotspotPopupHeader || null,
    };

    if (isEditing) {
      updateMutation.mutate({ id: id!, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  }

  async function handleHeaderUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeader(true);
    try {
      const url = await uploadFile(file);
      setHotspotPopupHeader(url);
      toast({ title: "Header image uploaded!" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingHeader(false);
    }
    e.target.value = "";
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminGuard>
      <AdminLayout title={isEditing ? "Edit Edition" : "New Edition"}>
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">

          {/* Edition Details */}
          <div className="bg-white border border-border rounded-sm p-5 space-y-4">
            <h3 className="font-semibold text-sm">Edition Details</h3>

            {/* Past date tip */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-sm px-3 py-2 text-xs text-blue-700">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>You can select <strong>any date</strong> including past dates to upload historical editions. Past editions are accessible via "Browse by Date" on the homepage.</span>
            </div>

            <div className="space-y-4">
              {/* City/Edition selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Cities / Editions
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      {selectedCities.length === 0
                        ? "None selected"
                        : `${selectedCities.length} selected`}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllCities}
                    className="text-xs text-primary hover:underline"
                  >
                    {selectedCities.length === cities.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {cities.map((c) => {
                    const checked = selectedCities.includes(c.en);
                    return (
                      <label
                        key={c.en}
                        className={`flex items-center gap-2 px-3 py-2 rounded-sm border cursor-pointer transition-colors text-sm ${
                          checked
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border hover:border-primary/50 hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCitySelection(c.en)}
                          className="h-3.5 w-3.5 accent-primary shrink-0"
                        />
                        <span className="truncate">{c.en}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Past dates are allowed</p>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="published"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <label htmlFor="published" className="text-sm">Publish immediately</label>
                </div>
              </div>
            </div>
          </div>

          {/* Pages */}
          <div className="bg-white border border-border rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Pages</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  First page is automatically used as the cover. Upload images or PDFs.
                </p>
              </div>
              <label className="flex items-center gap-1.5 text-sm text-primary cursor-pointer hover:underline">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Pages
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handlePagesUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-sm text-primary py-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading at high quality…
              </div>
            )}

            {allPages.length === 0 ? (
              <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors">
                <div className="flex gap-2 mb-2">
                  <Image className="h-6 w-6 text-muted-foreground" />
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Upload newspaper pages</span>
                <span className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP or PDF · First page becomes the cover</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handlePagesUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {allPages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={idx === 0 ? "Cover" : `Page ${idx + 1}`}
                      className="w-full object-cover rounded border border-border"
                      style={{ aspectRatio: "3/4" }}
                    />
                    <div className={`absolute top-1 left-1 text-white text-xs px-1 rounded ${idx === 0 ? "bg-primary" : "bg-black/60"}`}>
                      {idx === 0 ? "Cover" : `p.${idx + 1}`}
                    </div>
                    {articleHotspots.filter((h) => h.pageIndex === idx).length > 0 && (
                      <div className="absolute top-1 right-6 bg-yellow-500 text-white text-xs px-1 rounded">●</div>
                    )}
                    <button
                      type="button"
                      onClick={() => removePage(idx)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Article Hotspot Editor */}
          {allPages.length > 0 && (
            <div className="bg-white border border-border rounded-sm p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-sm">Article Hotspots</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Draw regions on pages and link them to articles. Readers can click to read more.
                </p>
              </div>

              {/* Popup Header Image */}
              <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Popup Header Image (Masthead)
                </label>
                <p className="text-xs text-muted-foreground">
                  This image appears at the top of every hotspot popup for this edition. Upload the newspaper masthead logo.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {hotspotPopupHeader && (
                    <div className="relative">
                      <img
                        src={hotspotPopupHeader}
                        alt="Popup header"
                        className="h-16 object-contain border border-border rounded bg-white px-2"
                      />
                      <button
                        type="button"
                        onClick={() => setHotspotPopupHeader("")}
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-1.5 text-sm text-primary cursor-pointer hover:underline">
                    {uploadingHeader ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                    {hotspotPopupHeader ? "Change Image" : "Upload Masthead Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeaderUpload}
                      disabled={uploadingHeader}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">or paste URL:</span>
                  <input
                    type="text"
                    value={hotspotPopupHeader}
                    onChange={(e) => setHotspotPopupHeader(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-2 py-1 text-xs border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <HotspotEditor
                pages={allPages}
                hotspots={articleHotspots}
                onChange={setArticleHotspots}
              />
              {articleHotspots.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {articleHotspots.length} hotspot{articleHotspots.length > 1 ? "s" : ""} across{" "}
                  {new Set(articleHotspots.map((h) => h.pageIndex)).size} page(s)
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving || uploading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Update Edition" : "Create Edition"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/editions")}
              className="px-6 py-2 border border-border rounded-sm text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminLayout>
    </AdminGuard>
  );
}
