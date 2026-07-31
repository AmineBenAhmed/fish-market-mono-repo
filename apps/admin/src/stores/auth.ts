import { create } from 'zustand';

import type { User } from '../types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('auth-token'),
  refreshToken: localStorage.getItem('auth-refresh-token'),
  user: (() => {
    try {
      const stored = localStorage.getItem('auth-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }
    set({ token });
  },
  setRefreshToken: (refreshToken) => {
    if (refreshToken) {
      localStorage.setItem('auth-refresh-token', refreshToken);
    } else {
      localStorage.removeItem('auth-refresh-token');
    }
    set({ refreshToken });
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem('auth-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth-user');
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-refresh-token');
    localStorage.removeItem('auth-user');
    set({ token: null, refreshToken: null, user: null });
  },
  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'ADMIN',
}));

export { useAuthStore };
