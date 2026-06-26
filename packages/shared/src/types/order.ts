import type { Address } from './user';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'DECLINED' | 'REFUNDED';

export type DeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED';

export interface PaymentInfo {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
}

export interface DeliveryInfo {
  id: string;
  address: Address;
  driverId?: string;
  status: DeliveryStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  fee: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusTransition {
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  reason?: string;
  changedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  commission: number;
  discount: number;
  total: number;
  status: OrderStatus;
  statusHistory: OrderStatusTransition[];
  payment: PaymentInfo;
  delivery: DeliveryInfo;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}
