'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/context';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound.title')}</h2>
      <p className="text-gray-500 mb-6">{t('notFound.description')}</p>
      <Link href="/" className="text-blue-600 hover:underline">
        {t('notFound.goHome')}
      </Link>
    </div>
  );
}
