import { useState, useEffect } from "react";
import { X } from "lucide-react";

type AdPosition = "popup" | "banner-top" | "banner-bottom" | "sidebar-right" | "inline-edition" | "inline-article";

interface Ad {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: AdPosition;
}

const API = "/api";
const DISMISSED_KEY = "dismissed_ads";

function getDismissed(): Set<string> {
  return new Set();
}

function dismiss(id: string) {
  // Reset on reload/navigation
}

export function AdBanner({ position }: { position: AdPosition; className?: string }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => getDismissed());

  useEffect(() => {
    fetch(`${API}/ads?position=${position}`)
      .then((r) => r.json())
      .then((data) => setAds(data))
      .catch(() => {});
  }, [position]);

  const visible = ads.filter((a) => !dismissed.has(a._id));
  if (visible.length === 0) return null;

  const ad = visible[0];

  function handleDismiss() {
    dismiss(ad._id);
    setDismissed(getDismissed());
  }

  const content = (
    <div className="relative group w-full bg-gray-100">
      <img
        src={ad.imageUrl}
        alt={ad.title}
        className="w-full h-auto block"
      />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDismiss(); }}
        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Close ad"
      >
        <X className="h-3 w-3" />
      </button>
      <span className="absolute bottom-1 left-1 text-[9px] text-white/60 bg-black/30 px-1 rounded pointer-events-none">Ad</span>
    </div>
  );

  if (ad.linkUrl) {
    return (
      <a href={ad.linkUrl} target="_blank" rel="noreferrer noopener" className="block w-full">
        {content}
      </a>
    );
  }
  return content;
}

export function AdPopup() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => getDismissed());
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/ads?position=popup`)
      .then((r) => r.json())
      .then((data) => {
        setAds(data);
        const visible = data.filter((a: Ad) => !getDismissed().has(a._id));
        if (visible.length > 0 && !shown) {
          setTimeout(() => { setOpen(true); setShown(true); }, 1500);
        }
      })
      .catch(() => {});
  }, []);

  const visible = ads.filter((a) => !dismissed.has(a._id));
  if (!open || visible.length === 0) return null;

  const ad = visible[0];

  function handleClose() {
    dismiss(ad._id);
    setDismissed(getDismissed());
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-w-lg w-full bg-white rounded-sm shadow-2xl overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="absolute top-2 left-2 text-[9px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded">Advertisement</span>
        {ad.linkUrl ? (
          <a href={ad.linkUrl} target="_blank" rel="noreferrer noopener" onClick={handleClose}>
            <img src={ad.imageUrl} alt={ad.title} className="w-full object-cover" />
          </a>
        ) : (
          <img src={ad.imageUrl} alt={ad.title} className="w-full object-cover" />
        )}
      </div>
    </div>
  );
}
