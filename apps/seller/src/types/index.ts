export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
  status: string;
  city?: string;
  state?: string;
  commissionRate: number;
  deliveryZoneId?: string;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  createdAt: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  unit: string;
  status: string;
  date: string;
  image?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerId: string;
  customer?: { id: string; name: string; phone?: string };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  commission: number;
  total: number;
  createdAt: string;
}

export interface WalletInfo {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  status: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  unit: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
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
}
