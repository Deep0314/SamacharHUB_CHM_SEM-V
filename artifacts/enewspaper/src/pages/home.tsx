import { useListEditions, useGetLatestArticles } from "@samacharhub/api-client-react";
import { useLang } from "@/lib/lang";
import { Link, useLocation } from "wouter";
import { Calendar, ArrowRight, CalendarDays, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { fetchHotspotUIConfig, DEFAULT_CITIES, type CityEntry, type HotspotUIConfig, DEFAULT_CONFIG } from "@/lib/hotspot-ui-config";
import { useSearch } from "wouter";

function formatDisplayDate(dateStr: string, lang: string) {
  const locale = lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN";
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });
}

function toDateKey(date: Date) {
  // Use Intl.DateTimeFormat to get components in IST
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  
  const y = parts.find(p => p.type === 'year')?.value;
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;
  
  return `${y}-${m}-${d}`;
}

const NO_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23f3f4f6' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d1d5db' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

function EditionCard({ edition, lang, overrideCityEn, overrideCityMr, overrideCityHi }: { edition: any; lang: string; overrideCityEn?: string; overrideCityMr?: string; overrideCityHi?: string }) {
  const cityName =
    lang === "mr"
      ? (overrideCityMr || edition.citiesMr?.[0] || edition.cityMr || edition.cities?.[0] || edition.city)
      : lang === "hi"
      ? (overrideCityHi || edition.citiesHi?.[0] || edition.cityHi || overrideCityMr || edition.citiesMr?.[0] || edition.cityMr || edition.cities?.[0] || edition.city)
      : (overrideCityEn || edition.cities?.[0] || edition.city);

  return (
    <Link href={`/edition/${edition._id}`}>
      <div className="group cursor-pointer bg-white border border-border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div
          className="text-center py-2 font-bold text-sm text-white"
          style={{ backgroundColor: "#CC0000" }}
        >
          {cityName}
        </div>
        <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "3/4" }}>
          <img
            src={edition.coverUrl}
            alt={cityName}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = NO_IMG; }}
          />
          {edition.pages.length > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
              {edition.pages.length} {lang === "mr" ? "पाने" : lang === "hi" ? "पृष्ठ" : "pages"}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-gray-50">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDisplayDate(edition.date, lang)}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article, lang }: { article: any; lang: string }) {
  const title =
    lang === "hi"
      ? (article.titleHi || article.titleMr || article.title)
      : lang === "mr" && article.titleMr
      ? article.titleMr
      : article.title;
  const summary =
    lang === "hi"
      ? (article.summaryHi || article.summaryMr || article.summary)
      : lang === "mr" && article.summaryMr
      ? article.summaryMr
      : article.summary;
  return (
    <Link href={`/article/${article.slug}`}>
      <div className="group cursor-pointer bg-white border border-border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "3/4" }}>
          <img
            src={article.imageUrl}
            alt={title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = NO_IMG; }}
          />
        </div>
        <div className="px-3 py-2 border-t border-border bg-gray-50">
          <div className="text-sm font-semibold leading-snug line-clamp-2">{title}</div>
          {summary && <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{summary}</div>}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { lang, t } = useLang();
  const [, navigate] = useLocation();
  const { data: allEditions, isLoading } = useListEditions({ limit: 200 });
  const { data: latestArticles } = useGetLatestArticles({ lang, limit: 8 });
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [showEditionsStrip, setShowEditionsStrip] = useState(true);
  const [cities, setCities] = useState<CityEntry[]>(DEFAULT_CITIES);
  const [config, setConfig] = useState<HotspotUIConfig>(DEFAULT_CONFIG);
  const search = useSearch();

  useEffect(() => {
    fetchHotspotUIConfig().then((cfg) => {
      setConfig(cfg);
      setShowEditionsStrip(cfg.showEditionsStrip ?? true);
      if (cfg.editionCities && cfg.editionCities.length > 0) {
        setCities(cfg.editionCities);
      }
    });
  }, []);

  useEffect(() => {
    if (search.includes("browse=1")) {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
    }
  }, [search]);

  // Mode-based display logic
  let cityCards: any[] = [];
  const homePageMode = config.homePageMode || "today";

  if (homePageMode === "all") {
    // Show all published editions sorted by date
    const allCards: any[] = [];
    for (const e of allEditions ?? []) {
      const eCities = e.cities?.length ? e.cities : ((e as any).city ? [(e as any).city] : []);
      const eCitiesMr = e.citiesMr?.length ? e.citiesMr : ((e as any).cityMr ? [(e as any).cityMr] : []);
      const eCitiesHi = (e as any).citiesHi?.length ? (e as any).citiesHi : ((e as any).cityHi ? [(e as any).cityHi] : []);
      
      allCards.push({
        edition: e,
        cityEn: eCities[0] || "",
        cityMr: eCitiesMr[0] || eCities[0] || "",
        cityHi: eCitiesHi[0] || eCitiesMr[0] || eCities[0] || "",
      });
    }
    cityCards = allCards;
  } else {
    // Show only today's edition per city
    const todayKey = toDateKey(new Date());
    const todayByCity: Record<string, any> = {};
    for (const e of allEditions ?? []) {
      if (toDateKey(new Date(e.date)) === todayKey) {
        const eCities = e.cities?.length ? e.cities : ((e as any).city ? [(e as any).city] : []);
        const eCitiesMr = e.citiesMr?.length ? e.citiesMr : ((e as any).cityMr ? [(e as any).cityMr] : []);
        const eCitiesHi = (e as any).citiesHi?.length ? (e as any).citiesHi : ((e as any).cityHi ? [(e as any).cityHi] : []);
        for (let i = 0; i < eCities.length; i++) {
          const city = eCities[i];
          if (!todayByCity[city]) {
            todayByCity[city] = {
              edition: e,
              cityEn: city,
              cityMr: eCitiesMr[i] || city,
              cityHi: eCitiesHi[i] || eCitiesMr[i] || city,
            };
          }
        }
      }
    }
    cityCards = cities.map((c) => todayByCity[c.en]).filter(Boolean);
  }

  const editionDateMap: Record<string, any[]> = {};
  for (const e of allEditions ?? []) {
    const key = toDateKey(new Date(e.date));
    if (!editionDateMap[key]) editionDateMap[key] = [];
    editionDateMap[key].push(e);
  }
  const editionDateKeys = new Set(Object.keys(editionDateMap));

  function handleCalendarSelect(date: Date | undefined) {
    setCalendarDate(date);
    if (!date) return;
    const key = toDateKey(date);
    const editions = editionDateMap[key] ?? [];
    if (editions.length === 1) {
      navigate(`/edition/${editions[0]._id}`);
    }
  }

  const calendarEditionsRaw = calendarDate ? (editionDateMap[toDateKey(calendarDate)] ?? []) : [];
  const calendarEditions: Array<{ edition: any; cityEn: string; cityMr: string; cityHi: string }> = [];
  for (const e of calendarEditionsRaw) {
    const eCities = e.cities?.length ? e.cities : (e.city ? [e.city] : []);
    const eCitiesMr = e.citiesMr?.length ? e.citiesMr : (e.cityMr ? [e.cityMr] : []);
    const eCitiesHi = (e as any).citiesHi?.length ? (e as any).citiesHi : ((e as any).cityHi ? [(e as any).cityHi] : []);
    eCities.forEach((city: string, idx: number) => {
      calendarEditions.push({
        edition: e,
        cityEn: city,
        cityMr: eCitiesMr[idx] || city,
        cityHi: eCitiesHi[idx] || eCitiesMr[idx] || city,
      });
    });
  }

  const cityNamesEn = cities.map((c) => c.en).join("  •  ");
  const cityNamesMr = cities.map((c) => c.mr).join("  •  ");
  const cityNamesHi = cities.map((c) => c.hi || c.mr).join("  •  ");
  const tickerText = lang === "hi" ? cityNamesHi : lang === "mr" ? cityNamesMr : cityNamesEn;

  return (
    <div>
      {/* Editions strip — single row, "OUR EDITIONS" label + scrolling city names */}
      {showEditionsStrip && (
        <div className="bg-white border-b border-border flex items-center overflow-hidden h-8">
          <div className="shrink-0 px-3 h-full flex items-center bg-primary/10 border-r border-border">
            <span className="font-bold text-xs tracking-wider uppercase text-primary whitespace-nowrap">
              {t("Our Editions", "आमच्या आवृत्ती", "हमारे संस्करण")}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div
              className="flex whitespace-nowrap text-sm font-semibold text-foreground"
              style={{ animation: "ticker-loop 18s linear infinite" }}
            >
              <span className="pr-16">{tickerText}</span>
              <span className="pr-16">{tickerText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar panel — full bleed, below strip */}
      {showCalendar && (
        <div className="bg-white border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">
                {t("Browse Editions by Date", "तारखेनुसार आवृत्ती पहा", "तिथि अनुसार संस्करण देखें")}
              </p>
              <button
                onClick={() => { navigate("/"); setCalendarDate(undefined); }}
                className="p-1 hover:bg-muted rounded-sm"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="shrink-0">
                <CalendarPicker
                  mode="single"
                  selected={calendarDate}
                  onSelect={handleCalendarSelect}
                  disabled={(date) => !editionDateKeys.has(toDateKey(date))}
                  className="rounded-sm border border-border"
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {t(
                    "Click a date with an available edition",
                    "ज्या तारखेला आवृत्ती आहे त्यावर क्लिक करा",
                    "उपलब्ध संस्करण वाली तिथि पर क्लिक करें",
                  )}
                </p>
              </div>

              {calendarDate && (
                <div className="flex-1">
                  {calendarEditions.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("No editions found for this date.", "या तारखेला कोणतीही आवृत्ती नाही.", "इस तिथि के लिए कोई संस्करण उपलब्ध नहीं है।")}
                    </p>
                  ) : (
                    <div>
                      <p className="text-sm font-medium mb-3">
                        {formatDisplayDate(calendarDate.toISOString(), lang)} — {calendarEditions.length}{" "}
                        {calendarEditions.length === 1 ? t("edition", "आवृत्ती", "संस्करण") : t("editions", "आवृत्त्या", "संस्करण")}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {calendarEditions.map((item: any, idx: number) => (
                          <Link key={`${item.edition._id}-${idx}`} href={`/edition/${item.edition._id}`}>
                            <div className="group cursor-pointer border border-border rounded-sm overflow-hidden hover:shadow-md transition-shadow">
                              <div className="text-center py-1.5 text-xs font-bold text-white bg-primary">
                                {lang === "hi" ? item.cityHi : lang === "mr" ? item.cityMr : item.cityEn}
                              </div>
                              <img
                                src={item.edition.coverUrl}
                                alt={item.cityEn}
                                className="w-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                style={{ aspectRatio: "3/4" }}
                              />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!calendarDate && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm py-8">
                  {t("Select a date to see editions", "एक तारीख निवडा", "संस्करण देखने के लिए एक तिथि चुनें")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6 min-h-[400px]">
        {/* Edition grid — latest edition per city */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-sm overflow-hidden shadow-sm animate-pulse">
                <div className="h-8 bg-gray-200/60" />
                <div className="bg-gray-100" style={{ aspectRatio: "3/4" }} />
                <div className="px-3 py-3 border-t bg-gray-50/50">
                  <div className="h-3 w-2/3 bg-gray-200/80 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : cityCards.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cityCards.map((item: any, idx: number) => (
              <EditionCard
                key={`${item.edition._id}-${idx}`}
                edition={item.edition}
                lang={lang}
                overrideCityEn={item.cityEn}
                overrideCityMr={item.cityMr}
                overrideCityHi={item.cityHi}
              />
            ))}
          </div>
        ) : !isLoading ? (
          <div className="text-center py-20 border border-dashed border-border rounded-sm bg-gray-50/30">
            <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium text-sm">
              {t(
                "No editions available for today.",
                "आजची कोणतीही आवृत्ती उपलब्ध नाही.",
                "आज का कोई संस्करण उपलब्ध नहीं है।",
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
              {t(
                "Please use the 'Browse by Date' button above to view our archived editions.",
                "मागील आवृत्त्या पाहण्यासाठी वर दिलेल्या 'दिनदर्शिका' बटणाचा वापर करा.",
                "पुराने संस्करण देखने के लिए ऊपर दिए गए 'तिथि अनुसार' बटन का उपयोग करें।",
              )}
            </p>
          </div>
        ) : null}

        {/* Latest Articles */}
        {(latestArticles?.length ?? 0) > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-6 bg-primary inline-block" />
              <h2 className="font-serif text-xl font-bold">
                {t("Latest Articles", "अलीकडील लेख", "नवीनतम लेख")}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(latestArticles ?? []).map((article) => (
                <ArticleCard key={article._id} article={article} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
