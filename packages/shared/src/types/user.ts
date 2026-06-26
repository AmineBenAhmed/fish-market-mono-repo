export type UserRole = 'customer' | 'seller' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Address {
  id: string;
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
