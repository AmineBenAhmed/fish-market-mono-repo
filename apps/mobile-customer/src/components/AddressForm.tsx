import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocale } from '@/i18n/context';
import { fetchGovernorates, fetchAreas, fetchZones } from '@/services/api';

interface LocationOption {
  id: string;
  name: string;
}

interface AddressFormValue {
  governorateId: string;
  areaId: string;
  zoneId: string;
  street: string;
  buildingNumber: string;
  apartment: string;
  floor: string;
  landmark: string;
  label: string;
  lat: string;
  lng: string;
}

interface AddressFormProps {
  value?: Partial<AddressFormValue>;
  onChange: (value: AddressFormValue) => void;
  showLabel?: boolean;
  showCoordinates?: boolean;
}

type PickerOption = 'governorate' | 'area' | 'zone';

export function AddressForm({
  value = {},
  onChange,
  showLabel = true,
  showCoordinates = false,
}: AddressFormProps) {
  const { t } = useLocale();
  const [governorates, setGovernorates] = useState<LocationOption[]>([]);
  const [areas, setAreas] = useState<LocationOption[]>([]);
  const [zones, setZones] = useState<LocationOption[]>([]);
  const [loadingGov, setLoadingGov] = useState(true);
  const [openPicker, setOpenPicker] = useState<PickerOption | null>(null);

  const form: AddressFormValue = {
    governorateId: value.governorateId || 'sousse',
    areaId: value.areaId || '',
    zoneId: value.zoneId || '',
    street: value.street || '',
    buildingNumber: value.buildingNumber || '',
    apartment: value.apartment || '',
    floor: value.floor || '',
    landmark: value.landmark || '',
    label: value.label || '',
    lat: value.lat || '',
    lng: value.lng || '',
  };

  useEffect(() => {
    fetchGovernorates()
      .then((res) => setGovernorates(res.data || res))
      .catch(() => {})
      .finally(() => setLoadingGov(false));
  }, []);

  useEffect(() => {
    if (!form.governorateId) {
      setAreas([]);
      setZones([]);
      return;
    }
    fetchAreas(form.governorateId)
      .then((res) => setAreas(res.data || res))
      .catch(() => setAreas([]));
  }, [form.governorateId]);

  useEffect(() => {
    if (!form.governorateId || !form.areaId) {
      setZones([]);
      return;
    }
    fetchZones(form.governorateId, form.areaId)
      .then((res) => setZones(res.data || res))
      .catch(() => setZones([]));
  }, [form.governorateId, form.areaId]);

  const update = (patch: Partial<AddressFormValue>) => {
    const next = { ...form, ...patch };

    if (patch.governorateId !== undefined && patch.governorateId !== value.governorateId) {
      next.areaId = '';
      next.zoneId = '';
    }
    if (patch.areaId !== undefined && patch.areaId !== value.areaId) {
      next.zoneId = '';
    }

    onChange(next);
  };

  const getLabel = (id: string, options: LocationOption[]) =>
    options.find((o) => o.id === id)?.name || '';

  if (openPicker) {
    const options =
      openPicker === 'governorate' ? governorates : openPicker === 'area' ? areas : zones;
    const selectedId =
      openPicker === 'governorate'
        ? form.governorateId
        : openPicker === 'area'
          ? form.areaId
          : form.zoneId;
    const title =
      openPicker === 'governorate' ? 'الولاية' : openPicker === 'area' ? 'المعتمدية' : 'المنطقة';

    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{title}</Text>
          <TouchableOpacity onPress={() => setOpenPicker(null)}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.pickerList}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => {
                const patch =
                  openPicker === 'governorate'
                    ? { governorateId: opt.id }
                    : openPicker === 'area'
                      ? { areaId: opt.id }
                      : { zoneId: opt.id };
                update(patch);
                setOpenPicker(null);
              }}
              style={[styles.pickerItem, selectedId === opt.id && styles.pickerItemActive]}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  selectedId === opt.id && styles.pickerItemTextActive,
                ]}
              >
                {opt.name}
              </Text>
              {selectedId === opt.id && <Ionicons name="checkmark" size={20} color="#2563eb" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loadingGov ? (
        <ActivityIndicator size="small" color="#2563eb" />
      ) : (
        <>
          <TouchableOpacity onPress={() => setOpenPicker('governorate')} style={styles.fieldButton}>
            <Text style={styles.fieldLabel}>الولاية *</Text>
            <Text style={[styles.fieldValue, !form.governorateId && styles.fieldPlaceholder]}>
              {getLabel(form.governorateId, governorates) || 'اختر الولاية'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => form.governorateId && setOpenPicker('area')}
            style={[styles.fieldButton, !form.governorateId && styles.fieldDisabled]}
          >
            <Text style={styles.fieldLabel}>المعتمدية *</Text>
            <Text style={[styles.fieldValue, !form.areaId && styles.fieldPlaceholder]}>
              {getLabel(form.areaId, areas) || 'اختر المعتمدية'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => form.areaId && setOpenPicker('zone')}
            style={[styles.fieldButton, !form.areaId && styles.fieldDisabled]}
          >
            <Text style={styles.fieldLabel}>المنطقة *</Text>
            <Text style={[styles.fieldValue, !form.zoneId && styles.fieldPlaceholder]}>
              {getLabel(form.zoneId, zones) || 'اختر المنطقة'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الشارع *</Text>
            <TextInput
              style={styles.textInput}
              value={form.street}
              onChangeText={(text: string) => update({ street: text })}
              placeholder="اسم الشارع"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>رقم البناية</Text>
              <TextInput
                style={styles.textInput}
                value={form.buildingNumber}
                onChangeText={(text: string) => update({ buildingNumber: text })}
                placeholder="رقم البناية"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>الطابق</Text>
              <TextInput
                style={styles.textInput}
                value={form.floor}
                onChangeText={(text: string) => update({ floor: text })}
                placeholder="رقم الطابق"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>الشقة</Text>
              <TextInput
                style={styles.textInput}
                value={form.apartment}
                onChangeText={(text: string) => update({ apartment: text })}
                placeholder="رقم الشقة"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>أقرب معلم</Text>
            <TextInput
              style={styles.textInput}
              value={form.landmark}
              onChangeText={(text: string) => update({ landmark: text })}
              placeholder="أقرب معلم (اختياري)"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {showLabel && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>تصنيف العنوان</Text>
              <View style={styles.labelRow}>
                {[
                  { value: 'home', label: 'المنزل' },
                  { value: 'work', label: 'العمل' },
                  { value: 'family', label: 'العائلة' },
                  { value: 'other', label: 'أخرى' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => update({ label: form.label === opt.value ? '' : opt.value })}
                    style={[styles.labelChip, form.label === opt.value && styles.labelChipActive]}
                  >
                    <Text
                      style={[
                        styles.labelChipText,
                        form.label === opt.value && styles.labelChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {showCoordinates && (
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>خط العرض</Text>
                <TextInput
                  style={styles.textInput}
                  value={form.lat}
                  onChangeText={(text: string) => update({ lat: text })}
                  placeholder="Latitude"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>خط الطول</Text>
                <TextInput
                  style={styles.textInput}
                  value={form.lng}
                  onChangeText={(text: string) => update({ lng: text })}
                  placeholder="Longitude"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

export type { AddressFormValue };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
  },
  fieldDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    position: 'absolute',
    top: -8,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  },
  fieldValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  fieldPlaceholder: {
    color: '#9ca3af',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  pickerList: {
    flex: 1,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerItemActive: {
    backgroundColor: '#eff6ff',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#374151',
  },
  pickerItemTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  labelChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  labelChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  labelChipTextActive: {
    color: '#fff',
  },
});
