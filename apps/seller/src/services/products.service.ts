import { api, unwrap } from './api';

export interface FishProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  isActive: boolean;
}

export const productsService = {
  async getActive(): Promise<FishProduct[]> {
    const res = await api.get('/products', {
      params: { isActive: true, limit: 100 },
    });
    return unwrap<FishProduct[]>(res);
  },
};
