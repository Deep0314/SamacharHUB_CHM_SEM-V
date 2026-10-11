import { useState, useRef } from "react";
import { useListArticles } from "@samacharhub/api-client-react";
import type { ArticleHotspot } from "@samacharhub/api-client-react";
import { X, Search } from "lucide-react";

interface HotspotEditorProps {
  pages: string[];
  hotspots: ArticleHotspot[];
  onChange: (hotspots: ArticleHotspot[]) => void;
}

interface DrawState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function HotspotEditor({ pages, hotspots, onChange }: HotspotEditorProps) {
  const [selectedPage, setSelectedPage] = useState(0);
  const [drawing, setDrawing] = useState<DrawState | null>(null);
  const [pendingRect, setPendingRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: articlesData } = useListArticles(
    { limit: 100, search: articleSearch || undefined },
    { query: { enabled: showPicker, queryKey: ["articles", articleSearch] } }
  );

  const pageHotspots = hotspots.filter((h) => h.pageIndex === selectedPage);

  function getRelativePos(e: React.MouseEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (showPicker) return;
    e.preventDefault();
    const pos = getRelativePos(e);
    setDrawing({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!drawing) return;
    const pos = getRelativePos(e);
    setDrawing((d) => (d ? { ...d, endX: pos.x, endY: pos.y } : null));
  }

  function handleMouseUp() {
    if (!drawing) return;
    const x = Math.min(drawing.startX, drawing.endX);
    const y = Math.min(drawing.startY, drawing.endY);
    const w = Math.abs(drawing.endX - drawing.startX);
    const h = Math.abs(drawing.endY - drawing.startY);
    setDrawing(null);
    if (w > 2 && h > 2) {
      setPendingRect({ x, y, w, h });
      setShowPicker(true);
    }
  }

  function handleSaveRegionWithoutArticle() {
    if (!pendingRect) return;
    const hotspot: ArticleHotspot = {
      pageIndex: selectedPage,
      x: pendingRect.x,
      y: pendingRect.y,
      width: pendingRect.w,
      height: pendingRect.h,
      articleId: "",
      articleTitle: "",
      articleTitleMr: "",
      articleSlug: "",
      articleSummary: "",
      articleSummaryMr: "",
    };
    onChange([...hotspots, hotspot]);
    setShowPicker(false);
    setPendingRect(null);
    setArticleSearch("");
  }

  function handleSelectArticle(article: any) {
    if (!pendingRect) return;
    const hotspot: ArticleHotspot = {
      pageIndex: selectedPage,
      x: pendingRect.x,
      y: pendingRect.y,
      width: pendingRect.w,
      height: pendingRect.h,
      articleId: article._id,
      articleTitle: article.title,
      articleTitleMr: article.titleMr ?? null,
      articleSlug: article.slug,
      articleSummary: article.summary,
      articleSummaryMr: article.summaryMr ?? null,
    };
    onChange([...hotspots, hotspot]);
    setShowPicker(false);
    setPendingRect(null);
    setArticleSearch("");
  }

  function handleDeleteHotspot(hotspotToDelete: ArticleHotspot) {
    onChange(hotspots.filter((h) => h !== hotspotToDelete));
  }

  const drawRect = drawing
    ? {
        x: Math.min(drawing.startX, drawing.endX),
        y: Math.min(drawing.startY, drawing.endY),
        w: Math.abs(drawing.endX - drawing.startX),
        h: Math.abs(drawing.endY - drawing.startY),
      }
    : null;

  if (pages.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {pages.map((url, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedPage(idx)}
            className={`shrink-0 border-2 rounded overflow-hidden transition-all ${
              selectedPage === idx ? "border-primary shadow-md" : "border-border hover:border-primary/50"
            }`}
            style={{ width: 56 }}
          >
            <img src={url} alt={`Page ${idx + 1}`} className="w-full object-cover" style={{ aspectRatio: "3/4" }} />
            <div className="text-center text-xs py-0.5 bg-white text-muted-foreground">
              {idx + 1}
              {hotspots.filter((h) => h.pageIndex === idx).length > 0 && (
                <span className="ml-0.5 text-yellow-500 font-bold">●</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-100 rounded px-2 py-1.5">
        Drag on the page to mark an article region. Hover over a region and click the × in the center to remove it.
      </p>

      <div
        ref={containerRef}
        className="relative overflow-hidden border border-border rounded-sm select-none shadow-sm"
        style={{ cursor: "crosshair" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={pages[selectedPage]}
          alt={`Page ${selectedPage + 1}`}
          className="w-full block pointer-events-none"
          draggable={false}
        />

        {pageHotspots.map((h, idx) => (
          <div
            key={idx}
            className="absolute border-2 border-yellow-400 bg-yellow-300/25 group hover:bg-yellow-300/40 transition-colors"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              width: `${h.width}%`,
              height: `${h.height}%`,
            }}
          >
            <div className="absolute -top-6 left-0 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-t whitespace-nowrap max-w-[180px] truncate pointer-events-none z-10 shadow">
              {h.articleTitle}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteHotspot(h);
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {drawRect && drawRect.w > 0 && drawRect.h > 0 && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-400/20 pointer-events-none"
            style={{
              left: `${drawRect.x}%`,
              top: `${drawRect.y}%`,
              width: `${drawRect.w}%`,
              height: `${drawRect.h}%`,
            }}
          />
        )}

        {pendingRect && showPicker && (
          <div
            className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
            style={{
              left: `${pendingRect.x}%`,
              top: `${pendingRect.y}%`,
              width: `${pendingRect.w}%`,
              height: `${pendingRect.h}%`,
            }}
          />
        )}
      </div>

      {showPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: "72vh" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Link article to this region</h3>
              <button
                type="button"
                onClick={() => {
                  setShowPicker(false);
                  setPendingRect(null);
                  setArticleSearch("");
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <button
                  type="button"
                  onClick={handleSaveRegionWithoutArticle}
                  className="w-full px-3 py-2 text-sm border border-border rounded-sm hover:bg-white transition-colors"
                >
                  Save region without article
                </button>
              </div>
              {!articlesData && (
                <p className="text-center py-8 text-sm text-muted-foreground">Loading articles…</p>
              )}
              {articlesData?.articles.map((article) => (
                <button
                  key={article._id}
                  type="button"
                  onClick={() => handleSelectArticle(article)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border last:border-0 transition-colors"
                >
                  <p className="text-sm font-medium truncate">{article.title}</p>
                  {article.titleMr && (
                    <p className="text-xs text-muted-foreground truncate">{article.titleMr}</p>
                  )}
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{article.summary}</p>
                </button>
              ))}
              {articlesData?.articles.length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground">No articles found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
