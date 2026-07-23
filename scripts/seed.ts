import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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
  await resetCollections(['roles', 'users', 'shops', 'products']);

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
      id: 'super-staff',
      name: 'Super Staff',
      slug: 'super-staff',
      description: 'System-level staff with limited admin permissions.',
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
  ];

  for (const role of roles) {
    const { id, ...data } = role;
    await db.collection('roles').doc(id).set({ ...data, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${roles.length} roles.`);

  // --- Users ---
  const superAdminId = db.collection('users').doc().id;
  const users = [
    {
      id: superAdminId,
      name: 'Seed Super Admin',
      email: 'admin@mynearshops.local',
      phone: '+1234567890',
      roleId: 'super-admin',
      role: 'Super Admin',
      latitude: 10.3621945,
      longitude: 123.98721099999999,
      isActive: true,
      address: 'Manila, Philippines',
    },
  ];

  for (const user of users) {
    const { id, ...data } = user;
    await db.collection('users').doc(id).set({ ...data, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${users.length} users.`);

  // --- Shops ---
  const SHOP_COUNT = 50;
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
      id: db.collection('shops').doc().id,
      name: `Shop ${i + 1}`,
      ownerId: superAdminId,
      description: `Description for shop ${i + 1}`,
      address: `${i + 1} Generated Street, Manila`,
      latitude,
      longitude,
      phone: `+639${String(100000000 + i).padStart(9, '0')}`,
      isActive: true,
      logo: '',
      coverImage: '',
    });
  }

  for (const shop of shops) {
    const { id, ...data } = shop;
    await db.collection('shops').doc(id).set({ ...data, createdAt: now(), updatedAt: now() });
  }
  console.log(`Seeded ${shops.length} shops.`);

  // --- Products ---
  const adjectives = ['Classic', 'Modern', 'Premium', 'Eco', 'Smart', 'Wireless', 'Comfort', 'Pro', 'Sleek', 'Durable'];
  const nouns = ['Headphones', 'Backpack', 'Sneakers', 'Watch', 'Speaker', 'Bottle', 'Sunglasses', 'Jacket', 'Keyboard', 'Mouse', 'Wallet', 'Bag', 'Lamp', 'Notebook', 'Phone Case', 'Charger', 'Power Bank', 'Water Bottle', 'Travel Mug', 'Desk Mat', 'Yoga Mat', 'Tote', 'Beanie', 'Scarf', 'Gloves', 'Umbrella', 'Journal', 'Pillow', 'Stand', 'Hub', 'Cable', 'Adapter', 'Screen', 'Camera', 'Tripod', 'Flashlight', 'Toolkit', 'Speaker', 'Earbuds', 'Tracker', 'Router', 'Monitor', 'Mat', 'Planter', 'Frame', 'Clock', 'Rug', 'Chair', 'Shelf'];
  const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Accessories', 'Gadgets', 'Lifestyle'];
  const productsPerShop = 100;
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
        category,
        tags: [adj.toLowerCase(), category.toLowerCase()],
        createdAt: now(),
        updatedAt: now(),
      });
      batchCount++;
      totalProducts++;
      if (batchCount === 500) {
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

  console.log('Firestore seed completed successfully.');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
