import type { Category } from '../stores/catalog';
import { api, unwrap } from './api';

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get('/categories');
    return unwrap<Category[]>(res);
  },

  async getById(id: string): Promise<Category> {
    const res = await api.get(`/categories/${id}`);
    return unwrap<Category>(res);
  },

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    sortOrder?: number;
    imageUrl?: string;
  }): Promise<Category> {
    const res = await api.post('/categories', data);
    return unwrap<Category>(res);
  },

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: string;
      sortOrder?: number;
      imageUrl?: string;
    },
  ): Promise<Category> {
    const res = await api.patch(`/categories/${id}`, data);
    return unwrap<Category>(res);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
