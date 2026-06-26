// ─── Types ─────────────────────────────────────────────────
export type {
  User,
  UserRole,
  UserStatus,
  Address,
  GeoLocation,
} from './types/user';

export type {
  Product,
  ProductCategory,
  ProductStatus,
  ProductVariant,
  Inventory,
} from './types/product';

export type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentInfo,
  DeliveryInfo,
} from './types/order';

export type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  SortParams,
  DateRangeFilter,
} from './types/common';

// ─── Constants ─────────────────────────────────────────────
export {
  COMMISSION_RATE,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  USER_ROLES,
  PAGINATION_DEFAULTS,
} from './constants';

// ─── Utilities ─────────────────────────────────────────────
export {
  formatCurrency,
  formatDate,
  formatDistance,
  slugify,
  truncate,
  generateId,
  calculateCommission,
  calculateDeliveryFee,
} from './utils';
