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
  defaultImage?: string;
  category?: string;
  initialStock?: number;
  currentStock?: number;
  selectedVariantId?: string;
  selectedVariantSku?: string;
  selectedVariantName?: string;
  selectedVariantAttributes?: ProductVariantAttributes;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductVariantAttributes {
  size: string;
  color: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  shopId?: string;
  sku: string;
  barcode?: string;
  name: string;
  price: number;
  attributes: ProductVariantAttributes;
}

export interface Inventory {
  id: string;
  variantId: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  updatedAt?: Date;
}

export type InventoryTransactionType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
export type InventoryReferenceType = 'PURCHASE' | 'SALE' | 'RETURN' | 'MANUAL';

export interface InventoryTransaction {
  id: string;
  variantId: string;
  type: InventoryTransactionType;
  quantity: number;
  referenceType: InventoryReferenceType;
  referenceId: string;
  createdAt?: Date;
  createdBy: string;
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
