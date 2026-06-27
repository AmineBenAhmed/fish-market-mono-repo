import type { DriverProfile, Order } from '../types';
import { api, unwrapPaginated } from './api';

export const dashboardService = {
  async getOrdersToday(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const result = await api.get('/admin/orders', {
      params: { startDate: today, endDate: today, limit: 1 },
    });
    return unwrapPaginated<Order>(result).meta.total;
  },

  async getPendingOrders(): Promise<number> {
    const result = await api.get('/admin/orders', {
      params: { status: 'PENDING', limit: 1 },
    });
    return unwrapPaginated<Order>(result).meta.total;
  },

  async getDrivers(): Promise<number> {
    const result = await api.get('/admin/drivers', { params: { limit: 1 } });
    return unwrapPaginated<DriverProfile>(result).meta.total;
  },
};
