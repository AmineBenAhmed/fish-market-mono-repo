'use client';

import { useEffect, useState } from 'react';
import { fetchCategories } from '@/lib/api';
import type { FishCategory } from '@/lib/types';

let cached: FishCategory[] | null = null;

export function useCategories() {
  const [categories, setCategories] = useState<FishCategory[]>(cached ?? []);

  useEffect(() => {
    if (cached) return;
    fetchCategories()
      .then((res) => {
        cached = res.data || [];
        setCategories(cached);
      })
      .catch(() => {});
  }, []);

  return categories;
}
