'use client';

import { create } from 'zustand';

import { type Locale, getTranslation, getDir, localeNames } from '@/lib/i18n/translations';

interface LocaleState {
  locale: Locale;
}

const useLocaleStore = create<LocaleState>(() => ({
  locale: 'fr',
}));

function useLocale() {
  const locale = useLocaleStore((s) => s.locale);

  function setLocale(_l: Locale) {
    // Locked to French — kept as noop for future use
  }

  function t(key: string): string {
    return getTranslation(key, locale);
  }

  const dir = getDir(locale);

  return { locale, setLocale, t, dir, localeNames };
}

export { useLocale, useLocaleStore };
