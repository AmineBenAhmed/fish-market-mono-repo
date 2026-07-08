export type QualityGrade = 'PREMIUM' | 'STANDARD' | 'ECONOMY';

export type InventoryUnit = 'KG' | 'G' | 'UNIT' | 'DOZEN';

export type Preservation = 'FRESH' | 'CHILLED' | 'FROZEN' | 'SALTED' | 'SMOKED';

export type ListingStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'EXPIRED';

export interface FishCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageFileId?: string;
  parentId?: string;
  sortOrder: number;
  children?: FishCategory[];
}

export interface FishVariant {
  id: string;
  productId: string;
  name: string;
  description?: string;
  unit: InventoryUnit;
}

export interface FishProduct {
  id: string;
  categoryId: string;
  category?: FishCategory;
  name: string;
  slug: string;
  description?: string;
  origin?: string;
  preservation: Preservation;
  qualityGrade: QualityGrade;
  unitType: InventoryUnit;
  marketPriceMin?: number;
  marketPriceMax?: number;
  isActive: boolean;
  imageFileId?: string;
  variants: FishVariant[];
}

export interface SellerListing {
  id: string;
  sellerId: string;
  productId: string;
  variantId: string;
  date: string;
  price: number;
  status: ListingStatus;
  notes?: string;
  product?: FishProduct;
  variant?: FishVariant;
  seller?: {
    id: string;
    storeName: string;
    city: string;
    state: string;
  };
}

export interface MarketplaceQuery {
  categoryId?: string;
  city?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  qualityGrade?: QualityGrade;
  preservation?: Preservation;
}
