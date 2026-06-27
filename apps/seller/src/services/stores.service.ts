import { api, unwrap } from './api';
import type { Store } from '../types';

export const storesService = {
  async getStores(): Promise<Store[]> {
    const { data } = await api.get('/stores');
    return unwrap<Store[]>(data);
  },

  async getStore(id: string): Promise<Store> {
    const { data } = await api.get(`/stores/${id}`);
    return unwrap<Store>(data);
  },

  async create(store: {
    name: string;
    description?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
  }) {
    const { data } = await api.post('/stores', store);
    return unwrap<Store>(data);
  },

  async update(id: string, store: Partial<Store>) {
    const { data } = await api.patch(`/stores/${id}`, store);
    return unwrap<Store>(data);
  },

  async remove(id: string) {
    await api.delete(`/stores/${id}`);
  },
};
