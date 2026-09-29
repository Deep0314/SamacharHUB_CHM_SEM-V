import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchHotspotUIConfig } from "@/lib/hotspot-ui-config";

export function LoadingScreen() {
  const [logoUrl, setLogoUrl] = useState<string | null>("/logo.jpg");

  useEffect(() => {
    fetchHotspotUIConfig().then((cfg) => {
      if (cfg.logoUrl) {
        setLogoUrl(cfg.logoUrl);
      } else if (!cfg.logoUrl || cfg.showLogo === false) {
        setLogoUrl(null);
      }
    });
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      <div className="mb-8 animate-in fade-in zoom-in duration-700">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-12 md:h-16 w-auto object-contain" />
        ) : (
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/20">
            <span className="text-white text-2xl font-serif font-black tracking-tighter">SamacharHUB</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
        {!logoUrl && (
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 animate-pulse">
            SamacharHUB
          </p>
        )}
      </div>
    </div>
  );
}
