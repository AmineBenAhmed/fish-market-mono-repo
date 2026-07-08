'use client';

import Link from 'next/link';
import { ShoppingCart, Languages } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useLocale } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/translations';

const languages: { key: Locale; label: string }[] = [
  { key: 'fr', label: 'FR' },
  { key: 'en', label: 'EN' },
  { key: 'ar', label: 'AR' },
];

export function Header() {
  const { itemCount, ready } = useCart();
  const { t, locale, setLocale } = useLocale();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-500 border-b border-blue-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-center relative">
        <div className="flex items-center gap-2 absolute ltr:left-4 rtl:right-4 hidden">
          <Languages className="h-4 w-4 text-white/70" />
          {languages.map((lang) => (
            <button
              key={lang.key}
              onClick={() => setLocale(lang.key)}
              className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                locale === lang.key
                  ? 'bg-white text-blue-700'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm sm:text-base leading-snug font-bold text-white">
            {t('header.tagline')}
          </p>
          <p className="text-xs text-white/70 mt-0.5">nous sommes disponible seulement à Sousse</p>
        </div>

        <Link
          href="/cart"
          className="absolute ltr:right-4 rtl:left-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">{t('header.cart')}</span>
          {ready && itemCount > 0 && (
            <span className="absolute -top-1 ltr:-right-1 rtl:-left-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
