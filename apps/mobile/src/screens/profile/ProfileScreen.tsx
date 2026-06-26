import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { driverService } from '../../services/driver';
import { walletService } from '../../services/wallet';
import { useAuthStore } from '../../stores/auth';
import { LoadingScreen } from '../../components/LoadingScreen';
import { formatCurrency } from '../../lib/utils';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['driver', 'profile'],
    queryFn: driverService.getProfile,
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['driver', 'wallet'],
    queryFn: walletService.getWallet,
  });

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  if (profileLoading || walletLoading) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Perfil</Text>
      </View>

      {/* User Info */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'M'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Motorista'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Motorista</Text>
        </View>
      </View>

      {/* Wallet */}
      {wallet && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Carteira</Text>
          <Text style={styles.balance}>{formatCurrency(wallet.balance)}</Text>
          <View style={styles.walletRow}>
            <Text style={styles.walletLabel}>Disponível</Text>
            <Text style={styles.walletValue}>{formatCurrency(wallet.availableBalance)}</Text>
          </View>
          <View style={styles.walletRow}>
            <Text style={styles.walletLabel}>Pendente</Text>
            <Text style={styles.walletValue}>{formatCurrency(wallet.pendingBalance)}</Text>
          </View>
        </View>
      )}

      {/* Driver Info */}
      {profile && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚚 Informações do Motorista</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text
              style={[
                styles.infoValue,
                profile.status === 'ONLINE' ? styles.online : styles.offline,
              ]}
            >
              {profile.status === 'ONLINE' ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Entregas Ativas</Text>
            <Text style={styles.infoValue}>
              {profile.activeDeliveries}/{profile.maxDeliveries}
            </Text>
          </View>
          {profile.city && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cidade</Text>
              <Text style={styles.infoValue}>{profile.city}</Text>
            </View>
          )}
          {profile.vehicleType && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Veículo</Text>
              <Text style={styles.infoValue}>{profile.vehicleType}</Text>
            </View>
          )}
          {profile.vehiclePlate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Placa</Text>
              <Text style={styles.infoValue}>{profile.vehiclePlate}</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Sair</Text>
      </TouchableOpacity>
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
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  userCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#ffffff' },
  userName: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  userEmail: { fontSize: 14, color: '#64748b', marginTop: 4 },
  roleBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 10,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
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
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balance: { fontSize: 32, fontWeight: '800', color: '#22c55e', marginBottom: 12 },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  walletLabel: { fontSize: 14, color: '#64748b' },
  walletValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: { fontSize: 14, color: '#64748b' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  online: { color: '#22c55e' },
  offline: { color: '#ef4444' },
  logoutBtn: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
});
