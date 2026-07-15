'use client';

import type { ReactNode } from 'react';
import { useLocale } from '@/stores/locale';

export function ClientLayout({ children }: { children: ReactNode }) {
  const { dir } = useLocale();

  return <div dir={dir}>{children}</div>;
}
