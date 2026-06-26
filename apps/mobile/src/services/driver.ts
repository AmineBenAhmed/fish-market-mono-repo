import { api, unwrap } from './api';
import type { DriverProfile, DriverStats } from '../types';

export const driverService = {
  getProfile: async () => {
    const res = await api.get('/drivers/me');
    return unwrap<DriverProfile>(res);
  },

  updateProfile: async (data: Partial<DriverProfile>) => {
    const res = await api.patch('/drivers/me', data);
    return unwrap<DriverProfile>(res);
  },

  goOnline: async () => {
    const res = await api.patch('/drivers/me/online');
    return unwrap<{ status: string }>(res);
  },

  goOffline: async () => {
    const res = await api.patch('/drivers/me/offline');
    return unwrap<{ status: string }>(res);
  },

  setStatus: async (status: 'ONLINE' | 'OFFLINE') => {
    const res = await api.patch('/driver/status', { status });
    return unwrap<DriverProfile>(res);
  },

  getStats: async () => {
    const res = await api.get('/driver/stats');
    return unwrap<DriverStats>(res);
  },
};
