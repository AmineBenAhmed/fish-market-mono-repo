import type { Order } from '../types';
import { api, unwrap, unwrapPaginated } from './api';

export const ordersService = {
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    driverId?: string;
  }) {
    const result = await api.get('/admin/orders', { params });
    return unwrapPaginated<Order>(result);
  },

  async getOrder(id: string): Promise<Order> {
    const result = await api.get(`/orders/${id}`);
    return unwrap<Order>(result);
  },

  async cancelOrder(id: string, reason: string): Promise<void> {
    await api.patch(`/orders/${id}/cancel`, { reason });
  },

  async updateStatus(id: string, status: string, reason?: string): Promise<void> {
    await api.patch(`/admin/orders/${id}/status`, { status, reason });
  },

  async assignDriver(id: string, driverId: string, addressId?: string): Promise<void> {
    await api.post(`/admin/orders/${id}/assign-driver`, { driverId, addressId });
  },

  async unassignDriver(id: string): Promise<void> {
    await api.post(`/admin/orders/${id}/unassign-driver`);
  },
};
