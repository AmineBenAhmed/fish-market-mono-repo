'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchListing } from '@/lib/api';
import { useCart } from '@/hooks/use-cart';
import { QuantityPicker } from '@/components/quantity-picker';
import type { Listing } from '@/lib/types';
import { Loader2, ArrowLeft, ShoppingCart, MapPin, Fish, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

function getImages(listing: Listing): string[] {
  const urls: string[] = [];
  if (listing.coverImage?.url) urls.push(`${API_URL}${listing.coverImage.url}`);
  if (listing.imageUrls?.length) urls.push(...listing.imageUrls);
  if (listing.images?.length) {
    listing.images.forEach((img) => {
      if (img.file?.url) urls.push(`${API_URL}${img.file.url}`);
    });
  }
  return urls;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchListing(id)
      .then((res) => {
        setListing(res.data as unknown as Listing);
        setQuantity(1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
        <p className="text-gray-600">{error || 'Listing not found'}</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to listings
        </Link>
      </div>
    );
  }

  const images = getImages(listing);
  const categoryName = listing.product?.category?.name || 'General';

  const handleAddToCart = () => {
    addItem({
      listingId: listing.id,
      quantity,
      title: listing.title || listing.product.name,
      price: Number(listing.price),
      unit: listing.unit,
      currency: listing.currency,
      imageUrl: images[0] || null,
      storeName: listing.seller.storeName,
      productName: listing.product.name,
      variantName: listing.variant?.name || '',
      maxQuantity: listing.quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={listing.title || listing.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Fish className="h-24 w-24" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {categoryName}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">
              {listing.title || listing.product.name}
            </h1>
            {listing.description && <p className="text-gray-600 mt-2">{listing.description}</p>}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>
              {listing.seller.storeName} - {listing.seller.city}, {listing.seller.state}
            </span>
          </div>

          <div className="text-3xl font-bold text-blue-600">
            {listing.currency} {Number(listing.price).toFixed(2)}
            {listing.unit && <span className="text-lg text-gray-400"> / {listing.unit}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {listing.origin && (
              <div>
                <span className="text-gray-400">Origin</span>
                <p className="font-medium">{listing.origin}</p>
              </div>
            )}
            {listing.condition && (
              <div>
                <span className="text-gray-400">Condition</span>
                <p className="font-medium capitalize">{listing.condition.toLowerCase()}</p>
              </div>
            )}
            {listing.averageWeight && (
              <div>
                <span className="text-gray-400">Avg. Weight</span>
                <p className="font-medium">{listing.averageWeight} kg</p>
              </div>
            )}
            <div>
              <span className="text-gray-400">Available</span>
              <p className="font-medium">
                {listing.quantity} {listing.unit}
              </p>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Quantity</span>
              <QuantityPicker value={quantity} max={listing.quantity} onChange={setQuantity} />
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-lg transition-all ${
                added ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
