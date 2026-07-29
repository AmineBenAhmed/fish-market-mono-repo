'use client';

import { Suspense, type ReactNode } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { MobileFilterDrawer } from '@/components/mobile-filter-drawer';
import { FilterDrawerProvider, useFilterDrawer } from '@/stores/filter-drawer';
import { useLocale } from '@/stores/locale';

function LayoutInner({ children }: { children: ReactNode }) {
  const { dir } = useLocale();
  const { open, setOpen } = useFilterDrawer();

  return (
    <div dir={dir}>
      <Header />
      <MobileFilterDrawer open={open} onClose={() => setOpen(false)} />
      <div className="flex gap-4 sm:gap-8">
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <Suspense
            fallback={
              <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 sm:py-8">{children}</div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <FilterDrawerProvider>
      <LayoutInner>{children}</LayoutInner>
    </FilterDrawerProvider>
  );
}
