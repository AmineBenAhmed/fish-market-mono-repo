'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchListing, fetchSellerListings } from '@/lib/api';
import { useCart } from '@/stores/cart';
import type { Listing } from '@/lib/types';
import { useLocale } from '@/stores/locale';
import {
  Loader2,
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Fish,
  AlertTriangle,
  Package,
  Store,
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://api.samak.tn';

function getImages(listing: Listing): string[] {
  const urls: string[] = [];
  if (listing.coverImage?.url) urls.push(`${API_URL}${listing.coverImage.url}`);
  if (listing.imageUrls?.length) urls.push(...listing.imageUrls);
  if (listing.images?.length) {
    listing.images.forEach((img) => {
      if (img.file?.url) urls.push(`${API_URL}${img.file.url}`);
    });
  }
  if (urls.length === 0 && listing.seller?.storeLogoUrl) {
    urls.push(listing.seller.storeLogoUrl);
  }
  return urls;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { t } = useLocale();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sameStoreListings, setSameStoreListings] = useState<Listing[]>([]);
  const [sameStoreAdded, setSameStoreAdded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchListing(id)
      .then((res) => {
        const listingData = res.data as unknown as Listing;
        setListing(listingData);
        if (listingData.seller?.id) {
          fetchSellerListings(listingData.seller.id)
            .then((sellerRes) => {
              const otherListings =
                (sellerRes.data as any).listings?.filter((l: any) => l.id !== listingData.id) || [];
              setSameStoreListings(otherListings);
            })
            .catch(() => {});
        }
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
        <p className="text-gray-600">{error || t('listing.notFound')}</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          {t('listing.backToListings')}
        </Link>
      </div>
    );
  }

  const images = getImages(listing);
  const categoryName = listing.category?.name || t('listing.general');

  const decrement = () => setQuantity((q) => Math.max(0.1, q - 1));
  const increment = () => setQuantity((q) => q + 1);

  const handleAddToCart = () => {
    addItem({
      listingId: listing.id,
      quantity,
      title:
        listing.title && listing.title !== 'New Listing'
          ? listing.title
          : listing.category?.name || t('listing.general'),
      price: Number(listing.effectivePrice ?? listing.price),
      cleaningCost: Number(listing.cleaningCost ?? 0),
      cleaning: true,
      unit: listing.unit,
      currency: listing.currency,
      imageUrl: images[0] || null,
      storeName: listing.seller.storeName,
      sellerId: listing.seller.id,
      productName:
        listing.title && listing.title !== 'New Listing'
          ? listing.title
          : listing.category?.name || 'Fish',
      variantName: listing.variant?.name || '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-0 sm:px-0">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        {t('listing.back')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
        <div>
          <div className="aspect-square bg-gray-100 sm:rounded-2xl overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={
                  listing.title && listing.title !== 'New Listing' ? listing.title : categoryName
                }
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Fish className="h-16 w-16 sm:h-24 sm:w-24" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-2 sm:mt-3 overflow-x-auto pb-2 px-1">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                    selectedImage === i ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 -mx-3 sm:mx-0 sm:rounded-2xl">
          <div>
            <span className="text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              {categoryName}
            </span>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mt-2 sm:mt-3">
              {listing.title && listing.title !== 'New Listing' ? listing.title : categoryName}
            </h1>
            {listing.description && (
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                {listing.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            {listing.seller.storeLogoUrl ? (
              <img
                src={listing.seller.storeLogoUrl}
                alt=""
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover"
              />
            ) : (
              <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            <span>
              {listing.seller.storeName} &middot; {listing.seller.city}, {listing.seller.state}
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {listing.currency} {Number(listing.effectivePrice ?? listing.price).toFixed(2)}
            {listing.unit && (
              <span className="text-base sm:text-lg text-gray-400"> / {listing.unit}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm bg-gray-50 rounded-xl p-3 sm:p-4">
            {listing.origin && (
              <div>
                <span className="text-gray-400">{t('listing.origin')}</span>
                <p className="font-medium">{listing.origin}</p>
              </div>
            )}
            {listing.condition && (
              <div>
                <span className="text-gray-400">{t('listing.condition')}</span>
                <p className="font-medium capitalize">{listing.condition.toLowerCase()}</p>
              </div>
            )}
            {listing.averageWeight && (
              <div>
                <span className="text-gray-400">{t('listing.avgWeight')}</span>
                <p className="font-medium">
                  {listing.averageWeight} {t('listing.kg')}
                </p>
              </div>
            )}
            {listing.catchDate && (
              <div>
                <span className="text-gray-400">{t('listing.catchDate')}</span>
                <p className="font-medium">{new Date(listing.catchDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4 sm:pt-6 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-500">{t('listing.quantity')}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={decrement}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm sm:text-base"
                >
                  −
                </button>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0.1) setQuantity(v);
                  }}
                  className="w-14 sm:w-20 text-center text-sm font-medium border border-gray-200 rounded-lg py-1 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <button
                  onClick={increment}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm sm:text-base"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">{t('listing.total')}</span>
              <span className="font-semibold">
                {listing.currency}{' '}
                {(
                  (Number(listing.effectivePrice ?? listing.price) +
                    Number(listing.cleaningCost ?? 0)) *
                  quantity
                ).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-semibold text-base sm:text-lg transition-all ${
                added ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {added ? t('listing.addedToCart') : t('listing.addToCart')}
            </button>
          </div>
        </div>
      </div>

      {sameStoreListings.length > 0 && (
        <div className="border-t pt-6 sm:pt-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('listing.moreFrom')} {listing.seller.storeName}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {sameStoreListings.map((l) => {
              const justAdded = sameStoreAdded[l.id];

              const handleAdd = () => {
                const img = getImages(l);
                addItem({
                  listingId: l.id,
                  quantity: 1,
                  title:
                    l.title && l.title !== 'New Listing'
                      ? l.title
                      : l.category?.name || t('listing.general'),
                  price: Number(l.effectivePrice ?? l.price),
                  cleaningCost: Number(l.cleaningCost ?? 0),
                  cleaning: true,
                  unit: l.unit,
                  currency: l.currency,
                  imageUrl: img[0] || null,
                  storeName: l.seller.storeName,
                  sellerId: l.seller.id,
                  productName:
                    l.title && l.title !== 'New Listing' ? l.title : l.category?.name || 'Fish',
                  variantName: l.variant?.name || '',
                });
                setSameStoreAdded((prev) => ({ ...prev, [l.id]: true }));
                setTimeout(() => {
                  setSameStoreAdded((prev) => ({ ...prev, [l.id]: false }));
                }, 1500);
              };

              return (
                <div
                  key={l.id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                >
                  <Link href={`/listings/${l.id}`}>
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      {l.imageUrls?.length ? (
                        <img
                          src={l.imageUrls[0]}
                          alt={
                            l.title && l.title !== 'New Listing' ? l.title : l.category?.name || ''
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Fish className="h-8 w-8 sm:h-12 sm:w-12" />
                        </div>
                      )}
                      <div className="absolute top-1.5 sm:top-2 ltr:left-1.5 sm:ltr:left-2 rtl:right-1.5 sm:rtl:right-2 bg-white/90 backdrop-blur-sm text-[10px] sm:text-xs font-medium text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        {l.category?.name || t('listing.general')}
                      </div>
                    </div>
                  </Link>
                  <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                    <Link href={`/listings/${l.id}`}>
                      <h3 className="font-semibold text-gray-900 text-[11px] sm:text-sm truncate">
                        {l.title && l.title !== 'New Listing'
                          ? l.title
                          : l.category?.name || 'Fish'}
                      </h3>
                      <span className="text-xs sm:text-sm font-bold text-blue-600">
                        {l.currency} {Number(l.effectivePrice ?? l.price).toFixed(2)}
                        {l.unit ? `/${l.unit}` : ''}
                      </span>
                    </Link>
                    <button
                      onClick={handleAdd}
                      className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-sm font-semibold transition-all ${
                        justAdded
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {justAdded ? t('listing.added') : t('listing.add')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
