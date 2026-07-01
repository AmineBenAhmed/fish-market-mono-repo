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

export interface Listing {
  id: string;
  title: string | null;
  description: string | null;
  price: number;
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
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: { id: string; name: string } | null;
    variants: Array<{ id: string; name: string; unit: string }>;
  };
  variant: { id: string; name: string; unit: string } | null;
  seller: {
    id: string;
    storeName: string;
    city: string;
    state: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
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
  items: Array<{ listingId: string; quantity: number }>;
}
