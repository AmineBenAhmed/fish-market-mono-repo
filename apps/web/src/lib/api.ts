import type { ApiResponse, FishCategory, Listing, MarketplaceResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`);
  return handleResponse<ApiResponse<FishCategory[]>>(res);
}

export async function fetchListings(params: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortOrder?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.search) searchParams.set('search', params.search);
  if (params.minPrice !== undefined) searchParams.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) searchParams.set('maxPrice', String(params.maxPrice));
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const res = await fetch(`${API_URL}/marketplace/listings?${searchParams}`);
  return handleResponse<MarketplaceResponse<any>>(res);
}

export async function fetchTodayListings(params: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.search) searchParams.set('search', params.search);
  if (params.minPrice !== undefined) searchParams.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) searchParams.set('maxPrice', String(params.maxPrice));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const res = await fetch(`${API_URL}/marketplace/today?${searchParams}`);
  return handleResponse<MarketplaceResponse<any>>(res);
}

export async function fetchListing(id: string) {
  const res = await fetch(`${API_URL}/marketplace/listings/${id}`);
  return handleResponse<ApiResponse<Listing>>(res);
}

export async function fetchSellerListings(sellerId: string) {
  const res = await fetch(`${API_URL}/marketplace/sellers/${sellerId}`);
  return handleResponse<ApiResponse<{ seller: any; listings: Listing[] }>>(res);
}

export async function createOrder(body: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{ listingId: string; quantity: number; cleaning: boolean }>;
}) {
  const res = await fetch(`${API_URL}/marketplace/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<ApiResponse<any>>(res);
}
