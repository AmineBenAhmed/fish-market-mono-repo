import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCategories, fetchListings, fetchGovernorates, fetchAreas } from '@/services/api';
import { CategoryCard } from '@/components/CategoryCard';
import { StoreCard } from '@/components/StoreCard';
import type { FishCategory, Listing } from '@/types';
import { useLocale } from '@/i18n/context';

interface HomeScreenProps {
  onNavigateToListing: (id: string) => void;
  onFilterChange: (
    category: string | null,
    condition: string | null,
    governorateId?: string | null,
    areaId?: string | null,
  ) => void;
  onOpenFilter: () => void;
  route?: any;
}

interface LocationOption {
  id: string;
  name: string;
}

export function HomeScreen({
  onNavigateToListing,
  onFilterChange,
  onOpenFilter,
  route,
}: HomeScreenProps) {
  const { t } = useLocale();
  const selectedCategory = route?.params?.category ?? null;
  const selectedCondition = route?.params?.condition ?? null;
  const selectedGovernorateId = route?.params?.governorateId ?? null;
  const selectedAreaId = route?.params?.areaId ?? null;
  const [categories, setCategories] = useState<FishCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [carouselOffset, setCarouselOffset] = useState(0);
  const LIMIT = 12;

  const [governorates, setGovernorates] = useState<LocationOption[]>([]);
  const [areas, setAreas] = useState<LocationOption[]>([]);

  useEffect(() => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    Promise.all([
      fetchCategories()
        .then((res) => setCategories(res.data || []))
        .catch(() => {}),
      fetchGovernorates()
        .then((res) => setGovernorates(res.data || []))
        .catch(() => {}),
    ]).finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGovernorateId) {
      fetchAreas(selectedGovernorateId)
        .then((res) => setAreas(res.data || []))
        .catch(() => setAreas([]));
    } else {
      setAreas([]);
    }
  }, [selectedGovernorateId]);

  const loadListings = useCallback(
    async (
      p: number,
      categoryId: string | null,
      condition: string | null,
      governorateId?: string | null,
      areaId?: string | null,
      searchTerm?: string,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params: any = { page: p, limit: LIMIT };
        if (governorateId) params.governorateId = governorateId;
        if (areaId) params.areaId = areaId;
        if (categoryId) params.categoryId = categoryId;
        if (condition) params.condition = condition;
        if (searchTerm) params.search = searchTerm;
        const res = await fetchListings(params);
        const payload = res.data.data;
        if (p === 1) {
          setListings(payload);
        } else {
          setListings((prev) => [...prev, ...payload]);
        }
        setHasMore(res.data.meta.hasNextPage);
        setPage(p);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadListings(
      1,
      selectedCategory,
      selectedCondition,
      selectedGovernorateId,
      selectedAreaId,
      search || undefined,
    );
  }, [
    selectedCategory,
    selectedCondition,
    selectedGovernorateId,
    selectedAreaId,
    search,
    loadListings,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCategories()
        .then((res) => setCategories(res.data || []))
        .catch(() => {}),
      fetchGovernorates()
        .then((res) => setGovernorates(res.data || []))
        .catch(() => {}),
      loadListings(
        1,
        selectedCategory,
        selectedCondition,
        selectedGovernorateId,
        selectedAreaId,
        search || undefined,
      ),
    ]);
    setRefreshing(false);
  }, [
    selectedCategory,
    selectedCondition,
    selectedGovernorateId,
    selectedAreaId,
    search,
    loadListings,
  ]);

  const showingCategory = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  const handleSelectCategory = (id: string) => {
    onFilterChange(id, selectedCondition, selectedGovernorateId, selectedAreaId);
  };

  const filteredCategories = search
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  const filteredListings = listings;
  const globalError = categoriesError || error;
  const carouselRef = useRef<ScrollView>(null);
  const scrollCarousel = (direction: 'left' | 'right') => {
    const step = 140;
    const newOffset =
      direction === 'left' ? Math.max(0, carouselOffset - step) : carouselOffset + step;
    carouselRef.current?.scrollTo({ x: newOffset, animated: true });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
      }
    >
      {globalError ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{globalError}</Text>
        </View>
      ) : null}

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher..."
          style={styles.searchInput}
          placeholderTextColor="#9ca3af"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.locationRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.locationChip, !selectedGovernorateId && styles.locationChipActive]}
            onPress={() => onFilterChange(selectedCategory, selectedCondition, null, null)}
          >
            <Ionicons
              name="location-outline"
              size={14}
              color={!selectedGovernorateId ? '#fff' : '#6b7280'}
            />
            <Text
              style={[
                styles.locationChipText,
                !selectedGovernorateId && styles.locationChipTextActive,
              ]}
            >
              Toutes les villes
            </Text>
          </TouchableOpacity>
          {governorates.map((gov) => (
            <TouchableOpacity
              key={gov.id}
              style={[
                styles.locationChip,
                selectedGovernorateId === gov.id && styles.locationChipActive,
              ]}
              onPress={() => onFilterChange(selectedCategory, selectedCondition, gov.id, null)}
            >
              <Text
                style={[
                  styles.locationChipText,
                  selectedGovernorateId === gov.id && styles.locationChipTextActive,
                ]}
              >
                {gov.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {selectedGovernorateId && areas.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaChipsRow}>
            <TouchableOpacity
              style={[styles.areaChip, !selectedAreaId && styles.areaChipActive]}
              onPress={() =>
                onFilterChange(selectedCategory, selectedCondition, selectedGovernorateId, null)
              }
            >
              <Text style={[styles.areaChipText, !selectedAreaId && styles.areaChipTextActive]}>
                Toutes les zones
              </Text>
            </TouchableOpacity>
            {areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[styles.areaChip, selectedAreaId === area.id && styles.areaChipActive]}
                onPress={() =>
                  onFilterChange(
                    selectedCategory,
                    selectedCondition,
                    selectedGovernorateId,
                    area.id,
                  )
                }
              >
                <Text
                  style={[
                    styles.areaChipText,
                    selectedAreaId === area.id && styles.areaChipTextActive,
                  ]}
                >
                  {area.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {!selectedCategory && !selectedCondition ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.allCategories')}</Text>
            {categoriesLoading ? null : (
              <Text style={styles.sectionCount}>
                {filteredCategories.length} {t('home.categories')}
              </Text>
            )}
          </View>

          {categoriesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <>
              <View style={styles.carouselWrapper}>
                <TouchableOpacity
                  style={[styles.carouselArrow, styles.carouselArrowLeft]}
                  onPress={() => scrollCarousel('left')}
                >
                  <Ionicons name="chevron-back" size={20} color="#2563eb" />
                </TouchableOpacity>
                <ScrollView
                  ref={carouselRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselContent}
                  onScroll={(e) => setCarouselOffset(e.nativeEvent.contentOffset.x)}
                  scrollEventThrottle={16}
                >
                  {filteredCategories.map((cat) => (
                    <View key={cat.id} style={styles.carouselItem}>
                      <CategoryCard category={cat} onClick={handleSelectCategory} small />
                    </View>
                  ))}
                  {filteredCategories.length > 0 && (
                    <TouchableOpacity style={styles.voirPlusCard} onPress={onOpenFilter}>
                      <Ionicons name="arrow-forward" size={24} color="#2563eb" />
                      <Text style={styles.voirPlusText}>Voir plus</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.carouselArrow, styles.carouselArrowRight]}
                  onPress={() => scrollCarousel('right')}
                >
                  <Ionicons name="chevron-forward" size={20} color="#2563eb" />
                </TouchableOpacity>
              </View>
              {filteredCategories.length === 0 && !categoriesError ? (
                <View style={styles.emptyState}>
                  <Ionicons name="fish-outline" size={60} color="#d1d5db" />
                  <Text style={styles.emptyTitle}>{t('home.noListings')}</Text>
                </View>
              ) : null}
            </>
          )}
        </>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.filterHeader}>
              <Text style={styles.sectionTitle}>
                {showingCategory?.name ||
                  (selectedCondition ? t('home.filteredListings') : t('home.listings'))}
              </Text>
              <TouchableOpacity
                onPress={() => onFilterChange(null, null, null, null)}
                style={styles.clearFilterButton}
              >
                <Ionicons name="close-circle-outline" size={18} color="#6b7280" />
                <Text style={styles.clearFilterText}>{t('sidebar.clear')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionCount}>
              {loading ? '...' : `Nos poissoneries (${filteredListings.length})`}
            </Text>
          </View>

          {loading && filteredListings.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : null}

          {!loading && filteredListings.length > 0 ? (
            <View style={styles.grid}>
              {filteredListings.map((listing) => (
                <View key={listing.id} style={styles.gridItem}>
                  <StoreCard listing={listing} onPress={() => onNavigateToListing(listing.id)} />
                </View>
              ))}
            </View>
          ) : null}

          {!loading && filteredListings.length === 0 && !error ? (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={60} color="#d1d5db" />
              <Text style={styles.emptyTitle}>{t('home.noListings')}</Text>
              <Text style={styles.emptySubtitle}>{t('home.tryDifferent')}</Text>
            </View>
          ) : null}

          {hasMore && !loading && filteredListings.length > 0 ? (
            <TouchableOpacity
              onPress={() =>
                loadListings(
                  page + 1,
                  selectedCategory,
                  selectedCondition,
                  selectedGovernorateId,
                  selectedAreaId,
                  search || undefined,
                )
              }
              style={styles.moreButton}
            >
              <Text style={styles.moreButtonText}>{t('home.more')}</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  locationRow: {
    marginBottom: 20,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 6,
  },
  locationChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  locationChipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  locationChipTextActive: {
    color: '#fff',
  },
  areaChipsRow: {
    marginTop: 8,
    flexGrow: 0,
  },
  areaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  areaChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  areaChipText: {
    fontSize: 12,
    color: '#6b7280',
  },
  areaChipTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFilterText: {
    fontSize: 13,
    color: '#6b7280',
  },
  carouselWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carouselArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  carouselArrowLeft: {
    marginRight: -16,
  },
  carouselArrowRight: {
    marginLeft: -16,
  },
  carouselContent: {
    paddingHorizontal: 24,
  },
  carouselItem: {
    width: 110,
    marginRight: 10,
  },
  voirPlusCard: {
    width: 90,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  voirPlusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
  },
  moreButton: {
    alignSelf: 'center',
    marginTop: 24,
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  moreButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 4,
  },
});
