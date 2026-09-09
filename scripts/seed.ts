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

async function seed() {
  const deliveryProviders = [
    { id: 'handle-by-the-store', name: 'Handle By the Store' },
    { id: 'maxim', name: 'Maxim' },
    { id: 'move-it', name: 'Move it' },
  ];

  const batch = db.batch();

  for (const provider of deliveryProviders) {
    const providerRef = db.collection('deliveryProviders').doc(provider.id);
    batch.set(providerRef, { name: provider.name });
  }

  await batch.commit();
  console.log(`Seeded ${deliveryProviders.length} delivery providers.`);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
