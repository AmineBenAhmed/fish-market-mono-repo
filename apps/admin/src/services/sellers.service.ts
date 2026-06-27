import type { SellerProfile } from '../types';
import { api, unwrapPaginated } from './api';

export const sellersService = {
  async getSellers(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const result = await api.get('/admin/sellers', { params });
    return unwrapPaginated<SellerProfile>(result);
  },

  async getSeller(id: string): Promise<SellerProfile> {
    const { data } = await api.get(`/admin/sellers/${id}`);
    return data.data as SellerProfile;
  },

  async approve(id: string): Promise<void> {
    await api.patch(`/sellers/${id}/approve`);
  },

  async reject(id: string): Promise<void> {
    await api.patch(`/sellers/${id}/reject`);
  },
};
