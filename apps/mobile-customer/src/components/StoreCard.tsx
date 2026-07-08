import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Listing } from '@/types';

interface Props {
  listing: Listing;
  onPress: () => void;
}

export function StoreCard({ listing, onPress }: Props) {
  const seller = listing.seller;

  if (!seller) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {seller.storeLogoUrl ? (
          <Image source={{ uri: seller.storeLogoUrl }} style={styles.logo} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="storefront-outline" size={50} color="#d1d5db" />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.storeName} numberOfLines={1}>
          {seller.storeName}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color="#9ca3af" />
          <Text style={styles.locationText} numberOfLines={1}>
            {seller.city}
            {seller.state ? `, ${seller.state}` : ''}
          </Text>
        </View>
        <Text style={styles.price}>
          {listing.currency} {Number(listing.effectivePrice ?? listing.price).toFixed(2)}
          {listing.unit ? <Text style={styles.unit}> / {listing.unit}</Text> : null}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  imageContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: '#eff6ff',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 16,
    gap: 6,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
    marginTop: 4,
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
  },
});
