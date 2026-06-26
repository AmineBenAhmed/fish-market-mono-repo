export type ProductCategory =
  | 'white-fish'
  | 'blue-fish'
  | 'shellfish'
  | 'crustaceans'
  | 'cephalopods'
  | 'freshwater'
  | 'processed'
  | 'other';

export type ProductStatus = 'available' | 'sold-out' | 'unavailable';

export interface Inventory {
  quantity: number;
  unit: 'kg' | 'g' | 'unit' | 'dozen';
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  inventory: Inventory;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  category: ProductCategory;
  images: string[];
  variants: ProductVariant[];
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  isPromoted: boolean;
  createdAt: string;
  updatedAt: string;
}
