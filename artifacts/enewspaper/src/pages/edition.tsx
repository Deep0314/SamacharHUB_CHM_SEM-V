import { useParams, useLocation, Link } from "wouter";
import { useGetEdition, useListEditions } from "@samacharhub/api-client-react";
import type { ArticleHotspot } from "@samacharhub/api-client-react";
import { SEO } from "@/components/SEO";
import { useLang } from "@/lib/lang";
import { fetchHotspotUIConfig, DEFAULT_CONFIG } from "@/lib/hotspot-ui-config";
import { AdBanner } from "@/components/AdBanner";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Loader2,
  Printer,
  Link2,
  Share2,
  Archive,
  Scissors,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconXTwitter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconTelegram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

async function cropToDataUrl(
  imageUrl: string,
  hotspot: ArticleHotspot
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const srcX = (hotspot.x / 100) * img.naturalWidth;
      const srcY = (hotspot.y / 100) * img.naturalHeight;
      const srcW = (hotspot.width / 100) * img.naturalWidth;
      const srcH = (hotspot.height / 100) * img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(srcW * 2);
      canvas.height = Math.round(srcH * 2);
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
  });
}

function HotspotViewer({
  hotspot,
  pageUrl,
  lang,
  onClose,
  popupHeaderImage,
  editionDate,
  pageNumber,
}: {
  hotspot: ArticleHotspot;
  pageUrl: string;
  lang: string;
  onClose: () => void;
  popupHeaderImage?: string | null;
  editionDate?: string;
  pageNumber?: number;
}) {
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const cropStageRef = useRef<HTMLDivElement>(null);

  // Fetch config from server when popup opens
  useEffect(() => { fetchHotspotUIConfig().then(setCfg); }, []);

  const hasArticle = Boolean(hotspot.articleSlug);
  const title = lang === "mr" && hotspot.articleTitleMr ? hotspot.articleTitleMr : hotspot.articleTitle;

  let deepLinkUrl = window.location.href;
  try {
    const u = new URL(window.location.href);
    const hid = (hotspot as any)._id || (hotspot as any).id || `${hotspot.pageIndex || 0}_${Math.round(hotspot.x)}_${Math.round(hotspot.y)}`;
    u.searchParams.set("hotspot", hid);
    deepLinkUrl = u.toString();
  } catch (e) {}

  const articleUrl = hasArticle
    ? `${window.location.origin}/article/${hotspot.articleSlug}`
    : deepLinkUrl;

  const shareText = encodeURIComponent(title || "SamacharHUB");
  const shareUrl = encodeURIComponent(articleUrl);
  const shareBody = `${title || "SamacharHUB"} ${articleUrl}`;

  const displayDate = editionDate
    ? new Date(editionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  const footerLine = [
    cfg.showFooterDate !== false ? displayDate : "",
    cfg.showFooterPage !== false && pageNumber != null ? `Page ${pageNumber}` : "",
    cfg.footerSiteUrl || "www.samacharhub.com",
  ].filter(Boolean).join(" - ");

  useEffect(() => {
    setCroppedUrl(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    cropToDataUrl(pageUrl, hotspot)
      .then(setCroppedUrl)
      .catch(() => setCroppedUrl(pageUrl));
  }, [pageUrl, hotspot]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(4, parseFloat((z + 0.25).toFixed(2))));
      if (e.key === "-" || e.key === "_") setZoom((z) => Math.max(1, parseFloat((z - 0.25).toFixed(2))));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => { if (zoom === 1) setPan({ x: 0, y: 0 }); }, [zoom]);

  function clampPan(next: { x: number; y: number }) {
    const box = cropBoxRef.current;
    const stage = cropStageRef.current;
    if (!box || !stage) return next;
    const boxRect = box.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const renderedW = stageRect.width * zoom;
    const renderedH = stageRect.height * zoom;
    const maxX = Math.max(0, (renderedW - boxRect.width) / 2);
    const maxY = Math.max(0, (renderedH - boxRect.height) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setZoom((z) => Math.max(1, Math.min(4, parseFloat((z + delta).toFixed(2)))));
      return;
    }
    if (zoom > 1) setPan((p) => clampPan({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (zoom <= 1) return;
    setIsPanning(true);
    setPanOrigin({ x: e.clientX, y: e.clientY });
    setPanStart(pan);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isPanning || zoom <= 1) return;
    setPan(clampPan({ x: panStart.x + (e.clientX - panOrigin.x), y: panStart.y + (e.clientY - panOrigin.y) }));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    setIsPanning(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { }
  }

  function handleCropClick() {
    setZoom((z) => { if (z > 1) { setPan({ x: 0, y: 0 }); return 1; } return 2; });
  }

  async function buildCompositeCanvas(): Promise<HTMLCanvasElement> {
    const W = 900;
    const HEADER_H = 45;
    const FOOTER_H = 45;

    const articleImg = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.crossOrigin = "anonymous";
      i.src = croppedUrl!;
    });

    const articleH = Math.round((articleImg.naturalHeight / articleImg.naturalWidth) * W);
    const totalH = HEADER_H + articleH + FOOTER_H;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = totalH;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, totalH);

    // header
    const headerSrc = popupHeaderImage || cfg.defaultMastheadUrl || cfg.logoUrl || null;
    if (headerSrc) {
      try {
        const hImg = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image();
          i.crossOrigin = "anonymous";
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = headerSrc;
        });
        const hH = HEADER_H - 10;
        const hW = Math.min(W - 40, hImg.naturalWidth * (hH / hImg.naturalHeight));
        ctx.drawImage(hImg, Math.round((W - hW) / 2), 5, hW, hH);
      } catch {
        ctx.fillStyle = "#CC0000";
        ctx.font = "bold 20px serif";
        ctx.textAlign = "center";
        ctx.fillText(cfg.logoText || "SamacharHUB", W / 2, HEADER_H / 2 + 7);
      }
    } else {
      ctx.fillStyle = "#CC0000";
      ctx.font = "bold 20px serif";
      ctx.textAlign = "center";
      ctx.fillText(cfg.logoText || "SamacharHUB", W / 2, HEADER_H / 2 + 7);
    }

    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, HEADER_H, W, 1);
    ctx.drawImage(articleImg, 0, HEADER_H + 1, W, articleH);

    const footerY = HEADER_H + 1 + articleH;
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, footerY, W, FOOTER_H);
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, footerY, W, 1);
    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(footerLine, W / 2, footerY + 20);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px sans-serif";
    ctx.fillText("Powered by | Deep Kamble", W / 2, footerY + 36);
    return canvas;
  }

  async function handleDownload() {
    if (!croppedUrl) return;
    const canvas = await buildCompositeCanvas();
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.download = `panchnama-lakshvedhi-article.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleNativeShare() {
    const shareData: ShareData = { title: title || "SamacharHUB", url: articleUrl };
    // Try sharing with composite image blob
    if (croppedUrl && navigator.canShare) {
      try {
        const canvas = await buildCompositeCanvas();
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.9));
        const file = new File([blob], "panchnama-lakshvedhi.jpg", { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: title || "SamacharHUB", files: [file] });
          return;
        }
      } catch { }
    }
    if (navigator.share) {
      navigator.share(shareData).catch(() => { });
    } else {
      navigator.clipboard.writeText(articleUrl);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(articleUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handlePrint() {
    if (!croppedUrl) return;
    const canvas = await buildCompositeCanvas();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const html = `<html><head><title>Print - SamacharHUB</title>
      <style>body{margin:0;padding:0}img{max-width:100%;display:block}@media print{body{margin:0}}</style>
      </head><body><img src="${dataUrl}" /></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try { iframe.contentWindow?.print(); } finally {
        setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 2000);
      }
    };
  }

  const ALL_SHARE = [
    { key: "whatsapp" as const, label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(shareBody)}`, bg: "#25D366", icon: IconWhatsApp },
    { key: "facebook" as const, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, bg: "#1877F2", icon: IconFacebook },
    { key: "instagram" as const, label: "Instagram", href: `https://www.instagram.com/`, bg: "#E1306C", icon: IconInstagram },
    { key: "twitter" as const, label: "X", href: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, bg: "#000000", icon: IconXTwitter },
    { key: "telegram" as const, label: "Telegram", href: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`, bg: "#229ED9", icon: IconTelegram },
    { key: "email" as const, label: "Email", href: `mailto:?subject=${shareText}&body=${encodeURIComponent(shareBody)}`, bg: "#6B7280", icon: IconMail },
    { key: "linkedin" as const, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, bg: "#0A66C2", icon: IconLinkedIn },
  ];
  const activeShareLinks = ALL_SHARE.filter((s) => cfg.shareButtons[s.key]);

  const logoSrc = popupHeaderImage || (cfg.showLogo && cfg.logoUrl ? cfg.logoUrl : null);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full flex flex-col overflow-hidden shadow-2xl max-w-[760px]"
        style={{ maxHeight: "85dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="relative shrink-0 bg-white border-b border-gray-100">
          {(popupHeaderImage || cfg.showLogo) ? (
            <div className="flex items-center justify-center px-10 py-0.5 min-h-[22px] md:min-h-[40px]">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Masthead"
                  className="max-h-6 md:max-h-11 w-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const span = document.createElement("span");
                    span.className = "font-serif font-black text-2xl text-red-700 tracking-tight";
                    span.textContent = cfg.logoText || "SamacharHUB";
                    e.currentTarget.parentElement?.appendChild(span);
                  }}
                />
              ) : (
                <span className="font-serif font-black text-2xl text-[#CC0000] tracking-tight">
                  {cfg.logoText || "SamacharHUB"}
                </span>
              )}
            </div>
          ) : (
            <div className="h-3" />
          )}
          <button onClick={onClose} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* ── SINGLE SCROLLABLE BODY ── */}
        <div className="overflow-y-auto flex-1 flex flex-col">
          {/* Zoom hint */}
          {cfg.showZoomHint && (
            <p className="text-[8px] md:text-[10px] text-gray-400 text-center py-0.5 md:py-1 bg-gray-50/50">
              {lang === "mr" ? "Ctrl+स्क्रोल = झूम • क्लिक = झूम टॉगल" : "Ctrl+scroll to zoom • click image to zoom"}
            </p>
          )}

          {/* Article crop */}
          <div ref={cropBoxRef} className="bg-gray-900 flex items-start justify-center" onWheel={handleWheel}>
            {!croppedUrl ? (
              <div className="flex flex-col items-center gap-2 py-16 text-white/60 w-full">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-xs">{lang === "mr" ? "लोड होत आहे..." : "Cropping…"}</p>
              </div>
            ) : (
              <div
                ref={cropStageRef}
                style={{
                  width: "100%",
                  transform: zoom > 1 ? `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` : "none",
                  transformOrigin: "top center",
                  cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleCropClick}
              >
                <img src={croppedUrl} alt={title || "Newspaper clip"} className="block w-full" style={{ height: "auto" }} draggable={false} />
              </div>
            )}
          </div>

          {/* Info bar */}
          <div className="px-4 py-1.5 border-t border-gray-100 bg-white text-center space-y-0.5">
            <p className="text-xs text-gray-600 font-medium">{footerLine}</p>
            {cfg.footerPoweredBy && (
              <p className="text-xs text-gray-400">{cfg.footerPoweredBy}</p>
            )}
            {cfg.showArticleDetails && title && (
              <p className="text-xs font-semibold text-gray-700 pt-1 line-clamp-2">{title}</p>
            )}
          </div>

          {/* Social share icons — single line, no wrap */}
          {activeShareLinks.length > 0 && (
            <div className="px-3 py-2.5 border-t border-gray-100">
              <div className="flex items-center gap-1.5 flex-nowrap w-full">
                {activeShareLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      title={item.label}
                      className="flex-1 min-w-0 aspect-square flex items-center justify-center rounded-full text-white shadow-sm hover:scale-110 transition-transform max-w-10"
                      style={{ backgroundColor: item.bg }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  );
                })}
                {/* Action icons inline in share row */}
                {cfg.showCopyLink && (
                  <button
                    onClick={handleCopyLink}
                    title={lang === "mr" ? "लिंक कॉपी करा" : "Copy Link"}
                    className="flex-1 min-w-0 aspect-square flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:scale-110 transition-all max-w-10"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {cfg.showPrint && (
                  <button
                    onClick={handlePrint}
                    disabled={!croppedUrl}
                    title={lang === "mr" ? "प्रिंट करा" : "Print"}
                    className="flex-1 min-w-0 aspect-square flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:scale-110 transition-all disabled:opacity-40 max-w-10"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                )}
                {cfg.showDownload && (
                  <button
                    onClick={handleDownload}
                    disabled={!croppedUrl}
                    title={lang === "mr" ? "डाउनलोड" : "Download"}
                    className="flex-1 min-w-0 aspect-square flex items-center justify-center rounded-full text-white shadow-sm hover:scale-110 transition-all disabled:opacity-40 max-w-10 bg-[#D21F26]"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={handleNativeShare}
                  disabled={!croppedUrl}
                  title={lang === "mr" ? "शेअर करा" : "Share"}
                  className="flex-1 min-w-0 aspect-square flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:scale-110 transition-all disabled:opacity-40 max-w-10"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {cfg.showReadArticle && (hotspot.articleSlug || hotspot.articleId) && (
            <div className="px-4 pb-4 pt-1">
              <Link
                href={`/article/${hotspot.articleSlug || hotspot.articleId}`}
                onClick={() => onClose()}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-primary/5 border border-primary/20 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" />
                {lang === "mr" ? "पूर्ण लेख वाचा" : "Read Full Article"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Archive Panel ──────────────────────────────────────────────────────────
function ArchivePanel({ cities, currentId, lang, onClose }: { cities: string[]; currentId: string; lang: string; onClose: () => void }) {
  const { data: allEditions } = useListEditions();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<Date | undefined>();
  const [notFound, setNotFound] = useState(false);

  const cityEditions = (allEditions ?? []).filter((e) => {
    if (e._id === currentId) return false;
    const eCities = e.cities?.length ? e.cities : ((e as any).city ? [(e as any).city] : []);
    return eCities.some((c: string) => cities.includes(c));
  });

  function toDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  const availableDates = new Set(cityEditions.map((e) => toDateStr(new Date(e.date))));

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    setNotFound(false);
    setSelected(date);
    const dateStr = toDateStr(date);
    const match = cityEditions.find((e) => toDateStr(new Date(e.date)) === dateStr);
    if (match) {
      navigate(`/edition/${match._id}`);
      onClose();
    } else {
      setNotFound(true);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-sm flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Archive className="h-4 w-4 text-primary" />
            {lang === "mr" ? "दिनांकानुसार आवृत्ती" : "Browse by Date"} — {cities.join(", ")}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto p-4 flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground text-center">
            {lang === "mr"
              ? "उपलब्ध तारीख (हायलाइट) निवडून त्या दिवसाचा अंक पाहा"
              : "Select a highlighted date to open that edition"}
          </p>
          <CalendarPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={(date) => !availableDates.has(toDateStr(date)) || date > new Date()}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={new Date().getFullYear()}
            className="rounded-md border border-border"
          />
          {notFound && (
            <p className="text-xs text-destructive text-center">
              {lang === "mr" ? "या तारखेला आवृत्ती उपलब्ध नाही." : "No edition found for this date."}
            </p>
          )}
          {cityEditions.length === 0 && allEditions !== undefined && (
            <p className="text-sm text-muted-foreground text-center py-2">
              {lang === "mr" ? "कोणतेही जुने अंक नाहीत" : "No archived editions found"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Edition Page ───────────────────────────────────────────────────────────
export default function EditionPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { lang } = useLang();
  const { data: edition, isLoading } = useGetEdition(id ?? "");
  const [activePage, setActivePage] = useState(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [selectedHotspot, setSelectedHotspot] = useState<ArticleHotspot | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [showShareBar, setShowShareBar] = useState(true);
  const [isClipping, setIsClipping] = useState(false);
  const [clipDragStart, setClipDragStart] = useState<{ x: number; y: number } | null>(null);
  const [clipRect, setClipRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [clipHotspot, setClipHotspot] = useState<ArticleHotspot | null>(null);
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHotspotUIConfig().then(setCfg); }, []);

  useEffect(() => {
    if (!edition) return;
    const params = new URLSearchParams(window.location.search);
    const hotspotId = params.get("hotspot");
    if (hotspotId) {
      const found = edition.articleHotspots?.find((h: any) => {
        const hId = `${h.pageIndex || 0}_${Math.round(h.x)}_${Math.round(h.y)}`;
        return hId === hotspotId || h._id === hotspotId || h.id === hotspotId;
      });
      if (found) {
        setActivePage(found.pageIndex || 0);
        setTimeout(() => {
          setSelectedHotspot(found);
          const url = new URL(window.location.href);
          url.searchParams.delete("hotspot");
          window.history.replaceState({}, '', url.toString());
        }, 100);
      }
    }
  }, [edition]);
  useEffect(() => {
    setZoom(MIN_ZOOM);
    setSelectedHotspot(null);
    if (viewerRef.current) {
      viewerRef.current.scrollTop = 0;
      viewerRef.current.scrollLeft = 0;
    }
  }, [activePage]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
        setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, parseFloat((z + delta).toFixed(1)))));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  function handleClipPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setClipDragStart({ x, y });
    setClipRect({ x, y, width: 0, height: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleClipPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!clipDragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setClipRect({
      x: Math.min(x, clipDragStart.x),
      y: Math.min(y, clipDragStart.y),
      width: Math.abs(x - clipDragStart.x),
      height: Math.abs(y - clipDragStart.y),
    });
  }

  function handleClipPointerUp() {
    if (!clipRect || clipRect.width < 2 || clipRect.height < 2) {
      setClipDragStart(null);
      setClipRect(null);
      return;
    }
    const hotspot = {
      x: clipRect.x,
      y: clipRect.y,
      width: clipRect.width,
      height: clipRect.height,
      pageIndex: activePage,
      articleTitle: `${cityName} — Clip`,
    } as ArticleHotspot;
    setClipHotspot(hotspot);
    setClipDragStart(null);
    setClipRect(null);
    setIsClipping(false);
  }

  function handlePrintEditionPage(pageUrl: string) {
    const html = `<html><head><title>Print - SamacharHUB</title><style>body{margin:0;padding:0}img{max-width:100%;display:block}@media print{body{margin:0}}</style></head><body><img src="${pageUrl}" /></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try { iframe.contentWindow?.print(); } finally {
        setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 2000);
      }
    };
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-32 mb-6" />
          <div className="h-8 bg-muted rounded w-64 mb-4" />
          <div className="aspect-[3/4] bg-muted rounded-sm" />
        </div>
      </div>
    );
  }

  if (!edition) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{lang === "mr" ? "आवृत्ती आढळली नाही." : "Edition not found."}</p>
        <button onClick={() => navigate("/")} className="mt-4 text-sm text-primary hover:underline">
          {lang === "mr" ? "मुख्यपृष्ठावर परत जा" : "Back to Home"}
        </button>
      </div>
    );
  }

  const allPages = [edition.coverUrl, ...(edition.pages ?? [])];
  const uniquePages = [...new Set(allPages)];
  const activePageHotspots = (edition.articleHotspots ?? []).filter((h: any) => h.pageIndex === activePage);
  const cityName = lang === "mr" ? (edition.citiesMr?.join(", ") || (edition as any).cityMr) : (edition.cities?.join(", ") || (edition as any).city);
  const displayDate = new Date(edition.date).toLocaleDateString(
    lang === "mr" ? "mr-IN" : "en-IN",
    { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {lang === "mr" ? "सर्व आवृत्त्या" : "All Editions"}
      </button>

      <div className="mb-4 flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-primary">{cityName}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <CalendarIcon className="h-4 w-4" />
            {displayDate}
            <span className="text-border">•</span>
            <span>{uniquePages.length} {lang === "mr" ? "पाने" : uniquePages.length === 1 ? "page" : "pages"}</span>
            {activePageHotspots.length > 0 && (
              <>
                <span className="text-border">•</span>
                <span className="text-yellow-600 font-medium text-xs">
                  {activePageHotspots.length} {lang === "mr" ? "लेख" : "article"}{activePageHotspots.length > 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right toolbar: Archive + Share + Zoom */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Clip */}
          <button
            onClick={() => { setIsClipping((v) => !v); setClipRect(null); setClipDragStart(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm font-semibold shadow-sm transition-colors border ${isClipping
              ? "bg-yellow-500 text-white border-yellow-600 ring-2 ring-yellow-400"
              : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              }`}
            title={lang === "mr" ? "कात्री करा" : "Clip & Share"}
          >
            <Scissors className="h-3.5 w-3.5" />
            {lang === "mr" ? "कात्री" : "Clip"}
          </button>

          {/* Archive */}
          <button
            onClick={() => setShowArchive(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground border border-primary rounded-sm hover:bg-primary/90 font-semibold shadow-sm transition-colors"
            title="Archive"
          >
            <Archive className="h-3.5 w-3.5" />
            {lang === "mr" ? "संग्रह" : "Archive"}
          </button>

          {showArchive && (
            <ArchivePanel
              cities={edition.cities?.length ? edition.cities : [(edition as any).city]}
              currentId={edition._id}
              lang={lang}
              onClose={() => setShowArchive(false)}
            />
          )}

          {/* Share toggle — icon only */}
          <button
            onClick={() => setShowShareBar((v) => !v)}
            className={`p-2 border rounded-sm transition-colors ${showShareBar ? "bg-primary/10 border-primary/30 text-primary" : "border-border hover:bg-muted"}`}
            title={lang === "mr" ? "शेअर करा" : "Share this edition"}
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white border border-border rounded-sm shadow-sm">
            <button
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(1))))}
              disabled={zoom <= MIN_ZOOM}
              className="p-2 hover:bg-muted disabled:opacity-40 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs text-muted-foreground min-w-[3.5rem] text-center font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(1))))}
              disabled={zoom >= MAX_ZOOM}
              className="p-2 hover:bg-muted disabled:opacity-40 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {zoom > MIN_ZOOM && (
              <button
                onClick={() => setZoom(MIN_ZOOM)}
                className="p-2 hover:bg-muted transition-colors border-l border-border"
                title="Reset zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edition social share bar — always shown when any share platform is enabled */}
      {showShareBar && (() => {
        const editionPageUrl = window.location.href;
        const shareTitle = `${cityName} - ${displayDate} - SamacharHUB`;
        const shareText = encodeURIComponent(shareTitle);
        const shareUrl = encodeURIComponent(editionPageUrl);
        const shareBody = `${shareTitle} ${editionPageUrl}`;
        const socialLinks = [
          { key: "whatsapp" as const, label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(shareBody)}`, bg: "#25D366", icon: IconWhatsApp },
          { key: "facebook" as const, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, bg: "#1877F2", icon: IconFacebook },
          { key: "instagram" as const, label: "Instagram", href: `https://www.instagram.com/`, bg: "#E1306C", icon: IconInstagram },
          { key: "twitter" as const, label: "X", href: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, bg: "#000000", icon: IconXTwitter },
          { key: "telegram" as const, label: "Telegram", href: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`, bg: "#229ED9", icon: IconTelegram },
          { key: "email" as const, label: "Email", href: `mailto:?subject=${shareText}&body=${encodeURIComponent(shareBody)}`, bg: "#6B7280", icon: IconMail },
          { key: "linkedin" as const, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, bg: "#0A66C2", icon: IconLinkedIn },
        ].filter((s) => cfg.shareButtons[s.key]);
        return (
          <div className="mb-4 border border-border rounded-sm bg-white px-3 py-2">
            <div className="flex flex-nowrap items-center gap-1.5 w-full">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.key} href={item.href} target="_blank" rel="noreferrer" title={item.label}
                    className="flex-1 min-w-0 aspect-square flex items-center justify-center rounded-full text-white shadow hover:scale-110 transition-transform max-w-10"
                    style={{ backgroundColor: item.bg }}>
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
              <button onClick={() => handlePrintEditionPage(uniquePages[activePage])} title={lang === "mr" ? "प्रिंट" : "Print"}
                className="flex-1 min-w-0 aspect-square flex items-center justify-center rounded-full bg-gray-700 text-white shadow hover:scale-110 transition-transform max-w-10">
                <Printer className="h-3.5 w-3.5" />
              </button>
              <a href={uniquePages[activePage]} download target="_blank" rel="noreferrer" title={lang === "mr" ? "डाउनलोड" : "Download"}
                className="flex-1 min-w-0 aspect-square flex items-center justify-center rounded-full bg-[#CC0000] text-white shadow hover:scale-110 transition-transform max-w-10">
                <Download className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        );
      })()}

      <div className="flex gap-4">
        {/* Page thumbnail sidebar */}
        {uniquePages.length > 1 && (
          <aside className="hidden md:flex flex-col gap-2 w-20 shrink-0">
            {uniquePages.map((url, idx) => {
              const hasHotspots = (edition.articleHotspots ?? []).some((h) => h.pageIndex === idx);
              return (
                <button
                  key={idx}
                  onClick={() => setActivePage(idx)}
                  className={`relative border-2 rounded overflow-hidden transition-all ${activePage === idx ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                    }`}
                >
                  <img src={url} alt={`Page ${idx + 1}`} className="w-full object-cover" style={{ aspectRatio: "3/4" }} />
                  <div className="text-center text-xs py-0.5 bg-white text-muted-foreground flex items-center justify-center gap-0.5">
                    {idx + 1}
                    {hasHotspots && <span className="text-yellow-500 text-[10px]">●</span>}
                  </div>
                </button>
              );
            })}
          </aside>
        )}

        {/* Main viewer */}
        <div className="flex-1 min-w-0">
          {activePageHotspots.length > 0 && (
            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5 mb-2 flex items-center gap-1.5">
              <span className="text-yellow-500">●</span>
              {lang === "mr" ? "पिवळ्या क्षेत्रांवर क्लिक करा" : "Click on highlighted regions to view the article"}
            </p>
          )}

          {/* Newspaper viewer — full height, no cap so whole page shows */}
          <div className="relative">
            {/* Mobile overlay: Previous arrow */}
            {uniquePages.length > 1 && (
              <button
                onClick={() => setActivePage((p) => Math.max(0, p - 1))}
                disabled={activePage === 0}
                className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-14 bg-black/40 hover:bg-black/60 disabled:opacity-0 disabled:pointer-events-none transition-all rounded-r-lg backdrop-blur-sm"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-6 w-6 text-white drop-shadow" />
              </button>
            )}
            {/* Mobile overlay: Next arrow */}
            {uniquePages.length > 1 && (
              <button
                onClick={() => setActivePage((p) => Math.min(uniquePages.length - 1, p + 1))}
                disabled={activePage === uniquePages.length - 1}
                className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-14 bg-black/40 hover:bg-black/60 disabled:opacity-0 disabled:pointer-events-none transition-all rounded-l-lg backdrop-blur-sm"
                aria-label="Next page"
              >
                <ChevronRight className="h-6 w-6 text-white drop-shadow" />
              </button>
            )}
            <div
              ref={viewerRef}
              className="overflow-auto border border-border rounded-sm shadow-md bg-gray-100"
            >
              <div
                className="relative origin-top-left"
                style={{
                  width: `${zoom * 100}%`,
                  minWidth: zoom > 1 ? `${zoom * 100}%` : undefined,
                }}
              >
                <img
                  src={uniquePages[activePage]}
                  alt={`${cityName} - Page ${activePage + 1}`}
                  className="w-full block"
                  draggable={false}
                />
                {activePageHotspots.map((h, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedHotspot(h)}
                    className="absolute border-2 border-transparent bg-transparent hover:border-red-500 hover:bg-transparent transition-all cursor-zoom-in group"
                    style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.width}%`, height: `${h.height}%` }}
                    aria-label={h.articleTitle || "View article"}
                  >
                    <span className="absolute -top-5 left-0 bg-red-600 text-white text-[10px] px-1.5 py-0.5 leading-tight opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-[180px] truncate rounded-t pointer-events-none shadow font-medium">
                      {lang === "mr" && h.articleTitleMr ? h.articleTitleMr : h.articleTitle || (lang === "mr" ? "लेख पाहा" : "View article")}
                    </span>
                    <span className="absolute bottom-0.5 right-0.5 bg-red-600 text-white text-[8px] px-1 py-0.5 rounded leading-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-semibold">
                      {idx + 1}
                    </span>
                  </button>
                ))}

                {/* Clip drag overlay */}
                {isClipping && (
                  <div
                    className="absolute inset-0 z-20 select-none"
                    style={{ cursor: "crosshair" }}
                    onPointerDown={handleClipPointerDown}
                    onPointerMove={handleClipPointerMove}
                    onPointerUp={handleClipPointerUp}
                  >
                    {/* Instruction banner */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg pointer-events-none select-none z-30 whitespace-nowrap">
                      {lang === "mr" ? "क्षेत्र निवडण्यासाठी ड्रॅग करा" : "Drag to select an area to clip"}
                    </div>
                    {/* Selection rectangle */}
                    {clipRect && clipRect.width > 0.5 && clipRect.height > 0.5 && (
                      <div
                        className="absolute border-2 border-dashed border-yellow-400 bg-yellow-400/10 pointer-events-none z-20"
                        style={{
                          left: `${clipRect.x}%`,
                          top: `${clipRect.y}%`,
                          width: `${clipRect.width}%`,
                          height: `${clipRect.height}%`,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page navigation */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setActivePage((p) => Math.max(0, p - 1))}
              disabled={activePage === 0}
              className="px-4 py-1.5 text-sm border border-border rounded-sm disabled:opacity-40 hover:bg-muted transition-colors"
            >
              {lang === "mr" ? "मागे" : "Previous"}
            </button>
            <span className="text-sm text-muted-foreground">
              {lang === "mr" ? `${activePage + 1} / ${uniquePages.length}` : `Page ${activePage + 1} of ${uniquePages.length}`}
            </span>
            <button
              onClick={() => setActivePage((p) => Math.min(uniquePages.length - 1, p + 1))}
              disabled={activePage === uniquePages.length - 1}
              className="px-4 py-1.5 text-sm border border-border rounded-sm disabled:opacity-40 hover:bg-muted transition-colors"
            >
              {lang === "mr" ? "पुढे" : "Next"}
            </button>
          </div>

          {/* Inline edition ad */}
          <div className="mt-4">
            <AdBanner position="inline-edition" />
          </div>

          {/* Mobile page strip */}
          {uniquePages.length > 1 && (
            <div className="md:hidden flex gap-2 overflow-x-auto mt-4 pb-1">
              {uniquePages.map((url, idx) => {
                const hasHotspots = (edition.articleHotspots ?? []).some((h) => h.pageIndex === idx);
                return (
                  <button
                    key={idx}
                    onClick={() => setActivePage(idx)}
                    className={`shrink-0 w-14 border-2 rounded overflow-hidden transition-all relative ${activePage === idx ? "border-primary" : "border-border"
                      }`}
                  >
                    <img src={url} alt={`Page ${idx + 1}`} className="w-full object-cover" style={{ aspectRatio: "3/4" }} />
                    {hasHotspots && <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-yellow-400 rounded-full" />}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Article hotspot popup overlay */}
      {selectedHotspot && (
        <HotspotViewer
          hotspot={selectedHotspot}
          pageUrl={uniquePages[activePage]}
          lang={lang}
          onClose={() => setSelectedHotspot(null)}
          popupHeaderImage={edition.hotspotPopupHeader}
          editionDate={edition.date}
          pageNumber={activePage + 1}
        />
      )}

      {/* Clip result popup overlay */}
      {clipHotspot && (
        <HotspotViewer
          hotspot={clipHotspot}
          pageUrl={uniquePages[activePage]}
          lang={lang}
          onClose={() => setClipHotspot(null)}
          editionDate={edition.date}
          pageNumber={activePage + 1}
        />
      )}


    </div>
  );
}
