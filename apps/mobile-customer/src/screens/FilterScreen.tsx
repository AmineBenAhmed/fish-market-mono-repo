import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocale } from '@/i18n/context';
import type { FishCategory } from '@/types';

interface FilterScreenProps {
  categories: FishCategory[];
  selectedCategory: string | null;
  selectedCondition: string | null;
  onApply: (category: string | null, condition: string | null) => void;
  onClose: () => void;
}

export function FilterScreen({
  categories,
  selectedCategory,
  selectedCondition,
  onApply,
  onClose,
}: FilterScreenProps) {
  const { t } = useLocale();
  const [localCategory, setLocalCategory] = useState<string | null>(selectedCategory);
  const [localConditions, setLocalConditions] = useState<string[]>(
    (selectedCondition || '').split(',').filter(Boolean),
  );
  const [search, setSearch] = useState('');

  const conditions = [
    { value: 'FRESH', label: t('sidebar.fresh') },
    { value: 'FROZEN', label: t('sidebar.frozen') },
    { value: 'PREPARED', label: t('sidebar.prepared') },
  ];

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const toggleCondition = (value: string) => {
    setLocalConditions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleApply = () => {
    onApply(localCategory, localConditions.join(',') || null);
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('sidebar.searchPlaceholder')}
            style={styles.searchInput}
            placeholderTextColor="#9ca3af"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearText}>{t('sidebar.clear')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>{t('sidebar.preservation')}</Text>
        <View style={styles.conditionList}>
          {conditions.map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              onPress={() => toggleCondition(value)}
              style={[
                styles.conditionItem,
                localConditions.includes(value) && styles.conditionItemActive,
              ]}
            >
              <Text
                style={[
                  styles.conditionText,
                  localConditions.includes(value) && styles.conditionTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t('sidebar.allCategories')}</Text>
        <TouchableOpacity
          onPress={() => setLocalCategory(null)}
          style={[styles.categoryItem, !localCategory && styles.categoryItemActive]}
        >
          <Text style={[styles.categoryText, !localCategory && styles.categoryTextActive]}>
            {t('sidebar.allCategories')}
          </Text>
        </TouchableOpacity>
        {filtered.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setLocalCategory(cat.id)}
            style={[styles.categoryItem, localCategory === cat.id && styles.categoryItemActive]}
          >
            <Text
              style={[styles.categoryText, localCategory === cat.id && styles.categoryTextActive]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  clearText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  conditionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  conditionItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  conditionItemActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  conditionTextActive: {
    color: '#fff',
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryItemActive: {
    backgroundColor: '#eff6ff',
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
