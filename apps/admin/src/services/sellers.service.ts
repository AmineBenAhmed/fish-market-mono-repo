import type { SellerProfile } from '../types';
import { api, unwrap, unwrapPaginated } from './api';

export const sellersService = {
  async getSellers(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const result = await api.get('/admin/sellers', { params });
    return unwrapPaginated<SellerProfile>(result);
  },

  async getSeller(id: string): Promise<SellerProfile> {
    const result = await api.get(`/admin/sellers/${id}`);
    return unwrap<SellerProfile>(result);
  },

  async create(data: {
    userId: string;
    storeName: string;
    storeDescription?: string;
    commissionRate?: number;
    deliveryRadius?: number;
    preparationTime?: number;
    governorateId: string;
    areaId: string;
    zoneId: string;
    street?: string;
    buildingNumber?: string;
    apartment?: string;
    floor?: string;
    landmark?: string;
    lat?: number;
    lng?: number;
    businessName?: string;
    businessDoc?: string;
    taxId?: string;
    photo?: string;
    storeLogoUrl?: string;
  }): Promise<SellerProfile> {
    const result = await api.post('/admin/sellers', data);
    return unwrap<SellerProfile>(result);
  },

  async update(
    id: string,
    data: {
      storeName?: string;
      storeDescription?: string;
      deliveryRadius?: number;
      preparationTime?: number;
      governorateId?: string;
      areaId?: string;
      zoneId?: string;
      street?: string;
      buildingNumber?: string;
      apartment?: string;
      floor?: string;
      landmark?: string;
      lat?: number;
      lng?: number;
      businessName?: string;
      businessDoc?: string;
      taxId?: string;
      isActive?: boolean;
      verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
      photo?: string;
      registrationNumber?: string;
      storeLogoUrl?: string;
      commissionRate?: number;
    },
  ): Promise<SellerProfile> {
    const result = await api.patch(`/admin/sellers/${id}`, data);
    return unwrap<SellerProfile>(result);
  },

  async approve(id: string): Promise<void> {
    await api.patch(`/sellers/${id}/approve`);
  },

  async reject(id: string): Promise<void> {
    await api.patch(`/sellers/${id}/reject`);
  },
};
