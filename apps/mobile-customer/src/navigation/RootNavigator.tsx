import { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { HomeScreen } from '@/screens/HomeScreen';
import { ListingDetailScreen } from '@/screens/ListingDetailScreen';
import { CartScreen } from '@/screens/CartScreen';
import { FilterScreen } from '@/screens/FilterScreen';
import { useCart } from '@/stores/cart';
import { fetchCategories } from '@/services/api';
import type { FishCategory } from '@/types';

type Screen = 'home' | 'listing' | 'cart';

export function RootNavigator() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterCondition, setFilterCondition] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setCategories] = useState<FishCategory[]>([]);
  const { itemCount } = useCart();

  const navigateToHome = useCallback(() => {
    setCurrentScreen('home');
    setSelectedListingId(null);
  }, []);

  const navigateToListing = useCallback((id: string) => {
    setSelectedListingId(id);
    setCurrentScreen('listing');
  }, []);

  const navigateToCart = useCallback(() => {
    setCurrentScreen('cart');
  }, []);

  const handleFilterChange = useCallback((category: string | null, condition: string | null) => {
    setFilterCategory(category);
    setFilterCondition(condition);
  }, []);

  const handleOpenFilter = useCallback(async () => {
    try {
      const res = await fetchCategories();
      setCategories(res.data || []);
    } catch {}
    setShowFilter(true);
  }, []);

  const handleApplyFilter = useCallback((category: string | null, condition: string | null) => {
    setFilterCategory(category);
    setFilterCondition(condition);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'listing':
        return selectedListingId ? (
          <ListingDetailScreen
            listingId={selectedListingId}
            onBack={navigateToHome}
            onNavigateToListing={navigateToListing}
          />
        ) : (
          <HomeScreen
            onNavigateToListing={navigateToListing}
            onFilterChange={handleFilterChange}
            route={{ params: { category: filterCategory, condition: filterCondition } }}
          />
        );
      case 'cart':
        return <CartScreen onNavigateHome={navigateToHome} />;
      default:
        return (
          <HomeScreen
            onNavigateToListing={navigateToListing}
            onFilterChange={handleFilterChange}
            route={{ params: { category: filterCategory, condition: filterCondition } }}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <Header onCartPress={navigateToCart} />
      <View style={styles.screenContainer}>{renderScreen()}</View>
      {currentScreen === 'home' && !filterCategory && !filterCondition && (
        <TouchableOpacity onPress={handleOpenFilter} style={styles.filterFAB}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      )}
      <Modal visible={showFilter} animationType="slide" presentationStyle="pageSheet">
        <FilterScreen
          categories={categories}
          selectedCategory={filterCategory}
          selectedCondition={filterCondition}
          onApply={handleApplyFilter}
          onClose={() => setShowFilter(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  screenContainer: {
    flex: 1,
  },
  filterFAB: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
