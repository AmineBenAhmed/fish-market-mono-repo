import type { DriverProfile } from '../types';
import { api, unwrap, unwrapPaginated } from './api';

export const driversService = {
  async getDrivers(params?: { page?: number; limit?: number; status?: string }) {
    const result = await api.get('/admin/drivers', { params });
    return unwrapPaginated<DriverProfile>(result);
  },

  async getDriver(id: string): Promise<DriverProfile> {
    const result = await api.get(`/admin/drivers/${id}`);
    return unwrap<DriverProfile>(result);
  },
};
