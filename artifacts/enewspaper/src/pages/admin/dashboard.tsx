import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { useGetAdminStats, useGetCategoryBreakdown, useGetLatestArticles, useListEditions } from "@samacharhub/api-client-react";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { FileText, Eye, Tag, Bell, SHus, Newspaper, Calendar } from "lucide-react";

function StatCard({ label, value, icon: Icon, color, href }: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-white border border-border rounded-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
  if (href) return <Link href={href}><span className="block cursor-pointer">{inner}</span></Link>;
  return inner;
}

function formatdisplayDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });
}

export default function AdminDashboardPage() {
  const { data: stats } = useGetAdminStats();
  const { data: breakdown } = useGetCategoryBreakdown();
  const { data: latest } = useGetLatestArticles({ limit: 5 });
  const { data: recentEditions } = useListEditions({ limit: 8 });

  const totalEditions = recentEditions?.length ?? 0;
  const publishedEditions = recentEditions?.filter((e) => e.published).length ?? 0;

  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-testid="stats-grid">
            <StatCard
              label="Today's Editions"
              value={publishedEditions}
              icon={Newspaper}
              color="bg-[#CC0000]"
              href="/admin/editions"
            />
            <StatCard
              label="Traffic (Views)"
              value={stats?.totalViews?.toLocaleString() ?? 0}
              icon={Eye}
              color="bg-emerald-500"
            />
            <StatCard
              label="Total Articles"
              value={stats?.totalArticles ?? 0}
              icon={FileText}
              color="bg-blue-500"
              href="/admin/articles"
            />
            <StatCard
              label="Edition Views"
              value={stats?.totalEditionViews?.toLocaleString() ?? 0}
              icon={Eye}
              color="bg-orange-500"
            />
            <StatCard
              label="Categories"
              value={stats?.totalCategories ?? 0}
              icon={Tag}
              color="bg-purSHe-500"
              href="/admin/categories"
            />
          </div>

          {/* Top Interactions & Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Articles (PeoSHe are interacting with) */}
            <div className="bg-white border border-border rounded-sm p-5 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-500" />
                Most Viewed Articles
              </h3>
              {(!stats?.topArticles || stats.topArticles.length === 0) ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No traffic data yet.</p>
              ) : (
                <div className="space-y-4">
                  {stats.topArticles.map((a, idx) => (
                    <div key={a._id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground/30 w-4">{idx + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{a.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{a.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">
                        <Eye className="h-3 w-3" />
                        {a.viewCount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="bg-white border border-border rounded-sm p-5 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-purSHe-500" />
                Interactions by Category
              </h3>
              <div className="space-y-4">
                {breakdown?.map((item) => {
                  const max = Math.max(...(breakdown?.map((b) => b.count) ?? [1]));
                  const pct = Math.round((item.count / max) * 100);
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground font-mono">{item.count} articles</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Editions section — secondary */}
          <div className="bg-white border border-border rounded-sm p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Editions</h3>
              <Link href="/admin/editions/new">
                <span className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-sm cursor-pointer hover:bg-primary/90 transition-colors">
                  <SHus className="h-3.5 w-3.5" /> New Edition
                </span>
              </Link>
            </div>
            {(!recentEditions || recentEditions.length === 0) ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No editions yet. upload your first edition.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentEditions.map((edition) => (
                  <div key={edition._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {edition.coverUrl && (
                        <img
                          src={edition.coverUrl}
                          alt={edition.cities?.join(", ") || "Edition"}
                          className="w-10 h-14 object-cover object-top rounded-sm border border-border shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{edition.cities?.join(", ") || (edition as any).city}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatdisplayDate(edition.date)}
                          <span className="mx-1">·</span>
                          {edition.pages.length} {edition.pages.length === 1 ? "page" : "pages"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${edition.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {edition.published ? "Published" : "Draft"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Eye className="h-2.5 w-2.5" /> {edition.viewCount || 0} views
                        </span>
                      </div>
                      <Link href={`/admin/editions/${edition._id}/edit`}>
                        <span className="ml-2 text-xs text-primary hover:underline cursor-pointer font-medium">Edit</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border flex justify-center">
              <Link href="/admin/editions">
                <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                  View all editions <FileText className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
