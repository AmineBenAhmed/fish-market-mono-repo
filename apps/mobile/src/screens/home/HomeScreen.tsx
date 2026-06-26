import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { deliveriesService } from '../../services/deliveries';
import { driverService } from '../../services/driver';
import { useAuthStore } from '../../stores/auth';
import { formatCurrency, formatRelativeTime } from '../../lib/utils';
import { DeliveryStatusBadge } from '../../components/DeliveryStatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingScreen } from '../../components/LoadingScreen';
import type { Delivery, DriverProfile } from '../../types';
import type { HomeStackParamList } from '../../navigation/driver-tab-navigator';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export function HomeScreen() {
  const nav = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data: deliveriesData, isLoading: deliveriesLoading } = useQuery({
    queryKey: [
      'driver',
      'deliveries',
      { status: 'ASSIGNED,ACCEPTED,PICKING_UP,PICKED_UP,IN_TRANSIT' },
    ],
    queryFn: () => deliveriesService.list({ limit: 20 }),
    refetchInterval: 30000,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['driver', 'profile'],
    queryFn: driverService.getProfile,
  });

  const { data: stats } = useQuery({
    queryKey: ['driver', 'stats'],
    queryFn: driverService.getStats,
  });

  const statusMutation = useMutation({
    mutationFn: (status: 'ONLINE' | 'OFFLINE') => driverService.setStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => deliveriesService.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'deliveries'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['driver', 'deliveries'] }),
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] }),
      queryClient.invalidateQueries({ queryKey: ['driver', 'stats'] }),
    ]);
    setRefreshing(false);
  }, []);

  if (deliveriesLoading || profileLoading) {
    return <LoadingScreen />;
  }

  const deliveries = deliveriesData?.data ?? [];
  const activeDelivery = deliveries.find(
    (d) => !['DELIVERED', 'CANCELLED', 'FAILED', 'RETURNED'].includes(d.status),
  );
  const pendingAssignments = deliveries.filter((d) => d.status === 'ASSIGNED');
  const isOnline = profile?.status === 'ONLINE';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] || 'Motorista'}</Text>
          <Text style={styles.subtitle}>Pronto para entregas</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats?.activeCount ?? 0}</Text>
            <Text style={styles.statLabel}>Ativas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats?.completedDeliveries ?? 0}</Text>
            <Text style={styles.statLabel}>Entregues</Text>
          </View>
        </View>
      </View>

      <View style={styles.onlineRow}>
        <Text style={styles.onlineLabel}>Status</Text>
        <TouchableOpacity
          style={[styles.onlineToggle, isOnline ? styles.onlineActive : styles.onlineInactive]}
          onPress={() => statusMutation.mutate(isOnline ? 'OFFLINE' : 'ONLINE')}
          disabled={statusMutation.isPending}
        >
          {statusMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.onlineToggleText}>{isOnline ? '🟢 Online' : '🔴 Offline'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {pendingAssignments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🆕 Novas Atribuições ({pendingAssignments.length})
          </Text>
          {pendingAssignments.slice(0, 3).map((d) => (
            <TouchableOpacity
              key={d.id}
              style={styles.assignmentCard}
              onPress={() => nav.navigate('ActiveDelivery', { deliveryId: d.id })}
            >
              <View style={styles.assignmentTop}>
                <Text style={styles.orderNumber}>
                  #{d.order?.orderNumber?.slice(-6) || d.id.slice(-6)}
                </Text>
                <DeliveryStatusBadge status={d.status as any} size="sm" />
              </View>
              <Text style={styles.customerName}>👤 {d.order?.customer?.name || 'Cliente'}</Text>
              <Text style={styles.timeAgo}>{formatRelativeTime(d.createdAt)}</Text>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => acceptMutation.mutate(d.id)}
              >
                <Text style={styles.acceptBtnText}>✅ Aceitar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeDelivery ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Entrega Ativa</Text>
          <TouchableOpacity
            style={styles.activeCard}
            onPress={() => nav.navigate('ActiveDelivery', { deliveryId: activeDelivery.id })}
          >
            <View style={styles.activeTop}>
              <Text style={styles.orderNumber}>
                #{activeDelivery.order?.orderNumber?.slice(-6) || activeDelivery.id.slice(-6)}
              </Text>
              <DeliveryStatusBadge status={activeDelivery.status as any} />
            </View>
            <Text style={styles.customerName}>
              👤 {activeDelivery.order?.customer?.name || 'Cliente'}
            </Text>
            {activeDelivery.order?.total !== undefined && (
              <Text style={styles.orderTotal}>
                {formatCurrency(Number(activeDelivery.order.total))}
              </Text>
            )}
            <Text style={styles.tapHint}>Toque para continuar →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <EmptyState
            icon="🚚"
            title="Nenhuma entrega ativa"
            message="Aguardando novas atribuições"
          />
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  onlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: -12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  onlineLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  onlineToggle: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  onlineActive: {
    backgroundColor: '#22c55e',
  },
  onlineInactive: {
    backgroundColor: '#ef4444',
  },
  onlineToggleText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  assignmentCard: {
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
  activeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  assignmentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  customerName: {
    fontSize: 15,
    color: '#475569',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#22c55e',
    marginTop: 6,
  },
  timeAgo: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  acceptBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  tapHint: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
});
