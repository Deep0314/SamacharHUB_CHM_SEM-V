import { useParams, useLocation } from "wouter";
import { useGetArticleBySlug, getGetArticleBySlugQueryKey, useGetLatestArticles } from "@samacharhub/api-client-react";
import { useLang } from "@/lib/lang";
import { formatDate } from "@/lib/utils";
import { ArticleCard } from "@/components/ArticleCard";
import { SEO } from "@/components/SEO";
import { AdBanner } from "@/components/AdBanner";
import { Eye, Calendar, User } from "lucide-react";

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { lang, t } = useLang();
  const [, setLocation] = useLocation();

  const { data: article, isLoading, isError } = useGetArticleBySlug(slug, {
    query: { queryKey: getGetArticleBySlugQueryKey(slug) },
  });

  const { data: related } = useGetLatestArticles({ lang, limit: 4 });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-64 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold mb-4">
          {lang === "mr" ? "लेख सापडला नाही" : "Article not found"}
        </h2>
        <button
          onClick={() => setLocation("/")}
          className="text-primary hover:underline"
        >
          {lang === "mr" ? "मुख्यपृष्ठावर परत जा" : "Return to homepage"}
        </button>
      </div>
    );
  }

  const title = t(article.title, article.titleMr);
  const summary = t(article.summary, article.summaryMr);
  const content = t(article.content, article.contentMr);
  const catName = t(article.category?.name, article.category?.nameMr);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SEO 
        title={title}
        description={summary}
        image={article.imageUrl || undefined}
        url={window.location.href}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Article */}
        <article className="md:col-span-2" data-testid="article-content">
          {article.category && (
            <span
              className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white mb-3"
              style={{ backgroundColor: article.category.color }}
            >
              {catName}
            </span>
          )}

          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4">
            {title}
          </h1>

          <p className="text-lg text-muted-foreground mb-4 border-l-4 border-primary pl-4">
            {summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(article.publishedAt ?? article.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {article.viewCount.toLocaleString()} {lang === "mr" ? "वाचन" : "views"}
            </span>
          </div>

          {article.imageUrl && (
            <div className="mb-6 rounded-sm overflow-hidden">
              <img
                src={article.imageUrl}
                alt={title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-slate max-w-none prose-headings:font-serif prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <div className="mt-6">
            <AdBanner position="inline-article" />
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside data-testid="article-sidebar">
          <div className="sticky top-4">
            <div className="mb-4">
              <AdBanner position="sidebar-right" />
            </div>
            <h3 className="font-serif font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary inline-block" />
              {lang === "mr" ? "अधिक बातम्या" : "More News"}
            </h3>
            <div className="divide-y divide-border">
              {related
                ?.filter((a) => a._id !== article._id)
                .slice(0, 6)
                .map((a) => (
                  <ArticleCard key={a._id} article={a} variant="compact" />
                ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
