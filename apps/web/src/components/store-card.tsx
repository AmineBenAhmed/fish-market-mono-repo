'use client';

import { useRouter } from 'next/navigation';
import { Store, MapPin } from 'lucide-react';
import type { Listing } from '@/lib/types';

interface Props {
  listing: Listing;
}

export function StoreCard({ listing }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/listings/${listing.id}`)}
      className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 text-left w-full cursor-pointer active:scale-[0.98] sm:active:scale-100"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-cyan-50 relative overflow-hidden">
        {listing.seller.storeLogoUrl ? (
          <img
            src={listing.seller.storeLogoUrl}
            alt={listing.seller.storeName}
            className="w-full h-full object-contain p-4 sm:p-8 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Store className="h-12 w-12 sm:h-20 sm:w-20" />
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2">
        <h3 className="font-semibold text-gray-900 truncate text-xs sm:text-base">
          {listing.seller.storeName}
        </h3>
        {listing.category && (
          <p className="text-[11px] sm:text-xs text-gray-500 truncate">{listing.category.name}</p>
        )}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-400">
          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
          <span className="truncate">
            {listing.seller.city}
            {listing.seller.state ? `, ${listing.seller.state}` : ''}
          </span>
        </div>
        <div className="pt-0.5 sm:pt-1">
          <span className="text-sm sm:text-lg font-bold text-blue-600">
            {listing.currency} {Number(listing.effectivePrice ?? listing.price).toFixed(2)}
            {listing.unit ? (
              <span className="text-xs sm:text-sm font-normal text-gray-400">
                {' '}
                / {listing.unit}
              </span>
            ) : (
              ''
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
