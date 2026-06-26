export type DriverStatus = 'ONLINE' | 'OFFLINE';

export type DeliveryStatusValue =
  | 'PENDING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'PICKING_UP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'
  | 'CANCELLED';

export interface DriverProfile {
  id: string;
  userId: string;
  status: DriverStatus;
  isAvailable: boolean;
  city: string;
  state: string;
  deliveryZoneId?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  licenseNumber?: string;
  maxLoadKg?: number;
  maxDeliveries: number;
  activeDeliveries: number;
  currentLat?: number;
  currentLng?: number;
}

export interface DriverStats {
  activeCount: number;
  totalDeliveries: number;
  completedDeliveries: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  addressId: string;
  driverId?: string;
  status: DeliveryStatusValue;
  scheduledDate?: string;
  scheduledTime?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  order?: OrderSummary;
  driver?: { id: string; name: string; phone?: string };
  address?: AddressInfo;
  statusHistory?: StatusHistoryEntry[];
  driverLocation?: { lat: number; lng: number } | null;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total?: number;
  customer?: { id: string; name: string; phone?: string };
  items?: OrderItemInfo[];
}

export interface OrderItemInfo {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface AddressInfo {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  label?: string;
  location?: { lat: number; lng: number };
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  channel: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}

export interface WalletInfo {
  id: string;
  balance: number;
  pendingBalance: number;
  availableBalance: number;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  avatarFileId: string | null;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type DeliveryAction = 'accept' | 'arrive' | 'pickup' | 'transit' | 'complete';
