import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/stores/cart';
import { useLocale } from '@/i18n/context';
import type { Locale } from '@/i18n/translations';

const languages: { key: Locale; label: string }[] = [
  { key: 'fr', label: 'FR' },
  { key: 'en', label: 'EN' },
  { key: 'ar', label: 'AR' },
];

interface HeaderProps {
  onCartPress: () => void;
}

export function Header({ onCartPress }: HeaderProps) {
  const { itemCount, ready } = useCart();
  const { t, locale, setLocale } = useLocale();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.key}
              onPress={() => setLocale(lang.key)}
              style={[styles.langButton, locale === lang.key && styles.langButtonActive]}
            >
              <Text style={[styles.langText, locale === lang.key && styles.langTextActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
          <Ionicons name="cart-outline" size={20} color="#fff" />
          {ready && itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Text style={styles.tagline} numberOfLines={1} ellipsizeMode="tail">
          {t('header.tagline')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1d4ed8',
    paddingTop: 50,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 28,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  langButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langButtonActive: {
    backgroundColor: '#fff',
  },
  langText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  langTextActive: {
    color: '#1d4ed8',
  },
  cartButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  center: {
    paddingHorizontal: 12,
    paddingTop: 4,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});
