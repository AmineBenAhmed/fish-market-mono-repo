import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

function getImageUrl(listing: Listing): string | null {
  if (listing.coverImage?.url) return buildImageUrl(listing.coverImage.url);
  if (listing.imageUrls?.length) return listing.imageUrls[0];
  if (listing.images?.length && listing.images[0].file?.url)
    return buildImageUrl(listing.images[0].file.url);
  return null;
}

interface Props {
  listing: Listing;
  onPress: () => void;
}

export function ListingCard({ listing, onPress }: Props) {
  const { t } = useLocale();
  const imageUrl = getImageUrl(listing);
  const categoryName = listing.category?.name || t('listing.general');
  const seller = listing.seller;

  if (!seller) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="fish-outline" size={40} color="#d1d5db" />
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryName}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.storeRow}>
          {seller.storeLogoUrl ? (
            <Image source={{ uri: seller.storeLogoUrl }} style={styles.storeLogo} />
          ) : (
            <Ionicons name="storefront-outline" size={14} color="#9ca3af" />
          )}
          <Text style={styles.storeName} numberOfLines={1}>
            {seller.storeName}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title || categoryName}
        </Text>
        {listing.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {listing.description}
          </Text>
        ) : null}
        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            {listing.currency} {Number(listing.effectivePrice ?? listing.price).toFixed(2)}
            {listing.unit ? <Text style={styles.priceUnit}> / {listing.unit}</Text> : null}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={11} color="#9ca3af" />
            <Text style={styles.locationText}>{seller.city}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  imageContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
  },
  info: {
    padding: 12,
    gap: 4,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeLogo: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  storeName: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563eb',
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9ca3af',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 10,
    color: '#9ca3af',
  },
});
