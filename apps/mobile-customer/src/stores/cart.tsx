import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  ready: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (listingId: string, cleaning: boolean, quantity: number) => void;
  removeItem: (listingId: string, cleaning: boolean) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue>(null!);

const STORAGE_KEY = 'fishmarket_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed: CartItem[] = JSON.parse(raw);
          setItems(
            parsed.map((item) => ({
              ...item,
              cleaning: item.cleaning ?? false,
              cleaningCost: item.cleaningCost ?? 0,
            })),
          );
        } catch {}
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => {
    const unitPrice = i.price + (i.cleaning ? i.cleaningCost : 0);
    return sum + unitPrice * i.quantity;
  }, 0);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.listingId === newItem.listingId && i.cleaning === newItem.cleaning,
      );
      if (existing) {
        return prev.map((i) =>
          i.listingId === newItem.listingId && i.cleaning === newItem.cleaning
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i,
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const updateQuantity = useCallback((listingId: string, cleaning: boolean, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.listingId !== listingId || i.cleaning !== cleaning)
        : prev.map((i) =>
            i.listingId === listingId && i.cleaning === cleaning ? { ...i, quantity } : i,
          ),
    );
  }, []);

  const removeItem = useCallback((listingId: string, cleaning: boolean) => {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId || i.cleaning !== cleaning));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, ready, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      items: [],
      itemCount: 0,
      total: 0,
      ready: false,
      addItem() {},
      updateQuantity(_a, _b, _c) {},
      removeItem(_a, _b) {},
      clearCart() {},
    };
  }
  return ctx;
}
