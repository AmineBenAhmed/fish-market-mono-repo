import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Locale, getTranslation, getDir, localeNames } from './translations';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  localeNames: Record<Locale, string>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale] = useState<Locale>('fr');

  function setLocale(_l: Locale) {
    // Locked to French — kept as noop for future use
  }

  function t(key: string): string {
    return getTranslation(key, locale);
  }

  const dir = getDir(locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, localeNames }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
