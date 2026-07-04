import { api, unwrap, unwrapPaginated } from './api';
import type { Listing } from '../types';

export interface ListingsQuery {
  fromDate?: string;
  toDate?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateListingData {
  sellerId?: string;
  categoryId: string;
  variantId?: string;
  date: string;
  price: number;
  quantity: number;
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
  imageIds?: string[];
  cloudinaryUrls?: string[];
}

export interface UpdateListingData {
  price?: number;
  quantity?: number;
  status?: string;
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
  imageIds?: string[];
  cloudinaryUrls?: string[];
}

export const listingsService = {
  async getAll(params?: ListingsQuery) {
    const res = await api.get('/seller/listings', { params });
    return unwrapPaginated<Listing>(res);
  },

  async getToday(params?: { search?: string }) {
    const res = await api.get('/seller/listings/today', { params });
    return unwrap<Listing[]>(res);
  },

  async getYesterday() {
    const res = await api.get('/seller/listings/yesterday');
    return unwrap<Listing[]>(res);
  },

  async duplicateYesterday() {
    const res = await api.post('/seller/listings/duplicate-yesterday');
    return unwrap<Listing[]>(res);
  },

  async getOne(id: string) {
    const res = await api.get(`/seller/listings/${id}`);
    return unwrap<Listing>(res);
  },

  async create(listing: CreateListingData) {
    const res = await api.post('/seller/listings', listing);
    return unwrap<Listing>(res);
  },

  async update(id: string, updates: UpdateListingData) {
    const res = await api.patch(`/seller/listings/${id}`, updates);
    return unwrap<Listing>(res);
  },

  async markSoldOut(id: string) {
    const res = await api.patch(`/seller/listings/${id}/sold-out`);
    return unwrap<Listing>(res);
  },

  async remove(id: string) {
    await api.delete(`/seller/listings/${id}`);
  },
};
