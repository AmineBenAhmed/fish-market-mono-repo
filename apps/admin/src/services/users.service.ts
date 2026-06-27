import type { User } from '../types';
import { api, unwrap, unwrapPaginated } from './api';

export const usersService = {
  async getUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
    const result = await api.get('/admin/users', { params });
    return unwrapPaginated<User>(result);
  },

  async getUser(id: string): Promise<User> {
    const { data } = await api.get(`/admin/users/${id}`);
    return unwrap<User>(data);
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await api.patch(`/admin/users/${id}/status`, { status });
  },
};
