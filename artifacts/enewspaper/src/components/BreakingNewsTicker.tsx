import { useListBreakingNews } from "@samacharhub/api-client-react";
import { useLang } from "@/lib/lang";
import { fetchHotspotUIConfig } from "@/lib/hotspot-ui-config";
import { useState, useEffect } from "react";

export function BreakingNewsTicker() {
  const { lang, t } = useLang();
  const { data: items } = useListBreakingNews({ lang });
  const [continuous, setContinuous] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetchHotspotUIConfig().then((cfg) => {
      setContinuous(cfg.tickerContinuous ?? true);
      setVisible(cfg.showBreakingNewsStrip ?? true);
    });
  }, []);

  if (!visible || !items || items.length === 0) return null;

  const text = items.map((item) => t(item.text, item.textMr, (item as any).textHi)).join("   |   ");

  return (
    <div className="bg-primary text-primary-foreground flex items-center overflow-hidden h-9">
      <div className="shrink-0 px-3 py-1 bg-black/20 font-bold text-xs tracking-wider uppercase whitespace-nowrap">
        {t("Breaking News", "ताज्या बातम्या", "ताज़ा ख़बरें")}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {continuous ? (
          <div
            className="flex whitespace-nowrap text-sm py-1"
            style={{ animation: "ticker-loop 40s linear infinite" }}
          >
            <span className="pr-16">{text}</span>
            <span className="pr-16">{text}</span>
          </div>
        ) : (
          <div
            className="whitespace-nowrap text-sm py-1 px-4"
            style={{ display: "inline-block", animation: "marquee 40s linear infinite" }}
          >
            {text}
          </div>
        )}
      </div>
    </div>
  );
}
