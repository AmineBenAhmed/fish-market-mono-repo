import { api, unwrap } from './api';
import type { User } from '../types';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data as { user: User; accessToken: string; refreshToken: string };
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return unwrap<User>(data);
  },
};
