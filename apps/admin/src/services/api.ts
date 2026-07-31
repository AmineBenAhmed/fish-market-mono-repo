import axios, { type AxiosRequestConfig } from 'axios';

import { useAuthStore } from '../stores/auth';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.samak.tn/api/v1').replace(
  /\/api\/v1\/?$/,
  '',
);

export const TOKEN_REFRESH_INTERVAL = 2 * 60 * 60 * 1000;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.samak.tn/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let queuedRequests: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function clearAuth() {
  const { logout } = useAuthStore.getState();
  logout();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

function refreshTokens(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    return Promise.resolve(false);
  }
  refreshPromise = api
    .post('/auth/refresh', { refreshToken })
    .then((response) => {
      const data = response.data?.data as
        | { accessToken?: string; refreshToken?: string }
        | undefined;
      if (!data?.accessToken || !data.refreshToken) {
        throw new Error('Invalid refresh response');
      }
      const { setToken, setRefreshToken } = useAuthStore.getState();
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return true;
    })
    .catch(() => {
      clearAuth();
      return false;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

function flushQueuedRequests() {
  queuedRequests.forEach(({ resolve }) => resolve());
  queuedRequests = [];
}

function rejectQueuedRequests() {
  queuedRequests.forEach(({ reject }) => reject(new Error('Authentication failed')));
  queuedRequests = [];
}

async function requestWithRefresh(config: AxiosRequestConfig): Promise<unknown> {
  if (isRefreshing) {
    await new Promise((resolve, reject) => {
      queuedRequests.push({ resolve, reject });
    });
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication failed');
    return api.request({
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${token}` },
    });
  }

  isRefreshing = true;
  try {
    const ok = await refreshTokens();
    if (!ok) {
      rejectQueuedRequests();
      throw new Error('Authentication failed');
    }
    flushQueuedRequests();
    const token = useAuthStore.getState().token;
    return api.request({
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${token}` },
    });
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      if (useAuthStore.getState().refreshToken) {
        return requestWithRefresh(original).catch(() => {
          clearAuth();
          return Promise.reject(error);
        });
      }
    }
    if (error.response?.status === 401 && !original?._retry) {
      clearAuth();
    }
    return Promise.reject(error);
  },
);

export function startTokenRefresh() {
  refreshTokens().catch(() => undefined);
  window.setInterval(() => {
    if (!isRefreshing && useAuthStore.getState().token && useAuthStore.getState().refreshToken) {
      refreshTokens().catch(() => undefined);
    }
  }, TOKEN_REFRESH_INTERVAL);
}

export function unwrap<T>(response: { data: { success: boolean; data: T } }): T {
  return response.data.data;
}

export function unwrapPaginated<T>(response: {
  data: {
    success: boolean;
    data: {
      data: T[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  };
}): {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
} {
  return response.data.data;
}

export { api };
