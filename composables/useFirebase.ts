export const useFirebase = () => {
  const nuxtApp = useNuxtApp();
  const firebase = nuxtApp.$firebase as { app: any; auth: any; db: any; storage: any } | undefined;
  if (!firebase) throw new Error('Firebase plugin is not available');
  return firebase;
};
