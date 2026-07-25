function getAuthUserFromCookie() {
  const cookieHeader = typeof document !== 'undefined' ? document.cookie : '';
  const match = cookieHeader.match(/(?:^|; )auth_user=([^;]*)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  if (!authStore.isLoggedIn) {
    const user = getAuthUserFromCookie();
    if (user) authStore.setUser(user);
  }
});
