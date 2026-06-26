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
  token: null,
  user: null,
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  logout: () => set({ token: null, user: null }),
  isAuthenticated: () => !!get().token,
}));

export { useAuthStore };
