import type { User } from '../types';
import { api, unwrap } from './api';

export const usersService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
  }) {
    const { data } = await api.get('/admin/users', { params });
    return data.data;
  },

  async getUser(id: string): Promise<User> {
    const { data } = await api.get(`/admin/users/${id}`);
    return unwrap<User>(data);
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await api.patch(`/admin/users/${id}/status`, { status });
  },
};
