import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityPicker({ value, min = 1, max, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={[styles.button, value <= min && styles.buttonDisabled]}
      >
        <Ionicons name="remove" size={16} color={value <= min ? '#d1d5db' : '#374151'} />
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={[styles.button, value >= max && styles.buttonDisabled]}
      >
        <Ionicons name="add" size={16} color={value >= max ? '#d1d5db' : '#374151'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  value: {
    width: 32,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
  },
});
