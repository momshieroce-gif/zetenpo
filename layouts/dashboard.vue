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
          <div ref="userLogsMenuRef" class="header-dropdown-wrap">
            <button class="header-icon-btn" aria-label="User Logs" @click="toggleUserLogsDropdown">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 3a9 9 0 1 0 8.95 10h-2.02A7 7 0 1 1 13 5v4l6-5-6-5v4zm-1 6h2v6h-2V9zm0 8h2v2h-2v-2z" fill="currentColor"/></svg>
            </button>
            <div v-if="showUserLogsDropdown" class="header-dropdown-card">
              <div class="header-dropdown-title-row">
                <div class="header-dropdown-title">User Logs</div>
                <button class="header-dropdown-link" @click="navigateTo('/dashboard/profile'); showUserLogsDropdown = false">Profile</button>
              </div>
              <div v-if="loadingUserLogs" class="header-dropdown-state">Loading latest logs...</div>
              <div v-else-if="userLogsError" class="header-dropdown-state error">{{ userLogsError }}</div>
              <div v-else-if="!latestUserLogs.length" class="header-dropdown-state">No logs yet.</div>
              <ul v-else class="header-dropdown-list">
                <li v-for="log in latestUserLogs" :key="log.id" class="header-dropdown-item" @click="openLogRoute(log.routePath)">
                  <div class="header-dropdown-item-top">
                    <span class="operation-chip" :class="`op-${log.operation}`">{{ log.operation }}</span>
                  </div>
                  <div class="header-dropdown-route">{{ log.routePath || '/' }}</div>
                  <div class="header-dropdown-time">{{ formatLogTime(log.createdAt) }}</div>
                </li>
              </ul>
            </div>
          </div>
          <button class="header-icon-btn" aria-label="Logout" @click="handleLogout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>
          </button>
        </div>
      </div>
    </header>

    <aside class="sidebar" :class="{ open: leftDrawerOpen }">
      <div class="sidebar-brand">
        <div>
          <div class="brand-sub">{{ userRole }}</div>
        </div>
      </div>
      <div class="sidebar-section-label">Menu</div>
      <nav class="sidebar-menu">
        <NuxtLink to="/dashboard" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg></span>
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink v-if="canViewShops" to="/dashboard/shops" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0 2.5-1.12 2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg></span>
          <span>Shops</span>
        </NuxtLink>
        <NuxtLink to="/dashboard/transactions" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg></span>
          <span>Transactions</span>
        </NuxtLink>

        <NuxtLink v-if="canViewUsers" to="/dashboard/users" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg></span>
          <span>Users</span>
        </NuxtLink>

        <NuxtLink  v-if="canViewShops" to="/dashboard/shop-inquiries" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v14l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/></svg></span>
          <span>Shop Inquiries</span>
        </NuxtLink>

        <NuxtLink to="/dashboard/inquiries" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1H4a1 1 0 0 1-1-1V9Zm2 0v7h14V9H5Zm1 2h2v3H6v-3Zm4 0h2v3H10v-3Zm4 0h2v3h-2v-3Zm4 0h2v3h-2v-3Z" fill="currentColor"/></svg></span>
          <span>Product Inquiries</span>
        </NuxtLink>

        <NuxtLink v-if="canViewSubscriptions" to="/dashboard/subscriptions" class="menu-item">
          <span class="menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 13.98l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L12 2Zm0 13.73 2.68 1.41-.51-2.98 2.16-2.1-2.99-.43L12 8.91l-1.34 2.72-2.99.43 2.16 2.1-.51 2.98L12 15.73Z" fill="currentColor"/></svg></span>
          <span>Subscriptions</span>
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
import { collection, getDocs, limit, logUserAuthActivity, orderBy, query } from '~/utils/firestoreLogger';

const authStore = useAuthStore();
const { $firebase } = useNuxtApp() as any;
const authCookie = useCookie<string | null>('auth_user');

const leftDrawerOpen = ref(false);
const showLogoutDialog = ref(false);
const showUserLogsDropdown = ref(false);
const loadingUserLogs = ref(false);
const userLogsError = ref('');
const userLogsMenuRef = ref<HTMLElement | null>(null);
const latestUserLogs = ref<Array<{
  id: string;
  operation: string;
  routePath: string | null;
  createdAt: any;
}>>([]);

const initials = computed(() => {
  const name = authStore.displayName || 'U';
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
});

const userRole = computed(() => authStore.user?.role || 'Member');
const canViewUsers = computed(() => ['super-admin','store-admin'].includes(authStore.user?.roleId || ''));
const canViewShops = computed(() => ['super-admin','store-admin', 'store-staff'].includes(authStore.user?.roleId || ''));
const canViewSubscriptions = computed(() => {
  const roleId = String(authStore.user?.roleId || '').toLowerCase().replace(/[_\s]+/g, '-');
  const role = String(authStore.user?.role || '').toLowerCase().replace(/[_\s]+/g, '-');
  return roleId === 'store-admin' || role === 'store-admin';
});

const handleLogout = () => {
  showLogoutDialog.value = true;
  leftDrawerOpen.value = false;
  showUserLogsDropdown.value = false;
};

const fetchLatestUserLogs = async () => {
  loadingUserLogs.value = true;
  userLogsError.value = '';
  try {
    const db = $firebase?.db;
    if (!db) throw new Error('Database is not available.');

    const logsQuery = query(
      collection(db, 'userLogs'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(logsQuery);
    latestUserLogs.value = snapshot.docs.map((entry: any) => {
      const data = entry.data() as any;
      return {
        id: entry.id,
        operation: String(data.operation || 'unknown'),
        routePath: data.routePath || null,
        createdAt: data.createdAt || null,
      };
    });
  } catch (e: any) {
    userLogsError.value = e?.message || 'Unable to load logs.';
  } finally {
    loadingUserLogs.value = false;
  }
};

const toggleUserLogsDropdown = async () => {
  showUserLogsDropdown.value = !showUserLogsDropdown.value;
  if (showUserLogsDropdown.value) {
    await fetchLatestUserLogs();
  }
};

const openLogRoute = async (routePath: string | null) => {
  const target = typeof routePath === 'string' && routePath.startsWith('/') ? routePath : '/';
  showUserLogsDropdown.value = false;
  await navigateTo(target);
};

const formatLogTime = (createdAt: any) => {
  let dateValue: Date | null = null;
  if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
    dateValue = createdAt.toDate();
  }
  if (!dateValue) return 'No timestamp';
  return dateValue.toLocaleString();
};

const onDocumentClick = (event: MouseEvent) => {
  if (!showUserLogsDropdown.value) return;
  if (userLogsMenuRef.value && !userLogsMenuRef.value.contains(event.target as Node)) {
    showUserLogsDropdown.value = false;
  }
};

const logout = async () => {
  try {
    await signOut($firebase.auth);
    await logUserAuthActivity('logout', 'success', { source: 'dashboard-layout' });
  } catch (e: any) {
    await logUserAuthActivity('logout', 'error', { source: 'dashboard-layout', message: e?.message || 'Logout failed.' });
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

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});
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
.header-dropdown-wrap { position: relative; }
.header-dropdown-card { position: absolute; top: calc(100% + 10px); right: 0; width: 360px; max-height: 420px; overflow-y: auto; border-radius: 14px; background: #0f172a; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 18px 42px rgba(0,0,0,0.35); padding: 12px; z-index: 80; }
.header-dropdown-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.header-dropdown-title { color: #f8fafc; font-size: 14px; font-weight: 800; }
.header-dropdown-link { border: none; background: transparent; color: #818cf8; font-size: 12px; font-weight: 700; cursor: pointer; }
.header-dropdown-state { color: #cbd5e1; font-size: 12px; padding: 8px 4px; }
.header-dropdown-state.error { color: #fca5a5; }
.header-dropdown-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.header-dropdown-item { border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); padding: 10px; }
.header-dropdown-item { cursor: pointer; transition: background 0.2s, border-color 0.2s; }
.header-dropdown-item:hover { background: rgba(255,255,255,0.1); border-color: rgba(129,140,248,0.45); }
.header-dropdown-item-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.operation-chip { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 999px; padding: 2px 8px; }
.operation-chip.op-read { background: rgba(59,130,246,0.2); color: #93c5fd; }
.operation-chip.op-write { background: rgba(34,197,94,0.2); color: #86efac; }
.operation-chip.op-delete { background: rgba(239,68,68,0.2); color: #fca5a5; }
.operation-chip.op-login { background: rgba(245,158,11,0.2); color: #fcd34d; }
.operation-chip.op-logout { background: rgba(168,85,247,0.2); color: #d8b4fe; }
.header-dropdown-route { color: #e2e8f0; font-size: 12px; font-weight: 600; margin-bottom: 4px; word-break: break-word; }
.header-dropdown-time { color: #94a3b8; font-size: 11px; }

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
  .header-dropdown-card { width: min(360px, calc(100vw - 24px)); }
}
</style>
