export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface PaymentInfo {
  method: 'credit_card' | 'debit_card' | 'pix' | 'cash';
  status: 'pending' | 'approved' | 'refunded' | 'declined';
  transactionId?: string;
}

export interface DeliveryInfo {
  address: Address;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  fee: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  commission: number;
  total: number;
  status: OrderStatus;
  payment: PaymentInfo;
  delivery: DeliveryInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
