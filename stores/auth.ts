import type { UserProfile } from '~/types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserProfile | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    displayName: (state) => state.user?.displayName || state.user?.email || 'User',
  },
  actions: {
    setUser(user: UserProfile | null) {
      this.user = user;
    },
    logout() {
      this.user = null;
    },
  },
});
