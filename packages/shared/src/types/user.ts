export type UserRole = 'CUSTOMER' | 'SELLER' | 'DRIVER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Address {
  id: string;
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  location?: GeoLocation;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription?: string;
  deliveryRadius: number;
  preparationTime: number;
  isActive: boolean;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}
