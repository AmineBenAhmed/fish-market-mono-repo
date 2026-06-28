import { api, unwrap } from './api';
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
  productId: string;
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
  unit?: string;
  currency?: string;
  notes?: string;
  imageIds?: string[];
  cloudinaryUrls?: string[];
}

export const listingsService = {
  async getAll(params?: ListingsQuery) {
    const { data } = await api.get('/seller/listings', { params });
    return unwrap<{ data: Listing[]; meta: any }>(data);
  },

  async getToday(params?: { search?: string }) {
    const { data } = await api.get('/seller/listings/today', { params });
    return unwrap<Listing[]>(data);
  },

  async getYesterday() {
    const { data } = await api.get('/seller/listings/yesterday');
    return unwrap<Listing[]>(data);
  },

  async duplicateYesterday() {
    const { data } = await api.post('/seller/listings/duplicate-yesterday');
    return unwrap<Listing[]>(data);
  },

  async getOne(id: string) {
    const { data } = await api.get(`/seller/listings/${id}`);
    return unwrap<Listing>(data);
  },

  async create(listing: CreateListingData) {
    const { data } = await api.post('/seller/listings', listing);
    return unwrap<Listing>(data);
  },

  async update(id: string, updates: UpdateListingData) {
    const { data } = await api.patch(`/seller/listings/${id}`, updates);
    return unwrap<Listing>(data);
  },

  async markSoldOut(id: string) {
    const { data } = await api.patch(`/seller/listings/${id}/sold-out`);
    return unwrap<Listing>(data);
  },

  async remove(id: string) {
    await api.delete(`/seller/listings/${id}`);
  },
};
