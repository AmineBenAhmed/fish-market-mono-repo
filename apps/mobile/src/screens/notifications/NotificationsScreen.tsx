import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsService } from '../../services/notifications';
import { LoadingScreen } from '../../components/LoadingScreen';
import { EmptyState } from '../../components/EmptyState';
import { formatRelativeTime } from '../../lib/utils';
import type { NotificationItem } from '../../types';

export function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['driver', 'notifications'],
    queryFn: () => notificationsService.list({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driver', 'notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driver', 'notifications'] }),
  });

  if (isLoading) return <LoadingScreen />;

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllMutation.mutate()}>
            <Text style={styles.markAllText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="🔔" title="Aucune notification" message="Vous êtes à jour !" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.isRead && styles.cardUnread]}
            onPress={() => {
              if (!item.isRead) markReadMutation.mutate(item.id);
            }}
          >
            <View style={styles.cardContent}>
              {!item.isRead && <View style={styles.unreadDot} />}
              <View style={styles.cardBody}>
                <Text style={[styles.title, !item.isRead && styles.titleUnread]}>{item.title}</Text>
                {item.body && (
                  <Text style={styles.body} numberOfLines={2}>
                    {item.body}
                  </Text>
                )}
                <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
              </View>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  markAllText: { color: '#60a5fa', fontSize: 13, fontWeight: '600' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginTop: 6,
    marginRight: 10,
  },
  cardBody: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  titleUnread: { fontWeight: '800' },
  body: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  time: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
});
