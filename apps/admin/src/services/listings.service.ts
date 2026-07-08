import type { Listing } from '../types';
import { api, unwrap, unwrapPaginated } from './api';

export const listingsService = {
  async getListings(params?: {
    storeName?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await api.get('/admin/listings', { params });
    return unwrapPaginated<Listing>(result);
  },

  async getListing(id: string): Promise<Listing> {
    const res = await api.get(`/admin/listings/${id}`);
    return unwrap<Listing>(res);
  },

  async create(data: {
    sellerId?: string;
    categoryId: string;
    date: string;
    price: number;
    title?: string;
    description?: string;
    catchDate?: string;
    availabilityDate?: string;
    origin?: string;
    condition?: string;
    averageWeight?: number;
    cleaningCost?: number;
    unit?: string;
    currency?: string;
    notes?: string;
    cloudinaryUrls?: string[];
  }): Promise<Listing> {
    const result = await api.post('/admin/listings', data);
    return unwrap<Listing>(result);
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await api.patch(`/admin/listings/${id}/status`, { status });
  },
};
