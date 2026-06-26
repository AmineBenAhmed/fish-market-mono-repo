import { api, unwrap, unwrapPaginated } from './api';
import type { Order } from '../types';

export const ordersService = {
  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    const { data } = await api.get('/seller/orders', { params });
    return unwrapPaginated<Order>(data);
  },

  async getOrder(id: string): Promise<Order> {
    const { data } = await api.get(`/seller/orders/${id}`);
    return unwrap<Order>(data);
  },

  async markReady(id: string) {
    await api.patch(`/seller/orders/${id}/ready`);
  },
};
