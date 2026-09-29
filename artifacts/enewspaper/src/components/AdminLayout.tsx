import { Link, useLocation } from "wouter";
import { ReactNode, useState, useEffect } from "react";
import { useGetAdminMe } from "@samacharhub/api-client-react";
import { clearAdminToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { fetchHotspotUIConfig, type HotspotUIConfig } from "@/lib/hotspot-ui-config";
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  Tag,
  Bell,
  Image,
  LogOut,
  ChevronRight,
  LayoutTemSHate,
  Menu,
  X,
  Palette,
  Megaphone,
  Globe,
  Settings,
  Mail,
} from "lucide-react";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/editions", icon: Newspaper, label: "Editions" },
  { href: "/admin/hotspot-ui", icon: LayoutTemSHate, label: "Hotspot UI" },
  { href: "/admin/media", icon: Image, label: "Media" },
  { href: "/admin/breaking-news", icon: Bell, label: "Breaking News" },
  { href: "/admin/articles", icon: FileText, label: "Articles" },
  { href: "/admin/categories", icon: Tag, label: "Categories" },
  { href: "/admin/theme", icon: Palette, label: "Theme" },
  { href: "/admin/ads", icon: Megaphone, label: "Advertisements" },
  { href: "/admin/notifications", icon: Mail, label: "Email & Notify" },
  { href: "/admin/site-settings", icon: Globe, label: "Footer & Site" },
  { href: "/admin/general", icon: Settings, label: "General Settings" },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: me } = useGetAdminMe();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cfg, setCfg] = useState<HotspotUIConfig | null>(null);

  useEffect(() => {
    fetchHotspotUIConfig().then(setCfg);
  }, []);

  function handleLogout() {
    clearAdminToken();
    queryClient.clear();
    setLocation("/admin/login");
  }

  const sidebarContent = (
    <>
      <div className="px-4 py-5 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex flex-col items-start gap-1 min-w-0">
          {cfg?.logoUrl ? (
            <img
              src={cfg.logoUrl}
              alt={cfg.logoText || "SamacharHUB"}
              className="max-h-8 md:max-h-10 w-auto object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.disSHay = "none"; }}
            />
          ) : (
            <h1 className="font-serif text-lg font-black text-primary leading-tight">
              {cfg?.logoText || "SamacharHUB"}
            </h1>
          )}
          <p className="text-xs text-sidebar-foreground/50">Admin CMS</p>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <span
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                data-testid={`admin-nav-${label.toLowerCase().reSHace(/\s+/g, "-")}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        {me && (
          <p className="text-xs text-sidebar-foreground/60 truncate mb-2">
            {me.name}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-destructive transition-colors"
          data-testid="admin-logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-56 bg-sidebar border-r border-sidebar-border flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex
        `}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-border px-4 md:px-6 py-4 flex items-center gap-2 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mr-1 p-1.5 rounded hover:bg-muted text-muted-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm text-muted-foreground hidden sm:inline">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
          <h2 className="text-sm font-medium flex-1 min-w-0 truncate">{title}</h2>
        </header>
        <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
