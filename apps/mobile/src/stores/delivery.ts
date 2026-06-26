import { create } from 'zustand';
import type { Delivery } from '../types';

interface DeliveryState {
  activeDelivery: Delivery | null;
  setActiveDelivery: (delivery: Delivery | null) => void;
  clearActiveDelivery: () => void;
}

const useDeliveryStore = create<DeliveryState>((set) => ({
  activeDelivery: null,
  setActiveDelivery: (delivery) => set({ activeDelivery: delivery }),
  clearActiveDelivery: () => set({ activeDelivery: null }),
}));

export { useDeliveryStore };
