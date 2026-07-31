'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchCategories, fetchTodayListings, fetchGovernorates, fetchAreas } from '@/lib/api';
import { CategoryCard } from '@/components/category-card';
import { StoreCard } from '@/components/store-card';
import type { FishCategory, Listing } from '@/lib/types';
import { Loader2, Store, Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '@/stores/locale';
import { useFilterDrawer } from '@/stores/filter-drawer';

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
  const [govs, setGovs] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [carouselOffset, setCarouselOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const LIMIT = 12;

  const availableCategories = categories;

  const filteredCategories = search
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  useEffect(() => {
    Promise.all([
      fetchCategories()
        .then((res) => setCategories(res.data || []))
        .catch(() => {}),
      fetchGovernorates()
        .then((res) => setGovs(res.data || []))
        .catch(() => {}),
    ]);
  }, []);

  useEffect(() => {
    if (selectedGovernorateId) {
      fetchAreas(selectedGovernorateId)
        .then((res) => setAreas(res.data || []))
        .catch(() => setAreas([]));
    } else {
      setAreas([]);
    }
  }, [selectedGovernorateId]);

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
        const params: any = { page: p, limit: LIMIT, sortBy: 'createdAt', sortOrder: 'asc' };
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

  const hasAreaFilter = !!selectedAreaId;

  useEffect(() => {
    setPage(1);
    if (selectedAreaId) {
      loadListings(1, selectedCategory, selectedCondition, selectedGovernorateId, selectedAreaId);
    } else {
      setLoading(false);
      setHasMore(false);
      setListings([]);
      setError(null);
    }
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

  function handleGovernorateChange(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('governorateId', id);
    } else {
      params.delete('governorateId');
    }
    params.delete('areaId');
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  function handleAreaChange(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('areaId', id);
    } else {
      params.delete('areaId');
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  const activeFilterCount = [
    selectedCategory,
    selectedCondition,
    selectedGovernorateId,
    selectedAreaId,
  ].filter(Boolean).length;

  const showingCategory = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  const { setOpen: setFilterOpen } = useFilterDrawer();

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const step = 140;
    const newOffset = dir === 'left' ? Math.max(0, carouselOffset - step) : carouselOffset + step;
    carouselRef.current.scrollTo({ left: newOffset, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 min-w-0">
      {/* ── Hero (desktop only) ── */}
      <div className="hidden lg:block relative h-36 sm:h-48 lg:h-64 -mx-3 sm:-mx-6 mb-4 sm:mb-8 overflow-hidden rounded-none sm:rounded-2xl">
        <img
          src="/assets/ship.webp"
          alt={t('home.heroAlt')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-900/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
            {t('home.heroTitle')}
          </h1>
          <p className="text-blue-100 mt-0.5 sm:mt-1 text-sm sm:text-base lg:text-lg drop-shadow">
            {t('home.heroSubtitle')}
          </p>
        </div>
      </div>

      {/* ── Mobile search + location + categories ── */}
      <div className="lg:hidden space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
            >
              Effacer
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => handleGovernorateChange(null)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              !selectedGovernorateId
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <MapPin className="h-3 w-3" />
            Toutes les villes
          </button>
          {govs.map((g: any) => (
            <button
              key={g.id}
              onClick={() => handleGovernorateChange(g.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors whitespace-nowrap ${
                selectedGovernorateId === g.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {selectedGovernorateId && (
          <select
            value={selectedAreaId || ''}
            onChange={(e) => handleAreaChange(e.target.value || null)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Zone</option>
            {areas.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">
            Nos Poissons ({availableCategories.length})
          </h2>
          {activeFilterCount > 0 && (
            <button onClick={() => router.push('/')} className="text-xs text-blue-600 font-medium">
              Voir tout
            </button>
          )}
        </div>
        <div className="relative flex items-center">
          <button
            onClick={() => scrollCarousel('left')}
            className="shrink-0 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm z-10 -mr-3"
          >
            <ChevronLeft className="h-4 w-4 text-blue-600" />
          </button>
          <div
            ref={carouselRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1 flex-1"
            onScroll={(e) => setCarouselOffset(e.currentTarget.scrollLeft)}
          >
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="shrink-0 w-28">
                <CategoryCard category={cat} onClick={handleSelectCategory} />
              </div>
            ))}
            {filteredCategories.length > 0 && (
              <button
                onClick={() => setFilterOpen(true)}
                className="shrink-0 w-20 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 py-4"
              >
                <ChevronRight className="h-5 w-5 text-blue-600" />
                <span className="text-[11px] font-semibold text-blue-600 mt-1">Voir plus</span>
              </button>
            )}
          </div>
          <button
            onClick={() => scrollCarousel('right')}
            className="shrink-0 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm z-10 -ml-3"
          >
            <ChevronRight className="h-4 w-4 text-blue-600" />
          </button>
        </div>
      </div>

      {!selectedCategory && !selectedCondition ? (
        <>
          <div className="hidden lg:block mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-black">
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Nos Poissons ({availableCategories.length})
              </p>
            </h1>
          </div>
          <div className="hidden lg:grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {availableCategories.slice(0, visibleCount).map((cat) => (
              <CategoryCard key={cat.id} category={cat} onClick={handleSelectCategory} />
            ))}
          </div>
          {visibleCount < availableCategories.length && (
            <div className="hidden lg:flex justify-center py-8">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                {t('home.more')}
              </button>
            </div>
          )}

          <div className="lg:hidden mt-6 space-y-3">
            <h2 className="text-sm font-bold text-gray-900">
              Nos poissoneries ({listings.length})
            </h2>
            {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}
            {!loading && listings.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {listings.map((listing) => (
                  <StoreCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
            {!loading && !hasAreaFilter && (
              <div className="text-center py-10 text-gray-400">
                <MapPin className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">{t('home.selectArea')}</p>
              </div>
            )}
            {!loading && hasAreaFilter && listings.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <Store className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">{t('home.noListings')}</p>
                <p className="text-xs mt-1">{t('home.tryDifferent')}</p>
              </div>
            )}
            {hasMore && !loading && listings.length > 0 && (
              <div className="flex justify-center py-4">
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
                  className="w-full px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm"
                >
                  {t('home.more')}
                </button>
              </div>
            )}
          </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {listings.map((listing) => (
                <StoreCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {!loading && !hasAreaFilter && (
            <div className="text-center py-12 sm:py-20 text-gray-400">
              <MapPin className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg">{t('home.selectArea')}</p>
            </div>
          )}

          {!loading && hasAreaFilter && listings.length === 0 && (
            <div className="text-center py-12 sm:py-20 text-gray-400">
              <Store className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg">{t('home.noListings')}</p>
              <p className="text-xs sm:text-sm mt-1">{t('home.tryDifferent')}</p>
            </div>
          )}

          {hasMore && !loading && listings.length > 0 && (
            <div className="flex justify-center py-6 sm:py-8">
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
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
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
