'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Fish, Store } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { useLocale } from '@/lib/i18n/context';

interface Props {
  listing: Listing;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

function getImageUrl(listing: Listing): string | null {
  if (listing.coverImage?.url) return `${API_URL}${listing.coverImage.url}`;
  if (listing.imageUrls?.length) return listing.imageUrls[0];
  if (listing.images?.length && listing.images[0].file?.url)
    return `${API_URL}${listing.images[0].file.url}`;
  return null;
}

export function ListingCard({ listing }: Props) {
  const router = useRouter();
  const { t } = useLocale();
  const imageUrl = getImageUrl(listing);
  const categoryName = listing.category?.name || t('listing.general');
  const storeLogo = listing.seller?.storeLogoUrl;

  return (
    <button
      onClick={() => router.push(`/listings/${listing.id}`)}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 text-left w-full cursor-pointer"
    >
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title || categoryName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Fish className="h-16 w-16" />
          </div>
        )}
        <div className="absolute top-2 ltr:left-2 rtl:right-2 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-1 rounded-full">
          {categoryName}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          {storeLogo ? (
            <img src={storeLogo} alt="" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <Store className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-500 truncate">{listing.seller.storeName}</span>
        </div>
        <h3 className="font-semibold text-gray-900 truncate">{listing.title || categoryName}</h3>
        {listing.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{listing.description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-blue-600">
            {listing.currency} {Number(listing.effectivePrice ?? listing.price).toFixed(2)}
            {listing.unit ? ` / ${listing.unit}` : ''}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3" />
            <span>{listing.seller.city}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
