<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <NuxtLink to="/" class="sidebar-logo">
          <div class="logo-icon">
            <Logo :size="36" />
          </div>
          <span>My Near Shops</span>
        </NuxtLink>
        <div class="sidebar-user">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-info">
            <div class="user-name">{{ authStore.displayName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
        </div>
      </div>
      <nav class="sidebar-menu">
        <NuxtLink to="/dashboard" class="menu-item">
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/dashboard" class="menu-item">
          <span>My Stores</span>
        </NuxtLink>
        <NuxtLink to="/dashboard" class="menu-item">
          <span>Products</span>
        </NuxtLink>
        <NuxtLink to="/dashboard" class="menu-item">
          <span>Orders</span>
        </NuxtLink>
        <NuxtLink to="/dashboard" class="menu-item">
          <span>Users</span>
        </NuxtLink>
      </nav>
      <button class="logout-btn" @click="logout">Logout</button>
    </aside>
    <main class="dashboard-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { signOut } from 'firebase/auth';

const authStore = useAuthStore();
const { $firebase } = useNuxtApp() as any;

const initials = computed(() => {
  const name = authStore.displayName || 'U';
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
});

const userRole = computed(() => authStore.user?.role || 'Member');

const logout = async () => {
  try {
    await signOut($firebase.auth);
    authStore.logout();
    await navigateTo('/');
  } catch (e) {
    // ignore
  }
};
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background: #831843;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 28px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 28px;
  color: #fff;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f472b6 0%, #db2777 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.user-name {
  font-weight: 700;
  font-size: 15px;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-menu {
  flex: 1;
  padding: 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.2s;
}

.menu-item:hover,
.menu-item.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.logout-btn {
  margin: 20px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dashboard-main {
  flex: 1;
  background: #fff0f5;
  padding: 32px;
  overflow-y: auto;
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }

  .dashboard-main {
    padding: 24px;
  }
}
</style>
