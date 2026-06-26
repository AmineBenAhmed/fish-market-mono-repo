export type UserRole = 'CUSTOMER' | 'SELLER' | 'DRIVER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';

export type SellerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type DriverStatus = 'ONLINE' | 'OFFLINE';

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

export interface CustomerProfile {
  id: string;
  userId: string;
  defaultAddressId?: string;
}

export interface UserSetting {
  id: string;
  userId: string;
  language: string;
  theme: string;
  marketingOptIn: boolean;
  notifyOrderUpdates: boolean;
  notifyPromotions: boolean;
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
  customerProfile?: CustomerProfile;
  sellerProfile?: SellerProfile;
  driverProfile?: DriverProfile;
  setting?: UserSetting;
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
  verificationStatus: SellerVerificationStatus;
  businessName?: string;
  businessDoc?: string;
  taxId?: string;
  isActive: boolean;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  pickupAddress?: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  status: DriverStatus;
  isAvailable: boolean;
  city: string;
  state: string;
  deliveryZone?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  licenseNumber?: string;
  maxLoadKg?: number;
}
