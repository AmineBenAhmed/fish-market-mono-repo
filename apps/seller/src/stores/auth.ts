import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: unknown | null;
  setToken: (token: string | null) => void;
  setUser: (user: unknown) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('auth-token'),
  user: null,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('auth-token');
    set({ token: null, user: null });
  },
  isAuthenticated: () => !!get().token,
}));

export { useAuthStore };
