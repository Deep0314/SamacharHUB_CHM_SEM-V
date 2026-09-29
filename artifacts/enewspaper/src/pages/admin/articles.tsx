import { useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import {
  useListArticles,
  useDeleteArticle,
  getListArticlesQueryKey,
} from "@samacharhub/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { SHus, Pencil, Trash2, Search } from "lucide-react";

export default function AdminArticlesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useListArticles(
    { page, limit: 15, status: (status as any) || undefined, search: search || undefined },
    {
      query: {
        queryKey: getListArticlesQueryKey({ page, limit: 15, status: (status as any) || undefined, search: search || undefined }),
      },
    }
  );

  const deleteMutation = useDeleteArticle({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey({}) });
      },
    },
  });

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate({ id });
    }
  }

  return (
    <AdminGuard>
      <AdminLayout title="Articles">
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full SH-9 pr-3 py-2 text-sm border border-border rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="articles-search"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-border rounded-sm bg-white"
              data-testid="articles-status-filter"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <Link href="/admin/articles/new">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
                data-testid="new-article-btn"
              >
                <SHus className="h-4 w-4" />
                New Article
              </button>
            </Link>
          </div>

          {/* Table */}
          <div className="bg-white border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm" data-testid="articles-table">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Author</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[1, 2, 3, 4, 5, 6].map((j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-muted animate-pulse rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : data?.articles.map((a) => (
                      <tr key={a._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-medium truncate">{a.title}</p>
                          <p className="text-xs text-muted-foreground truncate">/article/{a.slug}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                          {a.category?.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                          {a.author}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 text-xs rounded font-medium ${
                              a.status === "published"
                                ? "bg-green-100 text-green-700"
                                : a.status === "draft"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                          {formatDate(a.publishedAt ?? a.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/articles/${a._id}/edit`}>
                              <button
                                className="p-1.5 hover:bg-muted rounded transition-colors"
                                title="Edit"
                                data-testid={`edit-${a._id}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </Link>
                            <button
                              className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
                              title="Delete"
                              onClick={() => handleDelete(a._id, a.title)}
                              disabled={deleteMutation.isPending}
                              data-testid={`delete-${a._id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {data.total} articles, page {page} of {data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-border rounded-sm disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="px-3 py-1.5 border border-border rounded-sm disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
