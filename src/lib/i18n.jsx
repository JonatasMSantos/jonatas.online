import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DICT } from '@/data/content';

const KEY = 'lang';
const LangContext = createContext(null);

const initialLang = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {
    // storage bloqueado: segue para o idioma do navegador
  }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    const t = DICT[lang];
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.desc);
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      // sem persistência, tudo bem
    }
  }, [lang]);

  const toggle = useCallback(() => setLang(current => (current === 'pt' ? 'en' : 'pt')), []);
  const value = useMemo(() => ({ lang, t: DICT[lang], toggle, setLang }), [lang, toggle]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
