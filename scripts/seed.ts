import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

const serviceAccountPath = resolve(process.cwd(), 'scripts/service-account.json');

if (!existsSync(serviceAccountPath)) {
  console.error('Missing scripts/service-account.json.');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const now = () => FieldValue.serverTimestamp();
//superAdmin@mynearshops.local,
//superdelivery@mynearshops.local,
//storeadmin@mynearshops.local,
//staff@mynearshops.local,
//delivery@mynearshops.local,
//customer@mynearshops.local
const DEMO_PASSWORD = 'demo12345';
const hashPassword = (password: string) => createHash('sha256').update(password).digest('hex');

async function deleteCollectionInBatches(path: string, batchSize = 500) {
  const collectionRef = db.collection(path);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  let deleted = 0;
  let snapshot = await query.get();

  while (!snapshot.empty) {
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snapshot.size;
    if (snapshot.size < batchSize) break;
    snapshot = await query.get();
  }

  return deleted;
}

async function resetCollections(paths: string[]) {
  console.log('Resetting Firestore collections...');
  for (const path of paths) {
    const deleted = await deleteCollectionInBatches(path);
    if (deleted > 0) {
      console.log(`  Cleared ${deleted} documents from ${path}`);
    }
  }
}

async function seed() {
  await resetCollections(['roles', 'users', 'shops', 'shopMembers', 'products', 'delivery_charge', 'delivery_methods', 'payment_methods', 'transactions']);

  console.log('Starting Firestore seed...');

  // --- Roles ---
  const roles = [
    {
      id: 'super-admin',
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full system access and user management.',
      level: 1,
    },
    {
      id: 'super-delivery',
      name: 'Super Delivery',
      slug: 'super-delivery',
      description: 'Deliver the purchases',
      level: 2,
    },
    {
      id: 'store-admin',
      name: 'Store Admin',
      slug: 'store-admin',
      description: 'Manages one or more shops and store staff.',
      level: 3,
    },
    {
      id: 'store-staff',
      name: 'Store Staff',
      slug: 'store-staff',
      description: 'Handles daily store operations and products.',
      level: 4,
    },
    {
      id: 'store-delivery',
      name: 'Store Delivery',
      slug: 'store-delivery',
      description: 'Deliver the purchases',
      level: 5,
    },
    {
      id: 'customer',
      name: 'Customer',
      slug: 'customer',
      description: 'Regular customer who can make purchases.',
      level: 6,
    }
  ];

  for (const role of roles) {
    const { id, ...data } = role;
    await db.collection('roles').doc(id).set({ ...data, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${roles.length} roles.`);

  // --- Users ---
  const superAdminId = db.collection('users').doc().id;
  const superDeliveryId = db.collection('users').doc().id;
  const storeAdminId = db.collection('users').doc().id;
  const storeStaffId = db.collection('users').doc().id;
  const deliveryId = db.collection('users').doc().id;
  const customerId = db.collection('users').doc().id;
  const SHOP_COUNT = 50;
  const shopIds = Array.from({ length: SHOP_COUNT }, () => db.collection('shops').doc().id);
  const users = [
    {
      id: superAdminId,
      name: 'Seed Super Admin',
      email: 'superAdmin@mynearshops.local',
      password_hash: hashPassword(DEMO_PASSWORD),
      phone: '+1234567890',
      roleId: roles[0].id,
      role: roles[0].name,
      latitude: 10.3621945,
      longitude: 123.98721099999999,
      isActive: true,
      address: 'Manila, Philippines',
    },
    {
      id: superDeliveryId,
      name: 'Seed Super Delivery',
      email: 'superdelivery@mynearshops.local',
      password_hash: hashPassword(DEMO_PASSWORD),
      phone: '+1234567891',
      roleId: roles[1].id,
      role: roles[1].name,
      latitude: 10.3621945,
      longitude: 123.98721099999999,
      isActive: true,
      address: 'Manila, Philippines',
    },
    {
      id: storeAdminId,
      name: 'Seed Store Admin',
      email: 'storeadmin@mynearshops.local',
      password_hash: hashPassword(DEMO_PASSWORD),
      phone: '+1234567892',
      roleId: roles[2].id,
      role: roles[2].name,
      latitude: 10.3621945,
      longitude: 123.98721099999999,
      isActive: true,
      address: 'Cebu, Philippines',
    },
    {
      id: storeStaffId,
      name: 'Seed Store Staff',
      email: 'staff@mynearshops.local',
      password_hash: hashPassword(DEMO_PASSWORD),
      phone: '+1234567893',
      roleId: roles[3].id,
      role: roles[3].name,
      latitude: 10.3621945,
      longitude: 123.98721099999999,
      isActive: true,
      address: 'Davao, Philippines',
    },
    {
      id: deliveryId,
      name: 'Seed Store Delivery',
      email: 'delivery@mynearshops.local',
      password_hash: hashPassword(DEMO_PASSWORD),
      phone: '+1234567894',
      roleId: roles[4].id,
      role: roles[4].name,
      latitude: 10.3621945,
      longitude: 123.98721099999999,
      isActive: true,
      address: 'Manila, Philippines'
    },
    {
      id: customerId,
      name: 'Seed Customer',
      email: 'customer@mynearshops.local',
      password_hash: hashPassword(DEMO_PASSWORD),
      phone: '+1234567895',
      roleId: roles[5].id,
      role: roles[5].name,
      latitude: 10.3621945,
      longitude: 123.98721099999999,
      isActive: true,
      address: 'Manila, Philippines',
    },
  ];

  // Ensure the Auth UID matches the Firestore users doc ID so security rules can resolve the role.
  for (const user of users) {
    try {
      await admin.auth().createUser({
        uid: user.id,
        email: user.email,
        password: DEMO_PASSWORD,
        displayName: user.name,
      });
      console.log(`Created Firebase Auth user ${user.email}.`);
    } catch (e: any) {
      if (e.code === 'auth/uid-already-exists') {
        await admin.auth().updateUser(user.id, {
          email: user.email,
          password: DEMO_PASSWORD,
        });
        console.log(`Updated Firebase Auth user ${user.email}.`);
      } else {
        throw e;
      }
    }
  }

  for (const user of users) {
    const { id, ...data } = user;
    await db.collection('users').doc(id).set({ ...data, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${users.length} users.`);

  // --- Shops ---
  const centerLat = 10.3621945;
  const centerLon = 123.98721099999999;

  function randomPointWithinRadius(lat: number, lon: number, radiusKm: number) {
    const d = radiusKm * Math.sqrt(Math.random());
    const brng = 2 * Math.PI * Math.random();
    const latRad = lat * (Math.PI / 180);
    const deltaLat = (d * Math.cos(brng)) / 111.32;
    const deltaLon = (d * Math.sin(brng)) / (111.32 * Math.cos(latRad));
    return {
      latitude: lat + deltaLat,
      longitude: lon + deltaLon,
    };
  }

  const shops = [];
  for (let i = 0; i < SHOP_COUNT; i++) {
    const { latitude, longitude } = randomPointWithinRadius(centerLat, centerLon, 20);
    shops.push({
      id: shopIds[i],
      name: `Shop ${i + 1}`,
      ownerId: users[Math.floor(Math.random() * users.length)].id,
      description: `Description for shop ${i + 1}`,
      address: `${i + 1} Generated Street, Manila`,
      latitude,
      longitude,
      phone: `+639${String(100000000 + i).padStart(9, '0')}`,
      isActive: true,
      logo: '',
      coverImage: '',
      deletedAt: null,
    });
  }

  for (const shop of shops) {
    const { id, ...data } = shop;
    await db.collection('shops').doc(id).set({ ...data, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${shops.length} shops.`);

  // --- Shop Members ---
  const shopMembers = [
    {
      id: `${shops[0].id}_${deliveryId}`,
      shopId: shops[0].id,
      uid: deliveryId,
      role: 'delivery',
    },
    {
      id: `${shops[0].id}_${storeStaffId}`,
      shopId: shops[0].id,
      uid: storeStaffId,
      role: 'cashier',
    },
    {
      id: `${shops[1].id}_${storeAdminId}`,
      shopId: shops[1].id,
      uid: storeAdminId,
      role: 'staff',
    },
  ];

  for (const member of shopMembers) {
    const { id, ...data } = member;
    await db.collection('shopMembers').doc(id).set({ ...data, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${shopMembers.length} shop members.`);

  // --- Products ---
  const adjectives = ['Classic', 'Modern', 'Premium', 'Eco', 'Smart', 'Wireless', 'Comfort', 'Pro', 'Sleek', 'Durable'];
  const nouns = ['Headphones', 'Backpack', 'Sneakers', 'Watch', 'Speaker', 'Bottle', 'Sunglasses', 'Jacket', 'Keyboard', 'Mouse', 'Wallet', 'Bag', 'Lamp', 'Notebook', 'Phone Case', 'Charger', 'Power Bank', 'Water Bottle', 'Travel Mug', 'Desk Mat', 'Yoga Mat', 'Tote', 'Beanie', 'Scarf', 'Gloves', 'Umbrella', 'Journal', 'Pillow', 'Stand', 'Hub', 'Cable', 'Adapter', 'Screen', 'Camera', 'Tripod', 'Flashlight', 'Toolkit', 'Speaker', 'Earbuds', 'Tracker', 'Router', 'Monitor', 'Mat', 'Planter', 'Frame', 'Clock', 'Rug', 'Chair', 'Shelf'];
  const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Accessories', 'Gadgets', 'Lifestyle'];
  const productsPerShop = 10;
  let batch = db.batch();
  let batchCount = 0;
  let totalProducts = 0;

  for (const shop of shops) {
    for (let i = 0; i < productsPerShop; i++) {
      const adj = adjectives[i % adjectives.length];
      const noun = nouns[Math.floor(i / adjectives.length) % nouns.length];
      const category = categories[i % categories.length];
      const docRef = db.collection('products').doc();
      batch.set(docRef, {
        shopId: shop.id,
        name: `${adj} ${noun} ${i + 1}`,
        description: `A ${adj.toLowerCase()} ${noun.toLowerCase()} perfect for everyday use.`,
        price: parseFloat((Math.random() * 490 + 9.99).toFixed(2)),
        stock: Math.floor(Math.random() * 200) + 1,
        images: Array.from({ length: Math.floor(Math.random() * 3) + 4 }, (_, j) => `https://picsum.photos/seed/${shop.id}-${i}-${j}/300/200`),
        isActive: true,
        deletedAt: null,
        category,
        tags: [adj.toLowerCase(), category.toLowerCase()],
        createdAt: now(),
        updatedAt: now(),
      });
      batchCount++;
      totalProducts++;
      if (batchCount === 10) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
  console.log(`Seeded ${totalProducts} products.`);

  // --- Delivery Charges ---
  const deliveryCharges = [];
  for (const shop of shops) {
    deliveryCharges.push({
      store_id: shop.id,
      standard_delivery_charge: parseFloat((Math.random() * 30 + 50).toFixed(2)),
      amount_per_km: parseFloat((Math.random() * 10 + 5).toFixed(2)),
    });
  }

  for (const charge of deliveryCharges) {
    const docRef = db.collection('delivery_charge').doc();
    await docRef.set({ ...charge, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${deliveryCharges.length} delivery charges.`);

  // --- Delivery Methods ---
  const deliveryMethods = [
    { name: 'Pickup from the store', slug: 'pickup', description: 'Pick up your order at the store.', is_active: true, sort_order: 1 },
    { name: 'Deliver to your location', slug: 'delivery', description: 'We deliver the order to your address.', is_active: true, sort_order: 2 },
  ];

  for (const method of deliveryMethods) {
    const docRef = db.collection('delivery_methods').doc();
    await docRef.set({ ...method, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${deliveryMethods.length} delivery methods.`);

  // --- Payment Methods ---
  const paymentMethods = [
    { name: 'Cash', slug: 'cash', description: 'Pay with cash upon delivery or pickup.', is_active: true, sort_order: 1 },
    { name: 'Gcash', slug: 'gcash', description: 'Pay via GCash.', is_active: true, sort_order: 2 },
    { name: 'Bank Transfer', slug: 'bank-transfer', description: 'Transfer to our bank account.', is_active: true, sort_order: 3 },
  ];

  for (const method of paymentMethods) {
    const docRef = db.collection('payment_methods').doc();
    await docRef.set({ ...method, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${paymentMethods.length} payment methods.`);

  // --- Transaction Statuses ---
  const transactionStatuses = [
    { name: 'Pending', slug: 'pending', description: 'Order is awaiting confirmation.', is_active: true, sort_order: 1 },
    { name: 'Preparing Order', slug: 'preparing-order', description: 'Order is being prepared.', is_active: true, sort_order: 2 },
    { name: 'Ready for Pickup', slug: 'ready-for-pickup', description: 'Order is ready for customer pickup.', is_active: true, sort_order: 3 },
    { name: 'Delivery in Progress', slug: 'delivery-in-progress', description: 'Order is out for delivery.', is_active: true, sort_order: 4 },
    { name: 'Order Received', slug: 'order-received', description: 'Customer has received the order.', is_active: true, sort_order: 5 },
    { name: 'Completed', slug: 'completed', description: 'Transaction is complete.', is_active: true, sort_order: 6 },
    { name: 'Return or Reimbursement', slug: 'return-or-reimbursement', description: 'Order is being returned or reimbursed.', is_active: true, sort_order: 7 },
  ];

  for (const status of transactionStatuses) {
    const docRef = db.collection('transaction_statuses').doc();
    await docRef.set({ ...status, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${transactionStatuses.length} transaction statuses.`);

  // --- Transactions ---
  const TRANSACTIONS_COUNT = 10;
  const transactions = [];
  for (let i = 0; i < Math.min(TRANSACTIONS_COUNT, shops.length); i++) {
    const shop = shops[i];
    const user = users[0];
    const orderItems = [];
    const itemCount = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < itemCount; j++) {
      const price = parseFloat((Math.random() * 490 + 9.99).toFixed(2));
      const qty = Math.floor(Math.random() * 3) + 1;
      orderItems.push({
        product_id: db.collection('products').doc().id,
        shop_id: shop.id,
        name: `Sample Product ${j + 1}`,
        price,
        qty,
        subtotal: parseFloat((price * qty).toFixed(2)),
      });
    }
    const subtotal = parseFloat(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    const isPickup = Math.random() > 0.5;
    const deliveryCharge = isPickup ? 0 : parseFloat((Math.random() * 50 + 50).toFixed(2));
    const total = parseFloat((subtotal + deliveryCharge).toFixed(2));
    transactions.push({
      order_number: `TRX-${Date.now().toString().slice(-6)}-${i + 1}`,
      user_id: user.id,
      store_id: shop.id,
      user_location: { latitude: user.latitude, longitude: user.longitude },
      store_location: { latitude: shop.latitude, longitude: shop.longitude },
      delivery_location: { latitude: user.latitude, longitude: user.longitude, address: user.address },
      delivery_method: isPickup ? 'pickup' : 'delivery',
      payment_method: ['cash', 'gcash', 'bank-transfer'][Math.floor(Math.random() * 3)],
      items: orderItems,
      subtotal,
      delivery_charge: deliveryCharge,
      total,
      customer_mobile: user.phone,
      customer_note: isPickup ? 'I will pick up after 5 PM.' : 'Please deliver to the front desk.',
      status: transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)].slug,
    });
  }

  for (const transaction of transactions) {
    const docRef = db.collection('transactions').doc();
    await docRef.set({ ...transaction, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${transactions.length} transactions.`);

  console.log('Firestore seed completed successfully.');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
