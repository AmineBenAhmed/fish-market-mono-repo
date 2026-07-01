'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchCategories, fetchTodayListings, fetchListings } from '@/lib/api';
import { ListingCard } from '@/components/listing-card';
import { CategoryCard } from '@/components/category-card';
import { StoreCard } from '@/components/store-card';
import { Sidebar } from '@/components/sidebar';
import type { FishCategory, Listing } from '@/lib/types';
import { Loader2, Fish, Store } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState<FishCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const LIMIT = 50;

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const loadListings = useCallback(async (p: number, categoryId: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: p, limit: LIMIT };
      let res;
      if (categoryId) {
        params.categoryId = categoryId;
        res = await fetchListings(params);
      } else {
        params.sortOrder = 'asc';
        res = await fetchTodayListings(params);
      }
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
  }, []);

  useEffect(() => {
    loadListings(1, selectedCategory);
  }, [selectedCategory, loadListings]);

  function handleSelectCategory(id: string | null) {
    setSelectedCategory(id);
    setPage(1);
  }

  const showingCategory = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  return (
    <div className="flex gap-8">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <div className="flex-1 min-w-0">
        {!selectedCategory && (
          <div className="relative h-80 -mx-6 mb-8 overflow-hidden">
            <img
              src="/assets/ship.webp"
              alt="Fresh fish market"
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-900/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-8">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Fresh Fish Market</h1>
              <p className="text-blue-100 mt-1 text-lg drop-shadow">
                Sourced directly from local fishermen
              </p>
            </div>
          </div>
        )}

        {!selectedCategory && !loading && listings.length === 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} onClick={handleSelectCategory} />
              ))}
            </div>
          </>
        )}

        {selectedCategory && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {showingCategory?.name || 'Listings'}
            </h1>
            <p className="text-gray-500 mt-1">
              {listings.length} listing{listings.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}

        {!selectedCategory && listings.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-500">Today's freshest catches</p>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {selectedCategory && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <StoreCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {!selectedCategory && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {!loading && listings.length === 0 && selectedCategory && (
          <div className="text-center py-20 text-gray-400">
            <Store className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">No listings available in this category</p>
            <p className="text-sm mt-1">Try selecting a different category</p>
          </div>
        )}

        {hasMore && !loading && listings.length > 0 && (
          <div className="flex justify-center py-8">
            <button
              onClick={() => loadListings(page + 1, selectedCategory)}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
