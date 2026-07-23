export interface Role {
  id: string;
  name: 'super_admin' | 'super_staff' | 'store_admin' | 'store_staff';
  label: string;
  permissions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  roleId?: string;
  role?: Role['name'];
  latitude?: number;
  longitude?: number;
  phone?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  logo?: string;
  ownerId?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  shopId: string;
  shopName?: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  images: string[];
  category?: string;
  isAvailable?: boolean;
  latitude?: number;
  longitude?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
