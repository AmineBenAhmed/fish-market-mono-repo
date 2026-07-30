'use client';

import Link from 'next/link';
import { ShoppingCart, Phone } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { useLocale } from '@/stores/locale';

export function Header() {
  const { itemCount, ready } = useCart();
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-500 border-b border-blue-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-20 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <img
            src="/assets/samak-logo.jpeg"
            alt="SAMAK"
            className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl object-cover"
          />
        </Link>

        <div className="text-center flex-1 min-w-0 px-2">
          <p className="text-[10px] sm:text-sm leading-tight font-bold text-white truncate">
            {t('header.tagline')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {process.env.NEXT_PUBLIC_CONTACT_PHONE && (
            <a
              href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <Phone className="h-4 w-4" />
              <span className="text-[10px] sm:text-sm whitespace-nowrap">
                {process.env.NEXT_PUBLIC_CONTACT_PHONE}
              </span>
            </a>
          )}
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
      </div>
    </header>
  );
}
