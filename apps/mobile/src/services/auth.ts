import { api, unwrap } from './api';
import type { AuthResponse } from '../types';

export const authService = {
  login: async (phone: string, password: string) => {
    const res = await api.post('/auth/login', { phone, password });
    return unwrap<AuthResponse>(res);
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return unwrap<AuthResponse['user']>(res);
  },
};
