import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public;
  const projectAuthDomain = config.firebaseProjectId ? `${config.firebaseProjectId}.firebaseapp.com` : '';
  const authDomain = config.firebaseAuthDomain.trim() || projectAuthDomain;

  const firebaseConfig = {
    apiKey: config.firebaseApiKey,
    authDomain,
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket,
    messagingSenderId: config.firebaseMessagingSenderId,
    appId: config.firebaseAppId,
    measurementId: config.firebaseMeasurementId,
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  return { provide: { firebase: { app, auth, db, storage } } };
});
