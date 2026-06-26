import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isSeller: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('auth-token'),
  user: (() => {
    try {
      const stored = localStorage.getItem('auth-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  setToken: (token) => {
    if (token) localStorage.setItem('auth-token', token);
    else localStorage.removeItem('auth-token');
    set({ token });
  },
  setUser: (user) => {
    if (user) localStorage.setItem('auth-user', JSON.stringify(user));
    else localStorage.removeItem('auth-user');
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    set({ token: null, user: null });
  },
  isAuthenticated: () => !!get().token,
  isSeller: () => get().user?.role === 'SELLER',
}));

export { useAuthStore };
