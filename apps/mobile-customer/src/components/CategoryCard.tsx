import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FishCategory } from '@/types';

interface Props {
  category: FishCategory;
  onClick: (id: string) => void;
}

export function CategoryCard({ category, onClick }: Props) {
  return (
    <TouchableOpacity onPress={() => onClick(category.id)} style={styles.card}>
      <View style={styles.imageContainer}>
        {category.image?.url ? (
          <Image source={{ uri: category.image.url }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="fish-outline" size={40} color="#d1d5db" />
          </View>
        )}
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{category.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  imageContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});
