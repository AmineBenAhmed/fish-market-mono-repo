'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const CartProvider = dynamic<{ children: ReactNode }>(
  () => import('@/hooks/use-cart').then((m) => m.CartProvider),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
