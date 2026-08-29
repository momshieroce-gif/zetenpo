import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public;
  const projectAuthDomain = config.firebaseProjectId ? `${config.firebaseProjectId}.firebaseapp.com` : '';
  const configuredAuthDomain = config.firebaseAuthDomain.trim();
  const authDomain = configuredAuthDomain === window.location.hostname
    ? projectAuthDomain
    : configuredAuthDomain || projectAuthDomain;

  if (configuredAuthDomain === window.location.hostname && authDomain) {
    console.warn(
      `Firebase authDomain "${configuredAuthDomain}" points at this site, but /__/auth/handler is not hosted here. ` +
      `Using "${authDomain}" instead. Update NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN in the deployment environment.`,
    );
  }

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
