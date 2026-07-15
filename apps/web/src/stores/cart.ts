'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  ready: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (listingId: string, cleaning: boolean, quantity: number) => void;
  removeItem: (listingId: string, cleaning: boolean) => void;
  toggleCleaning: (listingId: string, currentCleaning: boolean) => void;
  clearCart: () => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      ready: true,
      addItem: (newItem) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.listingId === newItem.listingId && i.cleaning === newItem.cleaning,
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.listingId === newItem.listingId && i.cleaning === newItem.cleaning
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i,
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      updateQuantity: (listingId, cleaning, quantity) => {
        set({
          items: get()
            .items.map((i) =>
              i.listingId === listingId && i.cleaning === cleaning ? { ...i, quantity } : i,
            )
            .filter((i) => i.quantity > 0),
        });
      },
      removeItem: (listingId, cleaning) => {
        set({
          items: get().items.filter((i) => i.listingId !== listingId || i.cleaning !== cleaning),
        });
      },
      toggleCleaning: (listingId, currentCleaning) => {
        const items = get().items;
        const item = items.find((i) => i.listingId === listingId && i.cleaning === currentCleaning);
        if (!item) return;
        set({
          items: [
            ...items.filter((i) => i.listingId !== listingId || i.cleaning !== currentCleaning),
            { ...item, cleaning: !currentCleaning },
          ],
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'fishmarket_cart',
      partialize: (state) => ({
        items: state.items.map((item) => ({
          ...item,
          cleaning: item.cleaning ?? false,
          cleaningCost: item.cleaningCost ?? 0,
        })),
      }),
    },
  ),
);

function useCart() {
  const items = useCartStore((s) => s.items);
  const ready = useCartStore((s) => s.ready);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleCleaning = useCartStore((s) => s.toggleCleaning);
  const clearCart = useCartStore((s) => s.clearCart);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => {
    const unitPrice = i.price + (i.cleaning ? i.cleaningCost : 0);
    return sum + unitPrice * i.quantity;
  }, 0);

  return {
    items,
    itemCount,
    total,
    ready,
    addItem,
    updateQuantity,
    removeItem,
    toggleCleaning,
    clearCart,
  };
}

export { useCart, useCartStore };
