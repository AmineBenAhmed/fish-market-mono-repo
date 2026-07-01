'use client';

import { CartProvider } from '@/hooks/use-cart';
import { Header } from '@/components/header';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900">
        <div className="fixed inset-0 -z-10">
          <img src="/assets/sea.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/70" />
        </div>
        <CartProvider>
          <Header />
          <main className="max-w-[1440px] mx-auto px-6 py-8">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
