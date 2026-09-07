import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export default defineNuxtPlugin({
  name: 'account-status',
  dependsOn: ['firebase'],
  setup(nuxtApp) {
  const authStore = useAuthStore();
  const firebase = (nuxtApp as any).$firebase;
  let unsubscribeUserDocument: (() => void) | null = null;
  let signingOutInactiveUser = false;

  const clearSession = async () => {
    if (signingOutInactiveUser) return;
    signingOutInactiveUser = true;
    unsubscribeUserDocument?.();
    unsubscribeUserDocument = null;

    try {
      await signOut(firebase.auth);
    } catch {
      // Clear local session state even if Firebase sign-out fails.
    }

    authStore.logout();
    document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
    await navigateTo({ path: '/login', query: { accountDisabled: '1' } });
  };

  const unsubscribeAuth = onAuthStateChanged(firebase.auth, (firebaseUser: any) => {
    unsubscribeUserDocument?.();
    unsubscribeUserDocument = null;

    if (!firebaseUser) return;
    unsubscribeUserDocument = onSnapshot(doc(firebase.db, 'users', firebaseUser.uid), (snapshot) => {
      if (snapshot.exists() && snapshot.data().isActive === false) {
        void clearSession();
      }
    });
  });

  nuxtApp.hook('app:beforeUnmount', () => {
    unsubscribeAuth();
    unsubscribeUserDocument?.();
  });
  },
});