import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'en' | 'mr';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (en: string, mr: string) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('vidarbha_lang');
    return (saved === 'mr' || saved === 'en') ? saved : 'mr';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('vidarbha_lang', l);
  };

  const t = (enStr: string, mrStr: string) => {
    if (lang === 'mr' && mrStr) return mrStr;
    return enStr || mrStr;
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
