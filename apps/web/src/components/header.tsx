'use client';

import Link from 'next/link';
import { ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { useLocale } from '@/stores/locale';

interface Props {
  onOpenFilters?: () => void;
}

export function Header({ onOpenFilters }: Props) {
  const { itemCount, ready } = useCart();
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-500 border-b border-blue-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-20 flex items-center justify-between">
        <button
          onClick={onOpenFilters}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/25 text-white hover:bg-white/40 transition-colors backdrop-blur-sm text-sm font-semibold border border-white/20 shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm font-medium">Filtres</span>
        </button>

        <div className="hidden lg:flex-1 lg:flex lg:justify-center">
          <div className="text-center">
            <p className="text-sm sm:text-base leading-snug font-bold text-white">
              {t('header.tagline')}
            </p>
            <p className="text-xs text-white/70 mt-0.5">
              nous sommes disponible seulement à Sousse
            </p>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="text-center">
            <p className="text-xs leading-tight font-bold text-white">{t('header.tagline')}</p>
          </div>
        </div>

        <Link
          href="/cart"
          className="relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
        >
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline text-sm font-medium">{t('header.cart')}</span>
          {ready && itemCount > 0 && (
            <span className="absolute -top-1.5 ltr:-right-1.5 rtl:-left-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
