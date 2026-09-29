import { useState, useEffect } from "react";
import { useLang } from "@/lib/lang";
import { FileText, Loader2 } from "lucide-react";

const API = "/api";

interface AboutSettings {
  aboutContent: string;
  aboutContentMr: string;
}

export default function AboutPage() {
  const { lang } = useLang();
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setSettings(d); })
      .finally(() => setLoading(false));
  }, []);

  const content = lang === "mr" 
    ? (settings?.aboutContentMr || "माहिती लवकरच जोडली जाईल.") 
    : (settings?.aboutContent || "Content coming soon.");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-serif text-4xl font-black text-foreground">
          {lang === "mr" ? "आमच्या विषयी" : "About Us"}
        </h1>
        <div className="h-1.5 w-20 bg-primary mx-auto mt-4 rounded-full" />
      </div>

      <div className="bg-white border border-border rounded-sm p-8 md:p-12 shadow-sm">
        <div className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
      
      <div className="mt-12 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} SamacharHUB. All rights reserved.</p>
      </div>
    </div>
  );
}
