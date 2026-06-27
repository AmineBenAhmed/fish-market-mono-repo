import { api, unwrap } from './api';
import type { SellerProfile } from '../types';

export const sellerService = {
  async listStores(): Promise<SellerProfile[]> {
    const { data } = await api.get('/sellers');
    return unwrap<SellerProfile[]>(data);
  },

  async getProfile(): Promise<SellerProfile> {
    const { data } = await api.get('/sellers/me');
    return unwrap<SellerProfile>(data);
  },

  async updateProfile(profile: Partial<SellerProfile>) {
    const { data } = await api.patch('/sellers/me', profile);
    return unwrap<SellerProfile>(data);
  },

  async apply(data: {
    storeName: string;
    storeDescription?: string;
    city: string;
    state: string;
    lat?: number;
    lng?: number;
    pickupAddress?: string;
    businessName?: string;
    businessDoc?: string;
    taxId?: string;
  }): Promise<SellerProfile> {
    const result = await api.post('/sellers/apply', data);
    return unwrap<SellerProfile>(result);
  },
};
