import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { deliveriesService } from '../../services/deliveries';
import { LoadingScreen } from '../../components/LoadingScreen';
import { DeliveryStatusBadge } from '../../components/DeliveryStatusBadge';
import { StepIndicator } from '../../components/StepIndicator';
import {
  formatCurrency,
  deliveryStepFromStatus,
  deliveryActionLabel,
  deliveryActionIcon,
} from '../../lib/utils';
import type { Delivery, DeliveryAction, DeliveryStatusValue, SellerInfo } from '../../types';
import type { HomeStackParamList } from '../../navigation/driver-tab-navigator';

type RouteParams = { deliveryId: string };
type Nav = NativeStackNavigationProp<HomeStackParamList, 'ActiveDelivery'>;

const STEPS = [
  { label: 'Accepter', statusKey: 'ACCEPTED' as DeliveryStatusValue },
  { label: 'Arriver', statusKey: 'PICKING_UP' as DeliveryStatusValue },
  { label: 'Collecter', statusKey: 'PICKED_UP' as DeliveryStatusValue },
  { label: 'Transporter', statusKey: 'IN_TRANSIT' as DeliveryStatusValue },
  { label: 'Livrer', statusKey: 'DELIVERED' as DeliveryStatusValue },
];

function getNextAction(status: string): DeliveryAction | null {
  const map: Record<string, DeliveryAction> = {
    ASSIGNED: 'accept',
    ACCEPTED: 'arrive',
    PICKING_UP: 'pickup',
    PICKED_UP: 'transit',
    IN_TRANSIT: 'complete',
  };
  return map[status] || null;
}

function getActionEndpoint(action: DeliveryAction, id: string) {
  switch (action) {
    case 'accept':
      return deliveriesService.accept(id);
    case 'arrive':
      return deliveriesService.arrive(id);
    case 'pickup':
      return deliveriesService.pickup(id);
    case 'transit':
      return deliveriesService.startTransit(id);
    case 'complete':
      return deliveriesService.complete(id);
  }
}

export function DeliveryWorkflowScreen() {
  const route = useRoute();
  const nav = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { deliveryId } = route.params as RouteParams;

  const {
    data: delivery,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['driver', 'delivery', deliveryId],
    queryFn: () => deliveriesService.getById(deliveryId),
    refetchInterval: 15000,
  });

  const actionMutation = useMutation({
    mutationFn: (action: DeliveryAction) => getActionEndpoint(action, deliveryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'delivery', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['driver', 'deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['driver', 'stats'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Erreur lors de la mise à jour';
      Alert.alert('Erreur', msg);
    },
  });

  const handleReject = useCallback(() => {
    Alert.alert('Refuser la Livraison', 'Êtes-vous sûr de vouloir refuser cette livraison ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Refuser',
        style: 'destructive',
        onPress: async () => {
          try {
            await deliveriesService.reject(deliveryId);
            queryClient.invalidateQueries({ queryKey: ['driver', 'deliveries'] });
            nav.goBack();
          } catch (err: any) {
            Alert.alert('Erreur', err?.response?.data?.message || 'Erreur lors du refus');
          }
        },
      },
    ]);
  }, [deliveryId]);

  if (isLoading) return <LoadingScreen />;
  if (error || !delivery) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur de chargement</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const step = deliveryStepFromStatus(delivery.status);
  const nextAction = getNextAction(delivery.status);
  const isTerminal = ['DELIVERED', 'CANCELLED', 'FAILED', 'RETURNED'].includes(delivery.status);
  const isAssigned = delivery.status === 'ASSIGNED';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Livraison</Text>
        <DeliveryStatusBadge status={delivery.status as any} />
      </View>

      {/* Order Info */}
      <View style={styles.orderInfo}>
        <Text style={styles.orderNumber}>
          Commande #{delivery.order?.orderNumber?.slice(-8) || delivery.orderId.slice(-8)}
        </Text>
        {delivery.order?.total !== undefined && (
          <Text style={styles.orderTotal}>{formatCurrency(Number(delivery.order.total))}</Text>
        )}
      </View>

      {/* Seller Info */}
      {delivery.order?.seller && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🏪 Magasin</Text>
          <Text style={styles.infoValue}>
            {delivery.order.seller.sellerProfiles?.[0]?.storeName || delivery.order.seller.name}
          </Text>
          {delivery.order.seller.phone && (
            <Text style={styles.infoValue}>📞 {delivery.order.seller.phone}</Text>
          )}
          {(delivery.order.seller.sellerProfiles?.[0]?.pickupAddress ||
            delivery.order.seller.sellerProfiles?.[0]?.city) && (
            <Text style={styles.infoValue}>
              📍{' '}
              {[
                delivery.order.seller.sellerProfiles[0].pickupAddress,
                delivery.order.seller.sellerProfiles[0].city,
                delivery.order.seller.sellerProfiles[0].state,
              ]
                .filter(Boolean)
                .join(', ')}
            </Text>
          )}
          {delivery.order.seller.sellerProfiles?.[0]?.lat &&
            delivery.order.seller.sellerProfiles?.[0]?.lng && (
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => {
                  const { lat, lng } = delivery.order!.seller!.sellerProfiles[0];
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                  );
                }}
              >
                <Text style={styles.navBtnText}>🗺️ Naviguer vers le Magasin</Text>
              </TouchableOpacity>
            )}
        </View>
      )}

      {/* Customer Info */}
      {delivery.order?.customer && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>👤 Client</Text>
          <Text style={styles.infoValue}>{delivery.order.customer.name}</Text>
          {delivery.order.customer.phone && (
            <Text style={styles.infoValue}>📞 {delivery.order.customer.phone}</Text>
          )}
        </View>
      )}

      {/* Address */}
      {delivery.address && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 Adresse</Text>
          <Text style={styles.infoValue}>
            {delivery.address.street}, {delivery.address.number}
          </Text>
          <Text style={styles.infoValue}>
            {delivery.address.neighborhood}, {delivery.address.city} - {delivery.address.state}
          </Text>
        </View>
      )}

      {/* Order Items */}
      {delivery.order?.items && delivery.order.items.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📦 Articles</Text>
          {delivery.order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.productName} ({item.variantName})
              </Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.totalPrice)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Step Indicator */}
      <View style={styles.stepCard}>
        <Text style={styles.infoTitle}>Progression</Text>
        <StepIndicator
          steps={STEPS.map((s, i) => ({
            label: s.label,
            done: i < step,
            active: i === step,
          }))}
        />
      </View>

      {/* Action Button */}
      {nextAction && !isTerminal && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionBtn, isAssigned && styles.actionBtnAccept]}
            onPress={() => actionMutation.mutate(nextAction)}
            disabled={actionMutation.isPending}
          >
            {actionMutation.isPending ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <>
                <Text style={styles.actionBtnIcon}>{deliveryActionIcon(nextAction)}</Text>
                <Text style={styles.actionBtnText}>{deliveryActionLabel(nextAction)}</Text>
              </>
            )}
          </TouchableOpacity>

          {isAssigned && (
            <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
              <Text style={styles.rejectBtnText}>❌ Refuser la Livraison</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Completed State */}
      {delivery.status === 'DELIVERED' && (
        <View style={styles.completedCard}>
          <Text style={styles.completedIcon}>🎉</Text>
          <Text style={styles.completedText}>Livraison terminée !</Text>
          {delivery.deliveredAt && (
            <Text style={styles.completedTime}>
              {new Date(delivery.deliveredAt).toLocaleString('fr-FR')}
            </Text>
          )}
        </View>
      )}

      {/* Cancelled/Failed State */}
      {(delivery.status === 'CANCELLED' || delivery.status === 'FAILED') && (
        <View style={styles.cancelledCard}>
          <Text style={styles.cancelledIcon}>❌</Text>
          <Text style={styles.cancelledText}>
            {delivery.status === 'CANCELLED' ? 'Annulée' : 'Échec de livraison'}
          </Text>
          {delivery.failReason && <Text style={styles.cancelledReason}>{delivery.failReason}</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBack: {
    padding: 4,
  },
  headerBackText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  orderInfo: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  orderTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#22c55e',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#1e293b',
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemName: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  stepCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  actionBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionBtnAccept: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
  },
  actionBtnIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  rejectBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  rejectBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  completedCard: {
    margin: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  completedTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  cancelledCard: {
    margin: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  cancelledIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  cancelledText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
  },
  cancelledReason: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  navBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  navBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
