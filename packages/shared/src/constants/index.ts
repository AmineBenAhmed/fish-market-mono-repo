export const COMMISSION_RATE = 0.12; // 12% marketplace commission

export const DELIVERY_FEE = 5.99; // Base delivery fee in currency

export const FREE_DELIVERY_THRESHOLD = 50; // Free delivery for orders above this amount

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out-for-delivery',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export const PRODUCT_CATEGORIES = [
  'white-fish',
  'blue-fish',
  'shellfish',
  'crustaceans',
  'cephalopods',
  'freshwater',
  'processed',
  'other',
] as const;

export const USER_ROLES = ['customer', 'seller', 'admin'] as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;
