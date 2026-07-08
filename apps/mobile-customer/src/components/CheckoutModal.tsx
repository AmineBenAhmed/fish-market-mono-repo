import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocale } from '@/i18n/context';
import { AddressForm } from './AddressForm';
import type { AddressFormValue } from './AddressForm';

interface CheckoutData {
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
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CheckoutData) => void;
  error: string | null;
  loading: boolean;
}

export function CheckoutModal({ open, onClose, onSubmit, error, loading }: Props) {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressForm, setAddressForm] = useState<AddressFormValue>({
    governorateId: 'sousse',
    areaId: '',
    zoneId: '',
    street: '',
    buildingNumber: '',
    apartment: '',
    floor: '',
    landmark: '',
    label: '',
    lat: '',
    lng: '',
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'name' | 'phone' | 'address', string>>
  >({});

  if (!open) return null;

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = t('checkout.nameRequired');
    if (!phone.trim()) errs.phone = t('checkout.phoneRequired');
    else if (!/^[\d\s+\-()]{7,20}$/.test(phone.trim())) errs.phone = t('checkout.phoneInvalid');
    if (!addressForm.street.trim() || !addressForm.areaId || !addressForm.zoneId) {
      errs.address = t('checkout.addressRequired');
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const parts: string[] = [];
    if (addressForm.street) parts.push(addressForm.street);
    if (addressForm.buildingNumber) parts.push(`بناية ${addressForm.buildingNumber}`);
    if (addressForm.floor) parts.push(`طابق ${addressForm.floor}`);
    if (addressForm.apartment) parts.push(`شقة ${addressForm.apartment}`);
    if (addressForm.landmark) parts.push(`بجانب ${addressForm.landmark}`);

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      address: parts.join('، ') || addressForm.street,
      ...addressForm,
    });
  };

  const handleClose = () => {
    setFieldErrors({});
    onClose();
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('checkout.confirmOrder')}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>{t('checkout.fullName')}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('checkout.fullNamePlaceholder')}
                style={[styles.input, fieldErrors.name && styles.inputError]}
              />
              {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('checkout.phoneNumber')}</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder={t('checkout.phonePlaceholder')}
                keyboardType="phone-pad"
                style={[styles.input, fieldErrors.phone && styles.inputError]}
              />
              {fieldErrors.phone ? (
                <Text style={styles.fieldError}>{fieldErrors.phone}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('checkout.fullAddress')}</Text>
              <AddressForm value={addressForm} onChange={setAddressForm} showLabel={false} />
              {fieldErrors.address ? (
                <Text style={styles.fieldError}>{fieldErrors.address}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            >
              <Text style={styles.submitText}>
                {loading ? t('checkout.processing') : t('checkout.placeOrder')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 16,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
