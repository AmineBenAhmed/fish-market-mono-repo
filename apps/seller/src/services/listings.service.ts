import { api, unwrap, unwrapPaginated } from './api';
import type { Listing } from '../types';

export const listingsService = {
  async getToday(): Promise<Listing[]> {
    const { data } = await api.get('/seller/listings/today');
    return unwrap<Listing[]>(data);
  },

  async getHistory(params?: { page?: number; limit?: number }) {
    const { data } = await api.get('/seller/listings/history', { params });
    return unwrapPaginated<Listing>(data);
  },

  async create(listing: {
    productId: string;
    variantId?: string;
    price: number;
    quantity: number;
  }) {
    const { data } = await api.post('/seller/listings', listing);
    return unwrap<Listing>(data);
  },

  async update(id: string, updates: { price?: number; quantity?: number; status?: string }) {
    const { data } = await api.patch(`/seller/listings/${id}`, updates);
    return unwrap<Listing>(data);
  },

  async reduceStock(id: string, quantity: number) {
    const { data } = await api.patch(`/seller/listings/${id}/reduce-stock`, { quantity });
    return unwrap<Listing>(data);
  },

  async remove(id: string) {
    await api.delete(`/seller/listings/${id}`);
  },
};
