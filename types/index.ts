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
  deletedAt?: Date | null;
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
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Chat {
  id: string;
  userId: string;
  productId: string;
  shopId: string;
  lastMessage: string;
  lastMessageAt?: Date;
  lastMessageSender: 'customer' | 'shop';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'customer' | 'shop';
  text: string;
  read: boolean;
  createdAt?: Date;
}
