# My Near Shops — Firestore Database Schema

Firestore is a NoSQL document store. The app uses the following top-level collections. Each document uses `createdAt` and `updatedAt` server timestamps.

## `roles`

Global role definitions used to authorize users.

```ts
interface Role {
  id: string;                         // Firestore document ID
  name: 'super_admin' | 'super_staff' | 'store_admin' | 'store_staff';
  label: string;                      // Human-readable label, e.g. "Super Admin"
  permissions: string[];              // e.g. ['users.read', 'shops.write']
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Default roles

- `super_admin` — Full platform access
- `super_staff` — Platform support / moderator
- `store_admin` — Owns/manages one or more shops
- `store_staff` — Staff member assigned to specific shops

## `users`

App user accounts linked to Firebase Authentication.

```ts
interface User {
  id: string;                         // Firestore document ID, matches Firebase Auth uid
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone: string | null;
  roleId: string;                     // Reference to /roles/{roleId}
  role: 'super_admin' | 'super_staff' | 'store_admin' | 'store_staff';
  latitude: number | null;            // User's preferred/last location
  longitude: number | null;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## `shops`

Stores listed on the platform.

```ts
interface Shop {
  id: string;                         // Firestore document ID
  ownerId: string;                    // Reference to /users/{ownerId}
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  logo: string;                       // URL from Firebase Storage
  isVerified: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## `products`

Products belonging to a shop.

```ts
interface Product {
  id: string;                         // Firestore document ID
  shopId: string;                     // Reference to /shops/{shopId}
  name: string;
  description: string;
  price: number;
  currency: string;                   // e.g. "PHP"
  category: string;
  images: string[];                   // URLs from Firebase Storage
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Indexes

Add the following Firestore composite indexes to support common queries:

- `shops`: `isActive` Ascending, `isVerified` Ascending
- `shops`: `isActive` Ascending, `location` Geo (if using GeoPoint)
- `products`: `shopId` Ascending, `isAvailable` Ascending
- `products`: `category` Ascending, `isAvailable` Ascending

## Security Rules Starter

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function hasRole(role) {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }

    match /roles/{roleId} {
      allow read: if true;
      allow write: if hasRole('super_admin');
    }

    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isSignedIn() && (request.auth.uid == userId || hasRole('super_admin'));
    }

    match /shops/{shopId} {
      allow read: if true;
      allow create: if isSignedIn() && (hasRole('super_admin') || hasRole('store_admin'));
      allow update, delete: if isSignedIn() &&
        (hasRole('super_admin') || resource.data.ownerId == request.auth.uid);
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if isSignedIn() &&
        (hasRole('super_admin') ||
         get(/databases/$(database)/documents/shops/$(resource.data.shopId)).data.ownerId == request.auth.uid);
    }
  }
}
```

This schema supports the requested roles and geo-enabled search feature.
