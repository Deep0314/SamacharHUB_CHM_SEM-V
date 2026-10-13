import { Link } from "wouter";
import { useLang } from "@/lib/lang";
import { formatDate, truncate } from "@/lib/utils";
import { Article } from "@samacharhub/api-client-react";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "hero" | "compact" | "horizontal";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const { lang, t } = useLang();

  const title = t(article.title, article.titleMr, (article as any).titleHi);
  const summary = t(article.summary, article.summaryMr, (article as any).summaryHi);
  const catName = t(article.category?.name, article.category?.nameMr, (article.category as any)?.nameHi);
  const date = formatDate(article.publishedAt ?? article.createdAt);

  if (variant === "hero") {
    return (
      <Link href={`/article/${article.slug}`}>
        <div
          className="relative cursor-pointer group overflow-hidden rounded-sm h-96 md:h-[480px]"
          data-testid={`article-hero-${article._id}`}
        >
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {article.category && (
              <span
                className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white mb-2"
                style={{ backgroundColor: article.category.color }}
              >
                {catName}
              </span>
            )}
            <h2 className="text-white font-serif text-2xl md:text-3xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
              {title}
            </h2>
            <p className="text-white/75 text-sm line-clamp-2">{summary}</p>
            <p className="text-white/50 text-xs mt-2">
              {article.author} &bull; {date}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.slug}`}>
        <div
          className="flex gap-3 py-3 border-b border-border last:border-0 group cursor-pointer"
          data-testid={`article-compact-${article._id}`}
        >
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={title}
              className="w-20 h-14 object-cover rounded-sm shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            {article.category && (
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: article.category.color }}
              >
                {catName}
              </span>
            )}
            <h3 className="font-serif text-sm font-semibold leading-snug mt-0.5 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{date}</p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`}>
        <div
          className="flex gap-4 group cursor-pointer"
          data-testid={`article-horizontal-${article._id}`}
        >
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={title}
              className="w-32 h-24 object-cover rounded-sm shrink-0"
            />
          )}
          <div className="flex-1">
            {article.category && (
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: article.category.color }}
              >
                {catName}
              </span>
            )}
            <h3 className="font-serif font-semibold leading-snug mt-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{summary}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {article.author} &bull; {date}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`}>
      <div
        className="group cursor-pointer"
        data-testid={`article-card-${article._id}`}
      >
        {article.imageUrl && (
          <div className="overflow-hidden rounded-sm mb-3">
            <img
              src={article.imageUrl}
              alt={title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        {article.category && (
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: article.category.color }}
          >
            {catName}
          </span>
        )}
        <h3 className="font-serif font-semibold text-base leading-snug mt-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{summary}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {article.author} &bull; {date}
        </p>
      </div>
    </Link>
  );
}
