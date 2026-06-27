import type { Delivery } from '../types';
import { api, unwrap, unwrapPaginated } from './api';

export const deliveriesService = {
  async getDeliveries(params?: {
    page?: number;
    limit?: number;
    status?: string;
    driverId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const result = await api.get('/admin/deliveries', { params });
    return unwrapPaginated<Delivery>(result);
  },

  async getDelivery(id: string): Promise<Delivery> {
    const result = await api.get(`/admin/deliveries/${id}`);
    return unwrap<Delivery>(result);
  },

  async assignDriver(deliveryId: string, driverId: string, notes?: string): Promise<void> {
    await api.post(`/admin/deliveries/${deliveryId}/assign`, { driverId, notes });
  },

  async autoAssign(deliveryId: string, zoneId?: string): Promise<void> {
    await api.post(`/admin/deliveries/${deliveryId}/auto-assign`, {}, { params: { zoneId } });
  },

  async failDelivery(deliveryId: string, reason: string): Promise<void> {
    await api.post(`/admin/deliveries/${deliveryId}/fail`, { reason });
  },

  async cancelDelivery(deliveryId: string, reason: string): Promise<void> {
    await api.post(`/admin/deliveries/${deliveryId}/cancel`, { reason });
  },
};
