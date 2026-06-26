export type ProductCategory =
  | 'WHITE_FISH'
  | 'BLUE_FISH'
  | 'SHELLFISH'
  | 'CRUSTACEANS'
  | 'CEPHALOPODS'
  | 'FRESHWATER'
  | 'PROCESSED'
  | 'OTHER';

export type ProductStatus = 'AVAILABLE' | 'SOLD_OUT' | 'UNAVAILABLE';

export type InventoryUnit = 'KG' | 'G' | 'UNIT' | 'DOZEN';

export type Preservation = 'FRESH' | 'CHILLED' | 'FROZEN' | 'SALTED' | 'SMOKED';

export interface Inventory {
  quantity: number;
  unit: InventoryUnit;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: InventoryUnit;
  inventory: Inventory;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  category: ProductCategory;
  images: string[];
  variants: ProductVariant[];
  status: ProductStatus;
  preservation: Preservation;
  catchDate?: string;
  origin?: string;
  rating: number;
  reviewCount: number;
  isPromoted: boolean;
  createdAt: string;
  updatedAt: string;
}
