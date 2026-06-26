import { api, unwrap } from './api';
import type { SellerProfile } from '../types';

export const sellerService = {
  async getProfile(): Promise<SellerProfile> {
    const { data } = await api.get('/sellers/me');
    return unwrap<SellerProfile>(data);
  },

  async updateProfile(profile: Partial<SellerProfile>) {
    const { data } = await api.patch('/sellers/me', profile);
    return unwrap<SellerProfile>(data);
  },
};
