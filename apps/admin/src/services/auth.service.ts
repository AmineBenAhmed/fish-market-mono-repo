import type { AuthResponse, LoginCredentials, User } from '../types';
import { api } from './api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', credentials);
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data.data;
  },
};
