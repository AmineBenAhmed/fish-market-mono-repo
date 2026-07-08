import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';

import { driverService } from '../../services/driver';
import { walletService } from '../../services/wallet';
import { useAuthStore } from '../../stores/auth';
import { LoadingScreen } from '../../components/LoadingScreen';
import { formatCurrency } from '../../lib/utils';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['driver', 'profile'],
    queryFn: driverService.getProfile,
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['driver', 'wallet'],
    queryFn: walletService.getWallet,
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['driver', 'earnings'],
    queryFn: driverService.getEarnings,
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => driverService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      Alert.alert('Succès', 'Mot de passe modifié avec succès');
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Erreur lors du changement de mot de passe';
      Alert.alert('Erreur', message);
    },
  });

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const handleChangePassword = () => {
    if (!newPassword) {
      Alert.alert('Erreur', 'Veuillez saisir le nouveau mot de passe');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    changePasswordMutation.mutate();
  };

  if (profileLoading || walletLoading || earningsLoading) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {/* User Info */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'M'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Chauffeur'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Chauffeur</Text>
        </View>
      </View>

      {/* Earnings */}
      {earnings && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gains</Text>
          <Text style={styles.balance}>{formatCurrency(earnings.totalEarnings)}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total des livraisons</Text>
            <Text style={styles.infoValue}>{earnings.completedCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tarif par livraison</Text>
            <Text style={styles.infoValue}>{formatCurrency(earnings.deliveryFee)}</Text>
          </View>
        </View>
      )}

      {/* Wallet */}
      {wallet && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portefeuille</Text>
          <Text style={styles.balance}>{formatCurrency(wallet.balance)}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Disponible</Text>
            <Text style={styles.infoValue}>{formatCurrency(wallet.availableBalance)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>En attente</Text>
            <Text style={styles.infoValue}>{formatCurrency(wallet.pendingBalance)}</Text>
          </View>
        </View>
      )}

      {/* Driver Info */}
      {profile && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Infos du Chauffeur</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut</Text>
            <Text
              style={[
                styles.infoValue,
                profile.status === 'ONLINE' ? styles.online : styles.offline,
              ]}
            >
              {profile.status === 'ONLINE' ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Livraisons Actives</Text>
            <Text style={styles.infoValue}>
              {profile.activeDeliveries}/{profile.maxDeliveries}
            </Text>
          </View>
          {profile.city && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ville</Text>
              <Text style={styles.infoValue}>{profile.city}</Text>
            </View>
          )}
          {profile.vehicleType && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Véhicule</Text>
              <Text style={styles.infoValue}>{profile.vehicleType}</Text>
            </View>
          )}
          {profile.vehiclePlate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plaque</Text>
              <Text style={styles.infoValue}>{profile.vehiclePlate}</Text>
            </View>
          )}
        </View>
      )}

      {/* Change Password */}
      <TouchableOpacity style={styles.menuBtn} onPress={() => setPasswordModalVisible(true)}>
        <Text style={styles.menuBtnText}>Changer le Mot de Passe</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      {/* Password Change Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Changer le Mot de Passe</Text>

            <Text style={styles.inputLabel}>Mot de Passe Actuel</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Saisissez votre mot de passe actuel"
            />

            <Text style={styles.inputLabel}>Nouveau Mot de Passe</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Min. 6 caractères"
            />

            <Text style={styles.inputLabel}>Confirmer le Mot de Passe</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Répétez le nouveau mot de passe"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleChangePassword}
                disabled={changePasswordMutation.isPending}
              >
                <Text style={styles.confirmBtnText}>
                  {changePasswordMutation.isPending ? 'Modification...' : 'Changer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  menuBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  menuBtnText: { color: '#2563eb', fontSize: 16, fontWeight: '700' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 15 },
  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  confirmBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});
