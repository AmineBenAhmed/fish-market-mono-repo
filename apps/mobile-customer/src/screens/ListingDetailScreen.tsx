import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchListing, fetchSellerListings } from '@/services/api';
import { useCart } from '@/stores/cart';
import { ListingCard } from '@/components/ListingCard';
import type { Listing } from '@/types';
import { useLocale } from '@/i18n/context';

function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function buildImageUrl(path: string): string {
  if (isAbsoluteUrl(path)) return path;
  const base = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(
    '/api/v1',
    '',
  );
  return `${base}${path}`;
}

function getImages(listing: Listing): string[] {
  const urls: string[] = [];
  if (listing.coverImage?.url) urls.push(buildImageUrl(listing.coverImage.url));
  if (listing.imageUrls?.length) urls.push(...listing.imageUrls);
  if (listing.images?.length) {
    listing.images.forEach((img) => {
      if (img.file?.url) urls.push(buildImageUrl(img.file.url));
    });
  }
  if (urls.length === 0 && listing.seller?.storeLogoUrl) {
    urls.push(listing.seller.storeLogoUrl);
  }
  return urls;
}

interface ListingDetailScreenProps {
  listingId: string;
  onBack: () => void;
  onNavigateToListing: (id: string) => void;
}

export function ListingDetailScreen({
  listingId,
  onBack,
  onNavigateToListing,
}: ListingDetailScreenProps) {
  const { addItem } = useCart();
  const { t } = useLocale();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sameStoreListings, setSameStoreListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    fetchListing(listingId)
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
  }, [listingId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#f87171" />
        <Text style={styles.errorText}>{error || t('listing.notFound')}</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>{t('listing.backToListings')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const seller = listing.seller;
  const images = getImages(listing);
  const categoryName = listing.category?.name || t('listing.general');

  const handleAddToCart = () => {
    addItem({
      listingId: listing.id,
      quantity: 1,
      title: listing.title || listing.category?.name || t('listing.general'),
      price: Number(listing.effectivePrice ?? listing.price),
      cleaningCost: Number(listing.cleaningCost ?? 0),
      cleaning,
      unit: listing.unit,
      currency: listing.currency,
      imageUrl: images[0] || null,
      storeName: seller?.storeName || '',
      productName: listing.title || listing.category?.name || 'Fish',
      variantName: listing.variant?.name || '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const subtotal =
    Number(listing.effectivePrice ?? listing.price) +
    (cleaning ? Number(listing.cleaningCost ?? 0) : 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color="#6b7280" />
        <Text style={styles.backText}>{t('listing.back')}</Text>
      </TouchableOpacity>

      <View style={styles.imageSection}>
        <View style={styles.mainImage}>
          {images.length > 0 ? (
            <Image
              source={{ uri: images[selectedImage] }}
              style={styles.mainImageContent}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="fish-outline" size={80} color="#d1d5db" />
            </View>
          )}
        </View>
        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnails}>
            {images.map((url, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedImage(i)}
                style={[styles.thumbnail, selectedImage === i && styles.thumbnailActive]}
              >
                <Image source={{ uri: url }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.headerRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryName}</Text>
          </View>
        </View>
        <Text style={styles.title}>{listing.title || categoryName}</Text>
        {listing.description ? <Text style={styles.description}>{listing.description}</Text> : null}

        {seller ? (
          <View style={styles.sellerRow}>
            <Ionicons name="storefront-outline" size={16} color="#6b7280" />
            <Text style={styles.sellerText}>
              {seller.storeName} &middot; {seller.city},{seller.state}
            </Text>
          </View>
        ) : null}

        <Text style={styles.price}>
          {listing.currency} {Number(listing.effectivePrice ?? listing.price).toFixed(2)}
          {listing.unit ? <Text style={styles.priceUnit}> / {listing.unit}</Text> : null}
        </Text>

        <View style={styles.detailsGrid}>
          {listing.origin ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('listing.origin')}</Text>
              <Text style={styles.detailValue}>{listing.origin}</Text>
            </View>
          ) : null}
          {listing.condition ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('listing.condition')}</Text>
              <Text style={[styles.detailValue, styles.capitalize]}>
                {listing.condition.toLowerCase()}
              </Text>
            </View>
          ) : null}
          {listing.averageWeight ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('listing.avgWeight')}</Text>
              <Text style={styles.detailValue}>
                {listing.averageWeight} {t('listing.kg')}
              </Text>
            </View>
          ) : null}

          {listing.catchDate ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('listing.catchDate')}</Text>
              <Text style={styles.detailValue}>
                {new Date(listing.catchDate).toLocaleDateString()}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity onPress={() => setCleaning(!cleaning)} style={styles.cleaningRow}>
            <View style={[styles.checkbox, cleaning && styles.checkboxActive]}>
              {cleaning ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
            </View>
            <View style={styles.cleaningTextContainer}>
              <Text style={styles.cleaningLabel}>{t('listing.cleanFish')}</Text>
              <Text style={styles.cleaningCost}>
                +{listing.currency} {Number(listing.cleaningCost ?? 0).toFixed(2)} / {listing.unit}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>{t('listing.subtotal')}</Text>
            <Text style={styles.subtotalValue}>
              {listing.currency} {subtotal.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            style={[styles.addButton, added && styles.addButtonSuccess]}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>
              {added ? t('listing.addedToCart') : t('listing.addToCart')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {sameStoreListings.length > 0 && (
        <View style={styles.moreSection}>
          <Text style={styles.moreTitle}>
            {t('listing.moreFrom')} {seller?.storeName || ''}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.moreListings}>
              {sameStoreListings.map((l) => (
                <View key={l.id} style={styles.moreListingItem}>
                  <ListingCard listing={l} onPress={() => onNavigateToListing(l.id)} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  errorText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  backLink: {
    color: '#2563eb',
    fontSize: 15,
    marginTop: 16,
    textDecorationLine: 'underline',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 16,
  },
  backText: {
    color: '#6b7280',
    fontSize: 14,
  },
  imageSection: {
    paddingHorizontal: 16,
  },
  mainImage: {
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainImageContent: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnails: {
    marginTop: 12,
    marginBottom: 8,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginRight: 8,
  },
  thumbnailActive: {
    borderColor: '#2563eb',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  details: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#2563eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sellerText: {
    fontSize: 13,
    color: '#6b7280',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 20,
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9ca3af',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    marginBottom: 20,
  },
  detailItem: {
    width: '45%',
    flexGrow: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cleaningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  cleaningTextContainer: {
    flex: 1,
  },
  cleaningLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  cleaningCost: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  subtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonSuccess: {
    backgroundColor: '#22c55e',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  moreSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  moreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  moreListings: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  moreListingItem: {
    width: 220,
  },
});
