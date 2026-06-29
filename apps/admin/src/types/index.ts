export interface User {
  id: string;
  code?: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SELLER' | 'DRIVER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription?: string;
  storeLogoFileId?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isActive: boolean;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  deliveryZoneId?: string;
  commissionRate: number;
  deliveryRadius: number;
  preparationTime: number;
  businessName?: string;
  businessDoc?: string;
  taxId?: string;
  photo?: string;
  pickupAddress?: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  status: 'ONLINE' | 'OFFLINE';
  isAvailable: boolean;
  activeDeliveries: number;
  maxDeliveries: number;
  city?: string;
  state?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  currentLat?: number;
  currentLng?: number;
  deliveryZoneId?: string;
  lastLocationAt?: string;
  user?: User;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerId: string;
  sellerId?: string;
  subtotal: number;
  deliveryFee: number;
  commission: number;
  discount: number;
  total: number;
  cancelReason?: string;
  customer?: { id: string; name: string; email: string };
  seller?: { id: string; name: string };
  items?: OrderItem[];
  childOrders?: Partial<Order>[];
  payment?: Payment;
  delivery?: Delivery;
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  listingId?: string;
  productName: string;
  variantName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus?: string;
  toStatus: string;
  changedById?: string;
  reason?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: string;
  amount: number;
  currency?: string;
  transactionId?: string;
  paidAt?: string;
  order?: { id: string; orderNumber: string; status: string };
  customer?: { id: string; name: string; email: string };
  createdAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  driverId?: string;
  addressId?: string;
  status: string;
  notes?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  failReason?: string;
  driver?: { id: string; name: string; phone?: string };
  order?: { id: string; orderNumber: string; status: string };
  address?: Record<string, unknown>;
  statusHistory?: DeliveryStatusHistory[];
  driverLocation?: { lat: number; lng: number } | null;
  createdAt: string;
}

export interface DeliveryStatusHistory {
  id: string;
  deliveryId: string;
  fromStatus?: string;
  toStatus: string;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  city: string;
  state?: string;
  isActive: boolean;
  polygon?: unknown;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  channel: string;
  title: string;
  body?: string;
  isRead: boolean;
  readAt?: string;
  data?: Record<string, unknown>;
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

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  productId: string;
  variantId?: string;
  date: string;
  price: number;
  quantity: number;
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'EXPIRED';
  title?: string;
  description?: string;
  catchDate?: string;
  availabilityDate?: string;
  origin?: string;
  condition?: 'FRESH' | 'CHILLED' | 'FROZEN' | 'SALTED' | 'SMOKED';
  averageWeight?: number;
  unit?: string;
  currency?: string;
  coverImageId?: string;
  imageUrls?: string[];
  notes?: string;
  seller?: {
    id: string;
    storeName: string;
    city?: string;
    state?: string;
  };
  product?: {
    id: string;
    name: string;
    category?: { id: string; name: string };
  };
  variant?: {
    id: string;
    name: string;
  };
  boughtQuantity?: number;
  boughtTotal?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalDrivers: number;
  ordersToday: number;
  totalRevenue: number;
  pendingOrders: number;
  activeDeliveries: number;
}
