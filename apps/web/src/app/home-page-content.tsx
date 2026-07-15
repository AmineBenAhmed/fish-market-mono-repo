'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchCategories, fetchTodayListings } from '@/lib/api';
import { CategoryCard } from '@/components/category-card';
import { StoreCard } from '@/components/store-card';
import type { FishCategory, Listing } from '@/lib/types';
import { Loader2, Store } from 'lucide-react';
import { useLocale } from '@/stores/locale';

export function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const selectedCategory = searchParams.get('category');
  const selectedCondition = searchParams.get('condition');
  const selectedGovernorateId = searchParams.get('governorateId');
  const selectedAreaId = searchParams.get('areaId');
  const [categories, setCategories] = useState<FishCategory[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const LIMIT = 12;

  const listedCategoryIds = useMemo(() => {
    return new Set(listings.map((l) => l.category?.id).filter(Boolean));
  }, [listings]);

  const availableCategories = selectedGovernorateId
    ? categories.filter((c) => !loading && listedCategoryIds.has(c.id))
    : categories;

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, selectedCondition, selectedGovernorateId, selectedAreaId]);

  const loadListings = useCallback(
    async (
      p: number,
      categoryId: string | null,
      condition: string | null,
      governorateId?: string | null,
      areaId?: string | null,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params: any = { page: p, limit: LIMIT };
        if (governorateId) params.governorateId = governorateId;
        if (areaId) params.areaId = areaId;
        if (categoryId) params.categoryId = categoryId;
        if (condition) params.condition = condition;
        const res = await fetchTodayListings(params);
        const payload = res.data.data;
        if (p === 1) {
          setListings(payload);
        } else {
          setListings((prev) => [...prev, ...payload]);
        }
        setHasMore(res.data.meta.hasNextPage);
        setPage(p);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    loadListings(1, selectedCategory, selectedCondition, selectedGovernorateId, selectedAreaId);
  }, [selectedCategory, selectedCondition, selectedGovernorateId, selectedAreaId, loadListings]);

  function handleSelectCategory(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('category', id);
    } else {
      params.delete('category');
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  const showingCategory = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  return (
    <div className="flex-1 min-w-0">
      <div className="relative h-64 -mx-6 mb-8 overflow-hidden rounded-2xl">
        <img
          src="/assets/ship.webp"
          alt={t('home.heroAlt')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-900/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">{t('home.heroTitle')}</h1>
          <p className="text-blue-100 mt-1 text-lg drop-shadow">{t('home.heroSubtitle')}</p>
        </div>
      </div>

      {!selectedCategory && !selectedCondition && !selectedAreaId ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black">
              <p className="text-gray-500 mt-1">Nos Poissons ({availableCategories.length})</p>
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableCategories.slice(0, visibleCount).map((cat) => (
              <CategoryCard key={cat.id} category={cat} onClick={handleSelectCategory} />
            ))}
          </div>
          {visibleCount < availableCategories.length && (
            <div className="flex justify-center py-8">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                {t('home.more')}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {showingCategory?.name || (
                <p>
                  <strong>Nos poissoneries</strong> ({listings.length})
                </p>
              )}
            </h1>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <StoreCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Store className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">{t('home.noListings')}</p>
              <p className="text-sm mt-1">{t('home.tryDifferent')}</p>
            </div>
          )}

          {hasMore && !loading && listings.length > 0 && (
            <div className="flex justify-center py-8">
              <button
                onClick={() =>
                  loadListings(
                    page + 1,
                    selectedCategory,
                    selectedCondition,
                    selectedGovernorateId,
                    selectedAreaId,
                  )
                }
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                {t('home.more')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
