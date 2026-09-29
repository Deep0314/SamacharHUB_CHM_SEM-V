import { Link, useLocation } from "wouter";
import { useLang } from "@/lib/lang";
import { Menu, X, ChevronDown, CalendarDays } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { fetchHotspotUIConfig, DEFAULT_CITIES, DEFAULT_CONFIG, type CityEntry, type HotspotUIConfig } from "@/lib/hotspot-ui-config";

export function Header() {
  const { lang, setLang } = useLang();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editionsOpen, setEditionsOpen] = useState(false);
  const [cities, setCities] = useState<CityEntry[]>(DEFAULT_CITIES);
  const [cfg, setCfg] = useState<HotspotUIConfig>(DEFAULT_CONFIG);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const today = new Date().toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetchHotspotUIConfig().then((c) => {
      setCfg(c);
      if (c.editionCities && c.editionCities.length > 0) {
        setCities(c.editionCities);
      }
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEditionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const siteName = lang === "mr" ? "पंचनामा लक्षवेधी" : "SamacharHUB";
  const tagline = lang === "mr" ? "जनतेचा विश्वासू आवाज" : "The Voice of the PeoSHe";

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 border-b border-border text-xs text-muted-foreground">
          <span>{today}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              data-testid="lang-en"
            >
              English
            </button>
            <button
              onClick={() => setLang("mr")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                lang === "mr" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              data-testid="lang-mr"
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Masthead */}
        <div className="py-3 flex items-center gap-4">
          <Link href="/">
            <div className="cursor-pointer flex items-center gap-3">
              {cfg.logoUrl ? (
                <img
                  src={cfg.logoUrl}
                  alt={cfg.logoText || siteName}
                  className="h-10 md:h-14 w-auto max-w-[260px] object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div>
                  <h1
                    className="text-2xl md:text-4xl font-serif font-black text-primary tracking-tight leading-none"
                    data-testid="site-title"
                  >
                    {cfg.logoText || siteName}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5 tracking-widest uppercase">
                    {tagline}
                  </p>
                </div>
              )}
            </div>
          </Link>

          <button
            className="md:hidden ml-auto p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`${mobileOpen ? "block" : "hidden"} md:block border-t border-border bg-primary`}
        >
          <ul className="flex flex-col md:flex-row">
            <li>
              <Link href="/">
                <span
                  className={`block px-4 py-2.5 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    location === "/"
                      ? "bg-white text-primary"
                      : "text-white hover:bg-white/10"
                  }`}
                  data-testid="nav-home"
                  onClick={() => setMobileOpen(false)}
                >
                  {lang === "mr" ? "मुखपृष्ठ" : "Home"}
                </span>
              </Link>
            </li>

            <li className="relative" ref={dropdownRef}>
              <button
                onClick={() => setEditionsOpen((o) => !o)}
                className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors w-full md:w-auto"
                data-testid="nav-editions"
              >
                {lang === "mr" ? "आवृत्ती" : "Editions"}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${editionsOpen ? "rotate-180" : ""}`} />
              </button>
              {editionsOpen && (
                <div className="absolute left-0 top-full z-50 w-56 bg-white border border-border shadow-lg rounded-sm">
                  <div className="py-1">
                    <Link href="/">
                      <span
                        className="block px-4 py-2 text-sm hover:bg-muted cursor-pointer font-medium text-primary"
                        onClick={() => { setEditionsOpen(false); setMobileOpen(false); }}
                      >
                        {lang === "mr" ? "सर्व आवृत्त्या" : "All Editions"}
                      </span>
                    </Link>
                    <div className="border-t border-border my-1" />
                    {cities.map((c) => (
                      <Link key={c.en} href={`/?city=${encodeURIComponent(c.en)}`}>
                        <span
                          className="block px-4 py-2 text-sm hover:bg-muted cursor-pointer"
                          onClick={() => { setEditionsOpen(false); setMobileOpen(false); }}
                        >
                          {lang === "mr" ? c.mr : c.en}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>

            <li>
              <Link href="/about">
                <span
                  className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 whitespace-nowrap cursor-pointer transition-colors"
                  data-testid="nav-about"
                  onClick={() => setMobileOpen(false)}
                >
                  {lang === "mr" ? "आमच्या विषयी" : "About Us"}
                </span>
              </Link>
            </li>

            <li>
              <Link href="/contact">
                <span
                  className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 whitespace-nowrap cursor-pointer transition-colors"
                  data-testid="nav-contact"
                  onClick={() => setMobileOpen(false)}
                >
                  {lang === "mr" ? "संपर्क" : "Contact Us"}
                </span>
              </Link>
            </li>

            <li className="md:ml-auto">
              <Link href="/?browse=1">
                <span
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 whitespace-nowrap cursor-pointer transition-colors"
                  data-testid="nav-browse"
                  onClick={() => setMobileOpen(false)}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {lang === "mr" ? "दिनदर्शिका" : "Browse by Date"}
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
