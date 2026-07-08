import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCategories, fetchListings } from '@/services/api';
import { CategoryCard } from '@/components/CategoryCard';
import { StoreCard } from '@/components/StoreCard';
import type { FishCategory, Listing } from '@/types';
import { useLocale } from '@/i18n/context';

interface HomeScreenProps {
  onNavigateToListing: (id: string) => void;
  onFilterChange: (category: string | null, condition: string | null) => void;
  route?: any;
}

export function HomeScreen({ onNavigateToListing, onFilterChange, route }: HomeScreenProps) {
  const { t } = useLocale();
  const selectedCategory = route?.params?.category ?? null;
  const selectedCondition = route?.params?.condition ?? null;
  const [categories, setCategories] = useState<FishCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const LIMIT = 12;

  useEffect(() => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    fetchCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => setCategoriesError(err.message || 'Failed to load categories'))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, selectedCondition]);

  const loadListings = useCallback(
    async (p: number, categoryId: string | null, condition: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const params: any = { page: p, limit: LIMIT };
        if (categoryId) params.categoryId = categoryId;
        if (condition) params.condition = condition;
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
    loadListings(1, selectedCategory, selectedCondition);
  }, [selectedCategory, selectedCondition, loadListings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCategories()
        .then((res) => setCategories(res.data || []))
        .catch(() => {}),
      loadListings(1, selectedCategory, selectedCondition),
    ]);
    setRefreshing(false);
  }, [selectedCategory, selectedCondition, loadListings]);

  const showingCategory = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  const handleSelectCategory = (id: string) => {
    onFilterChange(id, selectedCondition);
  };

  const filteredListings = listings;
  const globalError = categoriesError || error;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
      }
    >
      <View style={styles.hero}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('home.heroSubtitle')}</Text>
        </View>
      </View>

      {globalError ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{globalError}</Text>
        </View>
      ) : null}

      {!selectedCategory && !selectedCondition ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.allCategories')}</Text>
            <Text style={styles.sectionCount}>
              {categoriesLoading ? '...' : `${categories.length} ${t('home.categories')}`}
            </Text>
          </View>

          {categoriesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <>
              <View style={styles.grid}>
                {categories.slice(0, visibleCount).map((cat) => (
                  <View key={cat.id} style={styles.gridItem}>
                    <CategoryCard category={cat} onClick={handleSelectCategory} />
                  </View>
                ))}
              </View>
              {categories.length === 0 && !categoriesError ? (
                <View style={styles.emptyState}>
                  <Ionicons name="fish-outline" size={60} color="#d1d5db" />
                  <Text style={styles.emptyTitle}>{t('home.noListings')}</Text>
                </View>
              ) : null}
              {visibleCount < categories.length && (
                <TouchableOpacity
                  onPress={() => setVisibleCount((prev) => prev + 12)}
                  style={styles.moreButton}
                >
                  <Text style={styles.moreButtonText}>{t('home.more')}</Text>
                </TouchableOpacity>
              )}
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
                onPress={() => onFilterChange(null, null)}
                style={styles.clearFilterButton}
              >
                <Ionicons name="close-circle-outline" size={18} color="#6b7280" />
                <Text style={styles.clearFilterText}>{t('sidebar.clear')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionCount}>
              {loading
                ? '...'
                : `${filteredListings.length} ${
                    filteredListings.length !== 1 ? t('home.listings_plural') : t('home.listing')
                  } ${t('home.available')}`}
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
              onPress={() => loadListings(page + 1, selectedCategory, selectedCondition)}
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
  hero: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(30,58,138,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
