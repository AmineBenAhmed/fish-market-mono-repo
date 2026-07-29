import { Suspense, useState } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { MobileFilterDrawer } from '@/components/mobile-filter-drawer';
import { ClientLayout } from '@/components/client-layout';
import './globals.css';

export const dynamic = 'force-dynamic';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <ClientLayout>
      <Header onOpenFilters={() => setFilterOpen(true)} />
      <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} />
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
    </ClientLayout>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-gray-900">
        <div className="fixed inset-0 -z-10">
          <img src="/assets/background.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/70" />
        </div>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
