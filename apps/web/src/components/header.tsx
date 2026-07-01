'use client';

import Link from 'next/link';
import { ShoppingCart, Fish } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <Fish className="h-6 w-6" />
          FishMarket
        </Link>
        <Link
          href="/cart"
          className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Cart</span>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
