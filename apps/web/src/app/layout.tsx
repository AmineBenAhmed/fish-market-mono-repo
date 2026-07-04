'use client';

import { Suspense } from 'react';
import { CartProvider } from '@/hooks/use-cart';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { useCategories } from '@/hooks/use-categories';
import './globals.css';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const categories = useCategories();

  return (
    <div className="flex gap-8">
      <Sidebar categories={categories} />
      <main className="flex-1 min-w-0 max-w-[1440px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900">
        <div className="fixed inset-0 -z-10">
          <img src="/assets/background.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/70" />
        </div>
        <CartProvider>
          <Header />
          <Suspense fallback={<div className="max-w-[1440px] mx-auto px-6 py-8">{children}</div>}>
            <LayoutContent>{children}</LayoutContent>
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
