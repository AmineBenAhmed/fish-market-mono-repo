import { api, unwrap } from './api';
import type { AuthResponse } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return unwrap<AuthResponse>(res);
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return unwrap<AuthResponse['user']>(res);
  },
};
