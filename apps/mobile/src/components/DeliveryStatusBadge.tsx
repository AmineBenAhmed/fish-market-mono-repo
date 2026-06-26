import { View, Text, StyleSheet } from 'react-native';
import type { DeliveryStatusValue } from '../types';

const STATUS_COLORS: Record<string, string> = {
  PENDING_ASSIGNMENT: '#f59e0b',
  ASSIGNED: '#3b82f6',
  ACCEPTED: '#8b5cf6',
  PICKING_UP: '#f59e0b',
  PICKED_UP: '#06b6d4',
  IN_TRANSIT: '#2563eb',
  DELIVERED: '#22c55e',
  FAILED: '#ef4444',
  RETURNED: '#64748b',
  CANCELLED: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_ASSIGNMENT: 'Pendente',
  ASSIGNED: 'Atribuída',
  ACCEPTED: 'Aceita',
  PICKING_UP: 'Buscando',
  PICKED_UP: 'Coletada',
  IN_TRANSIT: 'Em Trânsito',
  DELIVERED: 'Entregue',
  FAILED: 'Falha',
  RETURNED: 'Devolvida',
  CANCELLED: 'Cancelada',
};

interface DeliveryStatusBadgeProps {
  status: DeliveryStatusValue;
  size?: 'sm' | 'md' | 'lg';
}

export function DeliveryStatusBadge({ status, size = 'md' }: DeliveryStatusBadgeProps) {
  const color = STATUS_COLORS[status] || '#64748b';
  const label = STATUS_LABELS[status] || status;
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 15 : 13;
  const paddingV = size === 'sm' ? 2 : size === 'lg' ? 6 : 4;
  const paddingH = size === 'sm' ? 6 : size === 'lg' ? 14 : 10;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + '20', paddingVertical: paddingV, paddingHorizontal: paddingH },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  text: {
    fontWeight: '600',
  },
});
