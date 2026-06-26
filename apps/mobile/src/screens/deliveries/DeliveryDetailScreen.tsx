import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';

import { deliveriesService } from '../../services/deliveries';
import { LoadingScreen } from '../../components/LoadingScreen';
import { DeliveryStatusBadge } from '../../components/DeliveryStatusBadge';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { StatusHistoryEntry } from '../../types';

type RouteParams = { deliveryId: string };

export function DeliveryDetailScreen() {
  const route = useRoute();
  const nav = useNavigation();
  const { deliveryId } = route.params as RouteParams;

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['driver', 'delivery', deliveryId],
    queryFn: () => deliveriesService.getById(deliveryId),
  });

  if (isLoading) return <LoadingScreen />;
  if (!delivery) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Entrega não encontrada</Text>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <DeliveryStatusBadge status={delivery.status as any} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pedido</Text>
        <Text style={styles.value}>
          #{delivery.order?.orderNumber || delivery.orderId.slice(-8)}
        </Text>
        {delivery.order?.total !== undefined && (
          <Text style={styles.total}>{formatCurrency(Number(delivery.order.total))}</Text>
        )}
      </View>

      {delivery.order?.customer && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cliente</Text>
          <Text style={styles.value}>{delivery.order.customer.name}</Text>
          {delivery.order.customer.phone && (
            <Text style={styles.sub}>📞 {delivery.order.customer.phone}</Text>
          )}
        </View>
      )}

      {delivery.address && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Endereço de Entrega</Text>
          <Text style={styles.value}>
            {delivery.address.street}, {delivery.address.number}
          </Text>
          <Text style={styles.sub}>
            {delivery.address.neighborhood}, {delivery.address.city} - {delivery.address.state}
          </Text>
          {delivery.address.complement && (
            <Text style={styles.sub}>Complemento: {delivery.address.complement}</Text>
          )}
        </View>
      )}

      {delivery.order?.items && delivery.order.items.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Itens ({delivery.order.items.length})</Text>
          {delivery.order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemVariant}>{item.variantName}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.totalPrice)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Status Timeline */}
      {delivery.statusHistory && delivery.statusHistory.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Linha do Tempo</Text>
          {delivery.statusHistory.map((h: StatusHistoryEntry) => (
            <View key={h.id} style={styles.timelineRow}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{h.toStatus.replace(/_/g, ' ')}</Text>
                <Text style={styles.timelineDate}>{formatDate(h.createdAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    backgroundColor: '#0f172a',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 4 },
  backText: { color: '#60a5fa', fontSize: 16, fontWeight: '600' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: '#ffffff' },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  total: { fontSize: 22, fontWeight: '800', color: '#22c55e', marginTop: 4 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemQty: { fontSize: 15, fontWeight: '700', color: '#2563eb', width: 32 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  itemVariant: { fontSize: 12, color: '#64748b' },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
    marginTop: 4,
    marginRight: 10,
  },
  timelineContent: { flex: 1 },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  timelineDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 16, color: '#ef4444', marginBottom: 16 },
  backLink: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
});
