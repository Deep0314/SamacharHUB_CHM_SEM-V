import { useParams } from "wouter";
import { useState } from "react";
import { useListArticles, getListArticlesQueryKey } from "@samacharhub/api-client-react";
import { useLang } from "@/lib/lang";
import { ArticleCard } from "@/components/ArticleCard";

const CATEGORY_NAMES: Record<string, { en: string; mr: string; hi: string }> = {
  politics: { en: "Politics", mr: "राजकारण", hi: "राजनीति" },
  sports: { en: "Sports", mr: "क्रीडा", hi: "खेल" },
  business: { en: "Business", mr: "व्यापार", hi: "व्यापार" },
  entertainment: { en: "Entertainment", mr: "मनोरंजन", hi: "मनोरंजन" },
  technology: { en: "Technology", mr: "तंत्रज्ञान", hi: "तकनीक" },
  health: { en: "Health", mr: "आरोग्य", hi: "स्वास्थ्य" },
  education: { en: "Education", mr: "शिक्षण", hi: "शिक्षा" },
  vidarbha: { en: "Vidarbha", mr: "विदर्भ", hi: "विदर्भ" },
};

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { lang, t } = useLang();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListArticles(
    { category: slug, lang, page, limit: 12 },
    { query: { queryKey: getListArticlesQueryKey({ category: slug, lang, page, limit: 12 }) } }
  );

  const catInfo = CATEGORY_NAMES[slug] ?? { en: slug, mr: slug, hi: slug };
  const title = t(catInfo.en, catInfo.mr, catInfo.hi);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" data-testid="category-page">
      <div className="border-b-2 border-primary mb-6 pb-2">
        <h1 className="font-serif text-3xl font-bold">{title}</h1>
        {data && (
          <p className="text-sm text-muted-foreground mt-1">
            {data.total} {t("articles", "बातम्या", "लेख")}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-muted animate-pulse rounded-sm" />
          ))}
        </div>
      ) : data?.articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">
            {t("No articles found", "कोणत्याही बातम्या सापडल्या नाहीत", "कोई लेख नहीं मिला")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data?.articles.map((a) => (
              <ArticleCard key={a._id} article={a} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8" data-testid="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-border rounded-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                {t("Previous", "मागे", "पिछला")}
              </button>
              <span className="px-4 py-2 text-sm">
                {lang === "mr"
                  ? `${page} / ${data.totalPages}`
                  : lang === "hi"
                  ? `पृष्ठ ${page} / ${data.totalPages}`
                  : `Page ${page} of ${data.totalPages}`}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 text-sm border border-border rounded-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                {t("Next", "पुढे", "अगला")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
