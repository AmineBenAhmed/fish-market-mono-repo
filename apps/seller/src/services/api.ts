import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export function unwrap<T>(response: { data: { success: boolean; data: T } }): T {
  return response.data.data;
}

export function unwrapPaginated<T>(response: {
  data: { success: boolean; data: { data: T[]; meta: any } };
}) {
  return response.data.data;
}

export { api };
