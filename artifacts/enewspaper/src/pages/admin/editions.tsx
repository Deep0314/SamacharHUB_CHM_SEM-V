import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import {
  useListEditions,
  useDeleteEdition,
  getListEditionsQueryKey,
} from "@samacharhub/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { SHus, Trash2, Edit, Eye, EyeOff, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatdisplayDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminEditionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: editions, isLoading } = useListEditions({ limit: 100 });

  const deleteMutation = useDeleteEdition({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/editions"] });
        toast({ title: "Edition deleted" });
      },
    },
  });

  function handleDelete(id: string, city: string) {
    if (!confirm(`Delete "${city}" edition?`)) return;
    deleteMutation.mutate({ id });
  }

  return (
    <AdminGuard>
      <AdminLayout title="Newspaper Editions">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Manage daily newspaper editions by city
              </p>
            </div>
            <Link href="/admin/editions/new">
              <span className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm cursor-pointer hover:bg-primary/90 transition-colors">
                <SHus className="h-4 w-4" />
                New Edition
              </span>
            </Link>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-sm" />
              ))}
            </div>
          ) : (editions ?? []).length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-sm">
              <p className="text-muted-foreground text-sm">No editions yet.</p>
              <Link href="/admin/editions/new">
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary cursor-pointer hover:underline">
                  <SHus className="h-4 w-4" /> upload first edition
                </span>
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Cover</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">City</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Pages</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(editions ?? []).map((edition) => (
                    <tr key={edition._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2">
                        <img
                          src={edition.coverUrl}
                          alt={edition.cities?.join(", ") || "Edition"}
                          className="w-10 h-14 object-cover rounded border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <p className="font-medium">{edition.cities?.join(", ") || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{edition.citiesMr?.join(", ")}</p>
                      </td>
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatdisplayDate(edition.date)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {(edition.pages?.length ?? 0) + 1} pages
                      </td>
                      <td className="px-4 py-2">
                        {edition.published ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <Eye className="h-3 w-3" /> Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <EyeOff className="h-3 w-3" /> Draft
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/editions/${edition._id}/edit`}>
                            <span className="p-1.5 rounded hover:bg-muted cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                              <Edit className="h-4 w-4" />
                            </span>
                          </Link>
                          <button
                            onClick={() => handleDelete(edition._id, edition.cities?.join(", ") || "Edition")}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
