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
import { useCart } from '@/stores/cart';
import { CheckoutModal } from '@/components/CheckoutModal';
import { createOrder } from '@/services/api';
import { useLocale } from '@/i18n/context';

interface CartScreenProps {
  onNavigateHome: () => void;
}

export function CartScreen({ onNavigateHome }: CartScreenProps) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const { items, total, itemCount, updateQuantity, removeItem, toggleCleaning, clearCart } =
    useCart();
  const { t } = useLocale();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async (data: {
    name: string;
    phone: string;
    address: string;
    governorateId?: string;
    areaId?: string;
    zoneId?: string;
    street?: string;
    buildingNumber?: string;
    apartment?: string;
    floor?: string;
    landmark?: string;
  }) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        customerName: data.name,
        customerPhone: data.phone,
        customerAddress: data.address,
        governorateId: data.governorateId,
        areaId: data.areaId,
        zoneId: data.zoneId,
        street: data.street,
        buildingNumber: data.buildingNumber,
        apartment: data.apartment,
        floor: data.floor,
        landmark: data.landmark,
        items: items.map((i) => ({
          listingId: i.listingId,
          quantity: i.quantity,
          cleaning: i.cleaning,
        })),
      };
      await createOrder(payload);
      clearCart();
      setSuccess(true);
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="fish-outline" size={36} color="#16a34a" />
        </View>
        <Text style={styles.successTitle}>{t('cart.orderPlaced')}</Text>
        <Text style={styles.successText}>{t('cart.thankYou')}</Text>
        <TouchableOpacity onPress={onNavigateHome} style={styles.primaryButton}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>{t('cart.continueShopping')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
        <Text style={styles.emptySubtitle}>{t('cart.addSomeFish')}</Text>
        <TouchableOpacity onPress={onNavigateHome} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{t('cart.browseListings')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const cleaningFee = items.reduce((s, i) => s + (i.cleaning ? i.cleaningCost * i.quantity : 0), 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t('cart.shoppingCart')}</Text>
          <Text style={styles.headerCount}>
            {itemCount} {t('cart.items')}
          </Text>
        </View>

        <View style={styles.itemsList}>
          {items.map((item) => (
            <View key={`${item.listingId}-${item.cleaning}`} style={styles.cartItem}>
              <View style={styles.itemImage}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImageContent} />
                ) : (
                  <Ionicons name="fish-outline" size={28} color="#d1d5db" />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemStore}>{item.storeName}</Text>
                <Text style={styles.itemPrice}>
                  {item.currency} {item.price.toFixed(2)} / {item.unit}
                </Text>
                {item.cleaningCost > 0 && (
                  <TouchableOpacity
                    onPress={() => toggleCleaning(item.listingId, item.cleaning)}
                    style={styles.cleaningToggle}
                  >
                    <View
                      style={[
                        styles.cleaningCheckbox,
                        item.cleaning && styles.cleaningCheckboxActive,
                      ]}
                    >
                      {item.cleaning && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text
                      style={[
                        styles.cleaningToggleText,
                        item.cleaning && styles.cleaningToggleTextActive,
                      ]}
                    >
                      {t('cart.cleaning')}: +{item.currency} {item.cleaningCost.toFixed(2)} /{' '}
                      {item.unit}
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={styles.itemActions}>
                  <Text style={styles.itemTotal}>
                    {(
                      item.price * item.quantity +
                      (item.cleaning ? item.cleaningCost * item.quantity : 0)
                    ).toFixed(2)}{' '}
                    {item.currency}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.listingId, item.cleaning)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
            <Text style={styles.summaryValue}>
              {items[0]?.currency || 'TND'} {subtotal.toFixed(2)}
            </Text>
          </View>
          {cleaningFee > 0 && (
            <View style={[styles.summaryRow, styles.cleaningRow]}>
              <Text style={styles.cleaningLabel}>{t('cart.cleaningFee')}</Text>
              <Text style={styles.cleaningValue}>
                {items[0]?.currency || 'TND'} {cleaningFee.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>
              {items[0]?.currency || 'TND'} {total.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.checkoutButton}>
            <Text style={styles.checkoutText}>{t('cart.proceedToCheckout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CheckoutModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError(null);
        }}
        onSubmit={handleCheckout}
        error={error}
        loading={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  headerCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemsList: {
    gap: 12,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImageContent: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemStore: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  cleaningToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cleaningCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleaningCheckboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  cleaningToggleText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  cleaningToggleTextActive: {
    color: '#16a34a',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    minWidth: 80,
    textAlign: 'right',
  },
  removeButton: {
    padding: 6,
  },
  summary: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  cleaningRow: {
    marginBottom: 8,
  },
  cleaningLabel: {
    fontSize: 14,
    color: '#16a34a',
  },
  cleaningValue: {
    fontSize: 14,
    color: '#16a34a',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  checkoutButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
