export interface ListingImage {
  id: string;
  fileId: string;
  sortOrder: number;
  file: {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
  };
}

export interface FishCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { id: string; url: string } | null;
  imageUrl?: string;
  sortOrder: number;
}

export interface SellerInfo {
  id: string;
  storeName: string;
  city: string;
  state: string;
  photo?: string | null;
  storeLogoUrl?: string | null;
}

export interface Listing {
  id: string;
  title: string | null;
  description: string | null;
  price: number;
  cleaningCost?: number;
  quantity: number;
  unit: string;
  currency: string;
  status: string;
  date: string;
  createdAt: string;
  catchDate: string | null;
  origin: string | null;
  condition: string;
  averageWeight: number | null;
  coverImageId: string | null;
  coverImage: { id: string; url: string } | null;
  images: ListingImage[];
  imageUrls: string[];
  category: { id: string; name: string } | null;
  variant: { id: string; name: string; unit: string } | null;
  seller: SellerInfo;
}

export interface PaginatedData<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface MarketplaceResponse<T> {
  success: boolean;
  data: PaginatedData<T>;
  timestamp: string;
  path: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
}

export interface CartItem {
  listingId: string;
  quantity: number;
  title: string;
  price: number;
  cleaningCost: number;
  cleaning: boolean;
  unit: string;
  currency: string;
  imageUrl: string | null;
  storeName: string;
  productName: string;
  variantName: string;
  maxQuantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{ listingId: string; quantity: number; cleaning: boolean }>;
}
