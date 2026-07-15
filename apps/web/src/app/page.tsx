import { Suspense } from 'react';
import { HomePageContent } from './home-page-content';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
