import React, { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'en' | 'mr' | 'hi';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (en?: string | null, mr?: string | null, hi?: string | null) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('vidarbha_lang');
    return (saved === 'mr' || saved === 'en' || saved === 'hi') ? (saved as Lang) : 'mr';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('vidarbha_lang', l);
  };

  const t = (enStr?: string | null, mrStr?: string | null, hiStr?: string | null) => {
    if (lang === 'hi') return hiStr || mrStr || enStr || '';
    if (lang === 'mr') return mrStr || hiStr || enStr || '';
    return enStr || hiStr || mrStr || '';
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
};
