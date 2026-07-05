'use client';

import { useLocale } from '@/lib/i18n/context';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useLocale();
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('error.title')}</h2>
      <p className="text-gray-500 mb-6">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {t('error.tryAgain')}
      </button>
    </div>
  );
}
