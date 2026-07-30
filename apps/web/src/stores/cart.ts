'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  ready: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  removeItem: (listingId: string) => void;
  clearCart: () => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      ready: true,
      addItem: (newItem) => {
        const items = get().items;
        const existing = items.find((i) => i.listingId === newItem.listingId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.listingId === newItem.listingId
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i,
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      updateQuantity: (listingId, quantity) => {
        set({
          items: get()
            .items.map((i) => (i.listingId === listingId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        });
      },
      removeItem: (listingId) => {
        set({
          items: get().items.filter((i) => i.listingId !== listingId),
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'fishmarket_cart',
      version: 1,
      partialize: (state) => ({
        items: state.items.map((item) => ({
          ...item,
          cleaning: true,
          cleaningCost: item.cleaningCost ?? 0,
        })),
      }),
      migrate: (persisted: any, version) => {
        if (version === 0) {
          const items = (persisted?.items || []).reduce((acc: CartItem[], item: CartItem) => {
            const existing = acc.find((i) => i.listingId === item.listingId);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              acc.push({ ...item, cleaning: true, cleaningCost: item.cleaningCost ?? 0 });
            }
            return acc;
          }, []);
          return { ...persisted, items };
        }
        return persisted;
      },
    },
  ),
);

function useCart() {
  const items = useCartStore((s) => s.items);
  const ready = useCartStore((s) => s.ready);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => {
    const unitPrice = i.price + i.cleaningCost;
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
    clearCart,
  };
}

export { useCart, useCartStore };
