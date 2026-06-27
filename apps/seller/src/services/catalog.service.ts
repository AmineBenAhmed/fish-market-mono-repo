import { api, unwrap } from './api';
import type { Product, Category } from '../types';

export const catalogService = {
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get('/categories');
    return unwrap<Category[]>(data);
  },

  async getProducts(): Promise<Product[]> {
    const { data } = await api.get('/products');
    return unwrap<Product[]>(data);
  },

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const { data } = await api.get('/products', { params: { categoryId } });
    return unwrap<Product[]>(data);
  },
};
