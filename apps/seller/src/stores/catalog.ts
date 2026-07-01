import { create } from 'zustand';
import { api, unwrap } from '../services/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  imageFileId?: string;
  image?: { id: string; url: string } | null;
  children?: Category[];
  parentId?: string;
  parent?: { id: string; name: string } | null;
}

interface CatalogState {
  categories: Category[];
  loaded: boolean;
  loading: boolean;
  loadCategories: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
}

const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: [],
  loaded: false,
  loading: false,

  loadCategories: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const res = await api.get('/categories');
      const categories = unwrap<Category[]>(res);
      set({ categories, loaded: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  getCategoryById: (id: string) => get().categories.find((c) => c.id === id),
}));

export { useCatalogStore };
