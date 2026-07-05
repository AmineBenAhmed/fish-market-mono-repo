'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Locale, getTranslation, getDir, localeNames } from './translations';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  localeNames: Record<Locale, string>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'fishmarket_locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'fr' || stored === 'ar') {
      setLocaleState(stored);
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  function t(key: string): string {
    return getTranslation(key, locale);
  }

  const dir = getDir(locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, localeNames }}>
      <div dir={dir}>{children}</div>
    </I18nContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
