import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { deliveriesService } from '../../services/deliveries';
import { DeliveryStatusBadge } from '../../components/DeliveryStatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingScreen } from '../../components/LoadingScreen';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Delivery } from '../../types';
import type { HistoryStackParamList } from '../../navigation/driver-tab-navigator';

type Nav = NativeStackNavigationProp<HistoryStackParamList, 'HistoryMain'>;

const STATUS_TABS = ['all', 'DELIVERED', 'CANCELLED', 'FAILED'] as const;
const TAB_LABELS: Record<string, string> = {
  all: 'Todas',
  DELIVERED: 'Entregues',
  CANCELLED: 'Canceladas',
  FAILED: 'Falha',
};

export function HistoryScreen() {
  const nav = useNavigation<Nav>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const queryParams =
    statusFilter === 'all'
      ? { status: 'DELIVERED,CANCELLED,FAILED,RETURNED' }
      : { status: statusFilter };

  const { data, isLoading } = useQuery({
    queryKey: ['driver', 'history', queryParams],
    queryFn: () => deliveriesService.list({ ...queryParams, limit: 50 }),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  if (isLoading) return <LoadingScreen />;

  const deliveries = data?.data ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Histórico</Text>
      </View>

      <View style={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, statusFilter === tab && styles.tabActive]}
            onPress={() => setStatusFilter(tab)}
          >
            <Text style={[styles.tabText, statusFilter === tab && styles.tabTextActive]}>
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="Nenhuma entrega"
            message="Você ainda não tem entregas nesta categoria"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate('HistoryDetail', { deliveryId: item.id })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.orderNumber}>
                #{item.order?.orderNumber?.slice(-6) || item.id.slice(-6)}
              </Text>
              <DeliveryStatusBadge status={item.status as any} size="sm" />
            </View>
            {item.order?.customer && (
              <Text style={styles.customer}>👤 {item.order.customer.name}</Text>
            )}
            {item.order?.total !== undefined && (
              <Text style={styles.total}>{formatCurrency(Number(item.order.total))}</Text>
            )}
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    backgroundColor: '#0f172a',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  tabActive: { backgroundColor: '#2563eb' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#ffffff' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderNumber: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  customer: { fontSize: 14, color: '#475569', marginTop: 2 },
  total: { fontSize: 18, fontWeight: '800', color: '#22c55e', marginTop: 4 },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
});
