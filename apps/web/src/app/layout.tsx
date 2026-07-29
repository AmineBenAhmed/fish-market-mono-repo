import { ClientLayout } from '@/components/client-layout';
import './globals.css';

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-gray-900">
        <div className="fixed inset-0 -z-10">
          <img src="/assets/background.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/70" />
        </div>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
