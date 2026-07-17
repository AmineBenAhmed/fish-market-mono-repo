export type OrderStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  listingId?: string;
  variantId: string;
  sellerId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  cleaning?: boolean;
  cleaningCost?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  sellerId?: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  commission: number;
  discount: number;
  total: number;
  notes?: string;
  cancelReason?: string;
  cancelledById?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  listingId: string;
  variantId: string;
  quantity: number;
  listing?: {
    id: string;
    price: number;
    quantity: number;
    status: string;
    date: string;
    seller: {
      id: string;
      storeName: string;
    };
    product: {
      id: string;
      name: string;
      slug: string;
      preservation: string;
      qualityGrade: string;
    };
    variant: {
      id: string;
      name: string;
      unit: string;
    };
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}
