import { api, unwrap, unwrapPaginated } from './api';
import type { Delivery } from '../types';

export const deliveriesService = {
  list: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await api.get('/driver/deliveries', { params });
    return unwrapPaginated<Delivery>(res);
  },

  getById: async (id: string) => {
    const res = await api.get(`/driver/deliveries/${id}`);
    return unwrap<Delivery>(res);
  },

  accept: async (id: string) => {
    const res = await api.patch(`/driver/deliveries/${id}/accept`);
    return unwrap<Delivery>(res);
  },

  reject: async (id: string) => {
    const res = await api.patch(`/driver/deliveries/${id}/reject`);
    return unwrap<{ message: string }>(res);
  },

  arrive: async (id: string) => {
    const res = await api.patch(`/driver/deliveries/${id}/arrive`);
    return unwrap<Delivery>(res);
  },

  pickup: async (id: string) => {
    const res = await api.patch(`/driver/deliveries/${id}/pickup`);
    return unwrap<Delivery>(res);
  },

  startTransit: async (id: string) => {
    const res = await api.patch(`/driver/deliveries/${id}/transit`);
    return unwrap<Delivery>(res);
  },

  complete: async (id: string) => {
    const res = await api.patch(`/driver/deliveries/${id}/complete`);
    return unwrap<Delivery>(res);
  },

  updateLocation: async (lat: number, lng: number) => {
    const res = await api.patch('/driver/deliveries/location', { lat, lng });
    return unwrap<{ message: string }>(res);
  },
};
