import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

type Lang = "en" | "mr";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string | null | undefined, mr: string | null | undefined) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (en) => en ?? "",
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(() => {
    const pref = localStorage.getItem("user_lang_pref") as Lang;
    if (pref) return pref;
    const prefetched = (window as any).__PREFETCHED_SETTINGS__;
    if (prefetched?.defaultLanguage) {
      return prefetched.defaultLanguage as Lang;
    }
    return null;
  });
  const [ready, setReady] = useState(() => {
    return !!lang || !!(window as any).__PREFETCHED_SETTINGS__;
  });

  useEffect(() => {
    if (ready) return;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.defaultLanguage) {
          if (!localStorage.getItem("user_lang_pref")) {
            setLangState(data.defaultLanguage as Lang);
          }
        } else if (!lang) {
          setLangState("en");
        }
        setReady(true);
      })
      .catch(() => {
        if (!lang) setLangState("en");
        setReady(true);
      });
  }, [lang, ready]);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("user_lang_pref", l);
  }

  function t(en: string | null | undefined, mr: string | null | undefined): string {
    if (lang === "mr" && mr) return mr;
    return en ?? "";
  }

  if (!ready || !lang) return <LoadingScreen />;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
