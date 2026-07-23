export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const authStore = useAuthStore();
    if (!authStore.isLoggedIn && to.path !== '/login') {
      return navigateTo('/login');
    }
  }
});
