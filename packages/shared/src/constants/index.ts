export const COMMISSION_RATE = 0.12;
export const DEFAULT_DELIVERY_FEE = 5.99;
export const FREE_DELIVERY_THRESHOLD = 50;

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

export const PRODUCT_CATEGORIES = [
  'WHITE_FISH',
  'BLUE_FISH',
  'SHELLFISH',
  'CRUSTACEANS',
  'CEPHALOPODS',
  'FRESHWATER',
  'PROCESSED',
  'OTHER',
] as const;

export const USER_ROLES = ['CUSTOMER', 'SELLER', 'DRIVER', 'ADMIN'] as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;
