'use client';

import { Suspense } from 'react';
import { useLocale } from '@/stores/locale';
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
  const { dir } = useLocale();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-gray-900">
        <div className="fixed inset-0 -z-10">
          <img src="/assets/background.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/70" />
        </div>
        <div dir={dir}>
          <Header />
          <Suspense fallback={<div className="max-w-[1440px] mx-auto px-6 py-8">{children}</div>}>
            <LayoutContent>{children}</LayoutContent>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
