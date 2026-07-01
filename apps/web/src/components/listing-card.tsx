import Link from 'next/link';
import { MapPin, Fish } from 'lucide-react';
import type { Listing } from '@/lib/types';

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
  const imageUrl = getImageUrl(listing);
  const categoryName = listing.product?.category?.name || 'General';

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200"
    >
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title || listing.product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Fish className="h-16 w-16" />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-1 rounded-full">
          {categoryName}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 truncate">
          {listing.title || listing.product.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>{listing.seller.storeName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            {listing.currency} {Number(listing.price).toFixed(2)}
            {listing.unit ? ` / ${listing.unit}` : ''}
          </span>
          {listing.averageWeight && (
            <span className="text-xs text-gray-400">~{listing.averageWeight}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
