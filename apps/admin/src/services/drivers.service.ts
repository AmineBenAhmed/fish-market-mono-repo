import type { DriverProfile } from '../types';
import { api, unwrap, unwrapPaginated } from './api';

export interface CreateDriverPayload {
  name: string;
  phone: string;
  phone2?: string;
  city: string;
  state: string;
  vehicleType: string;
  status?: 'ONLINE' | 'OFFLINE';
  idCardNumber?: string;
  idCardPhoto?: string;
  workingZone?: string;
}

export const driversService = {
  async getDrivers(params?: { page?: number; limit?: number; status?: string }) {
    const result = await api.get('/admin/drivers', { params });
    return unwrapPaginated<DriverProfile>(result);
  },

  async getDriver(id: string): Promise<DriverProfile> {
    const result = await api.get(`/admin/drivers/${id}`);
    return unwrap<DriverProfile>(result);
  },

  async createDriver(data: CreateDriverPayload): Promise<DriverProfile> {
    const result = await api.post('/admin/drivers', data);
    return unwrap<DriverProfile>(result);
  },
};
