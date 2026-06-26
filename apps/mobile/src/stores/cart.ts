import { create } from 'zustand';

interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const items = get().items;
    const existing = items.find(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );
    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === item.productId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
  },
  removeItem: (productId, variantId) => {
    set({
      items: get().items.filter(
        (i) => i.productId !== productId || i.variantId !== variantId,
      ),
    });
  },
  updateQuantity: (productId, variantId, quantity) => {
    set({
      items: get().items.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity }
          : i,
      ),
    });
  },
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
  totalPrice: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
}));

export { useCartStore };
export type { CartItem };
