import type { ApiResponse, FishCategory, Listing, MarketplaceResponse } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
  condition?: string;
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
  if (params.condition) searchParams.set('condition', params.condition);
  if (params.minPrice !== undefined) searchParams.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) searchParams.set('maxPrice', String(params.maxPrice));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const res = await fetch(`${API_URL}/marketplace/listings?${searchParams}`);
  return handleResponse<MarketplaceResponse<any>>(res);
}

export async function fetchTodayListings(params: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  condition?: string;
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
  if (params.condition) searchParams.set('condition', params.condition);
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
  governorateId?: string;
  areaId?: string;
  zoneId?: string;
  street?: string;
  buildingNumber?: string;
  apartment?: string;
  floor?: string;
  landmark?: string;
  items: Array<{ listingId: string; quantity: number; cleaning: boolean }>;
}) {
  const res = await fetch(`${API_URL}/marketplace/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<ApiResponse<any>>(res);
}

export async function fetchGovernorates() {
  const res = await fetch(`${API_URL}/locations/governorates`);
  return handleResponse<any>(res);
}

export async function fetchAreas(governorateId: string) {
  const res = await fetch(`${API_URL}/locations/areas/${governorateId}`);
  return handleResponse<any>(res);
}

export async function fetchZones(governorateId: string, areaId: string) {
  const res = await fetch(`${API_URL}/locations/zones/${governorateId}/${areaId}`);
  return handleResponse<any>(res);
}
