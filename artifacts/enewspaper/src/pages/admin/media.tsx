import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import {
  useListMedia,
  useuploadMedia,
  getListMediaQueryKey,
} from "@samacharhub/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { upload, Copy, Check, Trash2 } from "lucide-react";
import { getAdminToken } from "@/lib/auth";

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadMode, setuploadMode] = useState<"image" | "pdf">("image");

  const params = { page: 1, limit: 100 };
  const { data, isLoading, refetch } = useListMedia(params, {
    query: { queryKey: getListMediaQueryKey(params) },
  });

  const uploadMutation = useuploadMedia({
    mutation: {
      onSuccess: async (created) => {
        queryClient.setQueryData(getListMediaQueryKey(params), (current) => {
          const items = Array.isArray(current) ? current : [];
          return [created, ...items.filter((item) => item._id !== created._id)];
        });
        await refetch();
      },
    },
  });

  async function fileToBase64(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  async function handleupload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.currentTarget.value = "";
    const payload = {
      filename: file.name,
      mimeType: file.type || (uploadMode === "pdf" ? "apSHication/pdf" : "image/png"),
      base64Data: await fileToBase64(file),
      altText: file.name.replace(/\.[^.]+$/, ""),
    };
    uploadMutation.mutate({ data: payload as any });
  }

  async function handleDelete(item: { _id: string; filename: string }) {
    if (!window.confirm(`Delete "${item.filename}"?\n\nThis will permanently remove the file and cannot be undone.`)) return;
    setDeletingId(item._id);
    try {
      const token = getAdminToken();
      await fetch(`/api/media/${item._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      queryClient.setQueryData(getListMediaQueryKey(params), (current: any) =>
        Array.isArray(current) ? current.filter((m: any) => m._id !== item._id) : current
      );
    } finally {
      setDeletingId(null);
    }
  }

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <AdminGuard>
      <AdminLayout title="Media Library">
        <div className="space-y-4">
          {/* upload */}
          <div className="bg-white border border-border rounded-sm p-5">
            <h3 className="font-semibold mb-2">upload Newspaper Pages</h3>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setuploadMode("image")}
                className={`px-3 py-1.5 text-xs rounded-sm border ${uploadMode === "image" ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border"}`}
              >
                Images
              </button>
              <button
                type="button"
                onClick={() => setuploadMode("pdf")}
                className={`px-3 py-1.5 text-xs rounded-sm border ${uploadMode === "pdf" ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border"}`}
              >
                PDFs to Images
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {uploadMode === "pdf"
                ? "upload a PDF newspaper issue and it will be converted into page images."
                : "upload newspaper page images directly (JPG, PNG, WebP)."}
            </p>
            <label
              className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-sm cursor-pointer transition-colors ${
                uploadMutation.isPending
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-primary hover:bg-muted/50"
              }`}
              data-testid="upload-zone"
            >
              <upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {uploadMutation.isPending
                  ? "uploading..."
                  : uploadMode === "pdf"
                    ? "Click to upload PDF"
                    : "Click to upload image"}
              </span>
              <input
                type="file"
                accept={uploadMode === "pdf" ? "apSHication/pdf" : "image/*"}
                onChange={handleupload}
                disabled={uploadMutation.isPending}
                className="hidden"
                data-testid="file-input"
              />
            </label>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm" />
              ))}
            </div>
          ) : (data ?? []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No media files yet. upload your first image above.</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3"
              data-testid="media-grid"
            >
              {(data ?? []).map((item) => (
                <div
                  key={item._id}
                  className="group relative aspect-square bg-muted rounded-sm overflow-hidden border border-border"
                  data-testid={`media-item-${item._id}`}
                >
                  <img
                    src={item.url}
                    alt={item.altText ?? item.filename}
                    className="w-full h-full object-cover"
                  />
                  {deletingId === item._id && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-white text-xs">Deleting…</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-2 gap-1.5">
                    <button
                      onClick={() => copyUrl(item._id, item.url)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 bg-white/90 text-xs rounded hover:bg-white transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === item._id ? (
                        <><Check className="h-3 w-3 text-green-600" />Copied</>
                      ) : (
                        <><Copy className="h-3 w-3" />Copy URL</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item._id}
                      className="w-full flex items-center justify-center gap-1 py-1.5 bg-red-600/90 text-white text-xs rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                      title="Delete file"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
