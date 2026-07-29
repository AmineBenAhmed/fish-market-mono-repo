'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Fish, Store } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { useLocale } from '@/stores/locale';

interface Props {
  listing: Listing;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://api.samak.tn';

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
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 text-left w-full cursor-pointer active:scale-[0.98] sm:active:scale-100"
    >
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title && listing.title !== 'New Listing' ? listing.title : categoryName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Fish className="h-10 w-10 sm:h-16 sm:w-16" />
          </div>
        )}
        <div className="absolute top-1.5 sm:top-2 ltr:left-1.5 sm:ltr:left-2 rtl:right-1.5 sm:rtl:right-2 bg-white/90 backdrop-blur-sm text-[10px] sm:text-xs font-bold text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
          {categoryName}
        </div>
      </div>
      <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {storeLogo ? (
            <img
              src={storeLogo}
              alt=""
              className="h-3.5 w-3.5 sm:h-5 sm:w-5 rounded-full object-cover"
            />
          ) : (
            <Store className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          )}
          <span className="text-[10px] sm:text-sm text-gray-500 truncate">
            {listing.seller.storeName}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 truncate text-xs sm:text-base">
          {listing.title && listing.title !== 'New Listing' ? listing.title : categoryName}
        </h3>
        {listing.description && (
          <p className="text-[10px] sm:text-sm text-gray-500 line-clamp-2">{listing.description}</p>
        )}
        <div className="flex items-center justify-between pt-0.5 sm:pt-1">
          <span className="text-sm sm:text-lg font-bold text-blue-600">
            {listing.currency} {Number(listing.effectivePrice ?? listing.price).toFixed(2)}
            {listing.unit ? ` / ${listing.unit}` : ''}
          </span>
          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-400">
            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">{listing.seller.city}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
