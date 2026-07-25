<template>
  <div class="dashboard-layout">
    <header class="dashboard-header">
      <div class="header-inner">
        <button class="header-menu-btn" aria-label="Open menu" @click="leftDrawerOpen = !leftDrawerOpen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
        <div class="header-title" @click="navigateTo('/')" style="cursor: pointer;">
          <Logo :size="42" />
          <span>My Near Shops</span>
        </div>
        <div class="header-actions">
          <button class="header-icon-btn" aria-label="Profile" @click="navigateTo('/dashboard/profile')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/></svg>
          </button>
          <button class="header-icon-btn" aria-label="Logout" @click="handleLogout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>
          </button>
        </div>
      </div>
    </header>

    <aside class="sidebar" :class="{ open: leftDrawerOpen }">
      <div class="sidebar-brand">
        <div>
          <div class="brand-sub">Admin Dashboard</div>
        </div>
      </div>
      <div class="sidebar-section-label">Menu</div>
      <nav class="sidebar-menu">
        <NuxtLink to="/dashboard" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg></span>
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/dashboard/shops" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg></span>
          <span>Shops</span>
        </NuxtLink>
        <NuxtLink to="/dashboard/transactions" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg></span>
          <span>Transactions</span>
        </NuxtLink>
        <NuxtLink to="/dashboard/users" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg></span>
          <span>Users</span>
        </NuxtLink>
        <NuxtLink to="/dashboard/profile" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg></span>
          <span>Profile</span>
        </NuxtLink>
      </nav>
      <div class="user-card">
        <div class="user-card-top">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-info">
            <div class="user-name">{{ authStore.displayName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
        </div>
        <div class="user-card-divider"></div>
        <button class="logout-row" @click="handleLogout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <div class="sidebar-backdrop" :class="{ open: leftDrawerOpen }" @click="leftDrawerOpen = false"></div>

    <main class="dashboard-main">
      <slot />
    </main>

    <div v-if="showLogoutDialog" class="logout-overlay">
      <div class="logout-card">
        <div class="logout-title">Logout</div>
        <div class="logout-subtitle">Are you sure you want to logout?</div>
        <div class="logout-actions">
          <button class="cancel-btn" @click="showLogoutDialog = false">Cancel</button>
          <button class="logout-confirm-btn" @click="confirmLogout">Logout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signOut } from 'firebase/auth';

const authStore = useAuthStore();
const { $firebase } = useNuxtApp() as any;
const authCookie = useCookie<string | null>('auth_user');

const leftDrawerOpen = ref(false);
const showLogoutDialog = ref(false);

const initials = computed(() => {
  const name = authStore.displayName || 'U';
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
});

const userRole = computed(() => authStore.user?.role || 'Member');

const handleLogout = () => {
  showLogoutDialog.value = true;
  leftDrawerOpen.value = false;
};

const logout = async () => {
  try {
    await signOut($firebase.auth);
  } catch (e) {
    // ignore
  }
  authStore.logout();
  authCookie.value = null;
  document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  showLogoutDialog.value = false;
  await navigateTo('/');
};

const confirmLogout = async () => {
  await logout();
};
</script>

<style scoped>
.dashboard-layout { min-height: 100vh; background: #f8fafc; }

.dashboard-header { position: fixed; top: 0; left: 0; right: 0; z-index: 50; height: 64px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.header-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; padding: 0 24px; max-width: 1400px; margin: 0 auto; }
.header-menu-btn { width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.12); border: none; color: #fff; display: none; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
.header-menu-btn:hover { background: rgba(255,255,255,0.2); }
.header-title { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; color: #fff; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.header-icon-btn { width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.1); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
.header-icon-btn:hover { background: rgba(255,255,255,0.2); }

.sidebar { position: fixed; top: 64px; left: 0; bottom: 0; width: 280px; background: #0f172a; color: #fff; display: flex; flex-direction: column; overflow-y: auto; z-index: 40; box-shadow: 4px 0 24px rgba(0,0,0,0.2); border-right: 1px solid rgba(255, 255, 255, 0.08); }
.sidebar-brand { display: flex; align-items: center; gap: 14px; padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.brand-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; }
.brand-name { font-size: 18px; font-weight: 800; color: #fff; }
.brand-sub { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 20px; background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.sidebar-section-label { padding: 20px 24px 8px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
.sidebar-menu { flex: 1; padding: 0 16px 16px; display: flex; flex-direction: column; gap: 4px; }
.menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.85); transition: all 0.2s; text-decoration: none; cursor: pointer; }
.menu-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
.menu-item.router-link-exact-active { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; }
.menu-icon { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; }
.menu-icon svg { display: block; }
.user-card { margin: 16px; margin-top: auto; padding: 16px; border-radius: 16px; background: #1e293b; border: 1px solid rgba(255,255,255,0.08); }
.user-card-top { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.user-name { font-weight: 700; font-size: 15px; color: #fff; }
.user-role { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
.user-card-divider { height: 1px; background: rgba(255,255,255,0.12); margin: 12px 0; }
.logout-row { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 0; border: none; background: transparent; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.logout-row:hover { opacity: 0.8; }

.sidebar-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 35; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
.sidebar-backdrop.open { opacity: 1; pointer-events: auto; }

.dashboard-main { margin-left: 280px; padding: 88px 32px 32px; min-height: 100vh; background: #f8fafc; overflow-y: auto; }

.logout-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; }
.logout-card { width: 100%; max-width: 400px; background: #1e293b; border-radius: 24px; padding: 28px; box-shadow: 0 24px 60px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); }
.logout-title { font-size: 20px; font-weight: 800; color: #f8fafc; margin-bottom: 6px; }
.logout-subtitle { font-size: 14px; color: #94a3b8; }
.logout-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.cancel-btn { padding: 10px 20px; border-radius: 12px; border: none; background: #334155; color: #e2e8f0; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.cancel-btn:hover { background: #475569; }
.logout-confirm-btn { padding: 10px 20px; border-radius: 12px; border: none; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.logout-confirm-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(239,68,68,0.35); }

@media (max-width: 900px) {
  .header-menu-btn { display: flex; }
  .sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
  .sidebar.open { transform: translateX(0); }
  .dashboard-header { z-index: 60; }
  .dashboard-main { margin-left: 0; padding: 88px 20px 24px; }
}
</style>
