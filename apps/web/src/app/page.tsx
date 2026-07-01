'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchListings } from '@/lib/api';
import { ListingCard } from '@/components/listing-card';
import type { Listing } from '@/lib/types';
import { Loader2, Fish } from 'lucide-react';

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const LIMIT = 20;

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchListings({ page: p, limit: LIMIT });
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
    loadPage(1);
  }, [loadPage]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fresh Fish Market</h1>
        <p className="text-gray-500 mt-1">Browse the latest catches from local sellers</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {listings.length === 0 && !loading && !error && (
        <div className="text-center py-20 text-gray-400">
          <Fish className="h-16 w-16 mx-auto mb-4" />
          <p className="text-lg">No listings available yet</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center py-8">
          <button
            onClick={() => loadPage(page + 1)}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
