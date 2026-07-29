'use client';

import { useState, Suspense, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { MobileFilterDrawer } from '@/components/mobile-filter-drawer';
import { SlidersHorizontal } from 'lucide-react';
import { useLocale } from '@/stores/locale';

function FilterFloatingButton({ onClick }: { onClick: () => void }) {
  const searchParams = useSearchParams();
  const activeCount = [
    searchParams.get('category'),
    searchParams.get('condition'),
    searchParams.get('governorateId'),
    searchParams.get('areaId'),
  ].filter(Boolean).length;

  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 ltr:right-6 rtl:left-6 z-30 flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all duration-200"
    >
      <SlidersHorizontal className="h-5 w-5" />
      <span className="font-semibold text-sm">Filtres</span>
      {activeCount > 0 && (
        <span className="bg-white text-blue-700 text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
          {activeCount}
        </span>
      )}
    </button>
  );
}

export function ClientLayout({ children }: { children: ReactNode }) {
  const { dir } = useLocale();
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div dir={dir}>
      <Header onOpenFilters={() => setFilterOpen(true)} />
      <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} />
      <Suspense fallback={null}>
        <FilterFloatingButton onClick={() => setFilterOpen(true)} />
      </Suspense>
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
