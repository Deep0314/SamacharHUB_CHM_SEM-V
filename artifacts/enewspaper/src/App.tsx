import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider, useLang } from "@/lib/lang";
import "@/lib/auth";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { initTheme } from "@/lib/theme-config";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreakingNewsTicker } from "@/components/BreakingNewsTicker";
import { AdBanner, AdPopup } from "@/components/AdBanner";

import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import EditionPage from "@/pages/edition";
import ArticlePage from "@/pages/article";
import CategoryPage from "@/pages/category";
import NotFound from "@/pages/not-found";

import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminEditionsPage from "@/pages/admin/editions";
import EditionFormPage from "@/pages/admin/edition-form";
import AdminArticlesPage from "@/pages/admin/articles";
import ArticleFormPage from "@/pages/admin/article-form";
import AdminCategoriesPage from "@/pages/admin/categories";
import AdminBreakingNewsPage from "@/pages/admin/breaking-news";
import AdminMediaPage from "@/pages/admin/media";
import HotspotUIPage from "@/pages/admin/hotspot-ui";
import ThemePage from "@/pages/admin/theme";
import AdsPage from "@/pages/admin/ads";
import SiteSettingsPage from "@/pages/admin/site-settings";
import GeneralSettingsPage from "@/pages/admin/general";
import NotificationsPage from "@/pages/admin/notifications";
import ContactPage from "@/pages/contact";

import {
  listEditions,
  getListEditionsQueryKey,
  getEdition,
  getGetEditionQueryKey,
  getLatestArticles,
  getGetLatestArticlesQueryKey,
  getArticleBySlug,
  getGetArticleBySlugQueryKey,
  listArticles,
  getListArticlesQueryKey,
} from "@samacharhub/api-client-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

initTheme();

interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceMessageMr: string;
}

function MaintenancePage({ message, messageMr }: { message: string; messageMr: string }) {
  const { lang } = useLang();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-16 h-16 bg-primary rounded flex items-center justify-center mb-6">
        <span className="text-white text-2xl font-serif font-black">PL</span>
      </div>
      <h1 className="text-2xl font-serif font-black text-primary mb-2">SamacharHUB</h1>
      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
        {lang === "mr" ? messageMr : message}
      </p>
      <p className="mt-6 text-xs text-muted-foreground">We'll be back soon.</p>
    </div>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdPopup />
      <AdBanner position="banner-top" />
      <BreakingNewsTicker />
      <Header />
      <main className="flex-1">{children}</main>
      <AdBanner position="banner-bottom" />
      <Footer />
    </div>
  );
}

function PublicRoutes() {
  return (
    <Switch>
      <Route path="/">
        <PublicLayout><HomePage /></PublicLayout>
      </Route>
      <Route path="/edition/:id">
        <PublicLayout><EditionPage /></PublicLayout>
      </Route>
      <Route path="/article/:slug">
        <PublicLayout><ArticlePage /></PublicLayout>
      </Route>
      <Route path="/category/:slug">
        <PublicLayout><CategoryPage /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><AboutPage /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><ContactPage /></PublicLayout>
      </Route>

      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/editions" component={AdminEditionsPage} />
      <Route path="/admin/editions/new" component={EditionFormPage} />
      <Route path="/admin/editions/:id/edit" component={EditionFormPage} />
      <Route path="/admin/articles" component={AdminArticlesPage} />
      <Route path="/admin/articles/new" component={ArticleFormPage} />
      <Route path="/admin/articles/:id/edit" component={ArticleFormPage} />
      <Route path="/admin/categories" component={AdminCategoriesPage} />
      <Route path="/admin/breaking-news" component={AdminBreakingNewsPage} />
      <Route path="/admin/media" component={AdminMediaPage} />
      <Route path="/admin/hotspot-ui" component={HotspotUIPage} />
      <Route path="/admin/theme" component={ThemePage} />
      <Route path="/admin/ads" component={AdsPage} />
      <Route path="/admin/notifications" component={NotificationsPage} />
      <Route path="/admin/site-settings" component={SiteSettingsPage} />
      <Route path="/admin/general" component={GeneralSettingsPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function BootstrapWrapper({ children }: { children: React.ReactNode }) {
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const [maintenance, setMaintenance] = useState<SiteSettings | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        const settingsRes = await fetch("/api/settings");
        const settings = settingsRes.ok ? await settingsRes.json() : null;
        if (settings) {
          setMaintenance(settings);
          (window as any).__PREFETCHED_SETTINGS__ = settings;
        }

        const userLang = localStorage.getItem("user_lang_pref") || settings?.defaultLanguage || "en";
        const path = window.location.pathname;
        const promises: Promise<any>[] = [];

        if (path === "/" || path === "") {
          promises.push(
            queryClient.prefetchQuery({
              queryKey: getListEditionsQueryKey({ limit: 200 }),
              queryFn: () => listEditions({ limit: 200 }),
            })
          );
          promises.push(
            queryClient.prefetchQuery({
              queryKey: getGetLatestArticlesQueryKey({ lang: userLang, limit: 8 }),
              queryFn: () => getLatestArticles({ lang: userLang, limit: 8 }),
            })
          );
        } else if (path.startsWith("/edition/")) {
          const parts = path.split("/");
          const id = parts[parts.length - 1];
          if (id) {
            promises.push(
              queryClient.prefetchQuery({
                queryKey: getGetEditionQueryKey(id),
                queryFn: () => getEdition(id),
              })
            );
          }
          promises.push(
            queryClient.prefetchQuery({
              queryKey: getListEditionsQueryKey(),
              queryFn: () => listEditions(),
            })
          );
        } else if (path.startsWith("/article/")) {
          const parts = path.split("/");
          const slug = parts[parts.length - 1];
          if (slug) {
            promises.push(
              queryClient.prefetchQuery({
                queryKey: getGetArticleBySlugQueryKey(slug),
                queryFn: () => getArticleBySlug(slug),
              })
            );
          }
          promises.push(
            queryClient.prefetchQuery({
              queryKey: getGetLatestArticlesQueryKey({ lang: userLang, limit: 4 }),
              queryFn: () => getLatestArticles({ lang: userLang, limit: 4 }),
            })
          );
        } else if (path.startsWith("/category/")) {
          const parts = path.split("/");
          const slug = parts[parts.length - 1];
          if (slug) {
            promises.push(
              queryClient.prefetchQuery({
                queryKey: getListArticlesQueryKey({ category: slug, lang: userLang, page: 1, limit: 12 }),
                queryFn: () => listArticles({ category: slug, lang: userLang, page: 1, limit: 12 }),
              })
            );
          }
        }

        await Promise.allSettled(promises);
      } catch (err) {
        console.error("Bootstrap error:", err);
      } finally {
        setBootstrapReady(true);
      }
    }

    bootstrap();
  }, []);

  if (!bootstrapReady) {
    return <LoadingScreen />;
  }

  if (maintenance?.maintenanceMode && !window.location.pathname.startsWith("/admin")) {
    return (
      <LangProvider>
        <MaintenancePage
          message={maintenance.maintenanceMessage}
          messageMr={maintenance.maintenanceMessageMr}
        />
      </LangProvider>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BootstrapWrapper>
        <TooltipProvider>
          <LangProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <PublicRoutes />
            </WouterRouter>
            <Toaster />
          </LangProvider>
        </TooltipProvider>
      </BootstrapWrapper>
    </QueryClientProvider>
  );
}
