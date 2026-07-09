import { api, unwrap } from './api';
import type { SellerProfile } from '../types';

export const sellerService = {
  async listStores(): Promise<SellerProfile[]> {
    const res = await api.get('/sellers');
    return unwrap<SellerProfile[]>(res);
  },

  async getProfile(): Promise<SellerProfile> {
    const res = await api.get('/sellers/me');
    return unwrap<SellerProfile>(res);
  },

  async updateProfile(profile: Partial<SellerProfile>) {
    const res = await api.patch('/sellers/me', profile);
    return unwrap<SellerProfile>(res);
  },

  async apply(data: {
    storeName: string;
    storeDescription?: string;
    governorateId: string;
    areaId: string;
    zoneId: string;
    street: string;
    buildingNumber?: string;
    apartment?: string;
    floor?: string;
    landmark?: string;
    preparationTime?: number;
    deliveryRadius?: number;
    lat?: number;
    lng?: number;
    businessName?: string;
    businessDoc?: string;
    taxId?: string;
    photo?: string;
  }): Promise<SellerProfile> {
    const result = await api.post('/sellers/apply', data);
    return unwrap<SellerProfile>(result);
  },
};
