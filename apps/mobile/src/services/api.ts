import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  },
);

let getToken: () => string | null = () => null;
let clearToken: () => void = () => {};

export function setTokenAccessors(getter: () => string | null, clearer: () => void) {
  getToken = getter;
  clearToken = clearer;
}

export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

export function unwrapPaginated<T>(response: { data: { data: T[]; meta: unknown } }) {
  return { data: response.data.data, meta: response.data.meta };
}

export { api };
