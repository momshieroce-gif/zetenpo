<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ authStore.displayName }}</p>
      </div>
      <div class="user-pill">
        <div class="avatar">{{ initials }}</div>
        <div>
          <div class="name">{{ authStore.displayName }}</div>
          <div class="role">{{ userRole }}</div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card pink">
        <div class="stat-icon">S</div>
        <div>
          <div class="stat-value">12</div>
          <div class="stat-label">Total Shops</div>
        </div>
      </div>
      <div class="stat-card teal">
        <div class="stat-icon">P</div>
        <div>
          <div class="stat-value">348</div>
          <div class="stat-label">Products</div>
        </div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">O</div>
        <div>
          <div class="stat-value">86</div>
          <div class="stat-label">Orders Today</div>
        </div>
      </div>
      <div class="stat-card amber">
        <div class="stat-icon">U</div>
        <div>
          <div class="stat-value">1,240</div>
          <div class="stat-label">Users</div>
        </div>
      </div>
    </div>

    <div class="section-header-row">
      <h2 class="section-title-sm">Quick Actions</h2>
    </div>
    <div class="actions-grid">
      <NuxtLink to="/dashboard" class="action-card">
        <div class="action-icon pink">+</div>
        <div class="action-title">Add Shop</div>
        <div class="action-desc">Register a new store location</div>
      </NuxtLink>
      <NuxtLink to="/dashboard" class="action-card">
        <div class="action-icon teal">P</div>
        <div class="action-title">Add Product</div>
        <div class="action-desc">List a new product with images</div>
      </NuxtLink>
      <NuxtLink to="/dashboard" class="action-card">
        <div class="action-icon purple">U</div>
        <div class="action-title">Manage Users</div>
        <div class="action-desc">Assign roles and permissions</div>
      </NuxtLink>
      <NuxtLink to="/dashboard" class="action-card">
        <div class="action-icon amber">R</div>
        <div class="action-title">Reports</div>
        <div class="action-desc">View sales and analytics</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Dashboard | My Near Shops' });

const authStore = useAuthStore();

const initials = computed(() => {
  const name = authStore.displayName || 'U';
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
});

const userRole = computed(() => authStore.user?.role || 'Store Admin');
</script>

<style scoped>
.dashboard-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 32px; }
.page-title { font-size: 32px; font-weight: 900; margin: 0 0 6px; color: var(--gray-900); }
.page-subtitle { font-size: 15px; color: var(--gray-500); margin: 0; }
.user-pill { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid var(--pink-100); padding: 10px 16px; border-radius: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f472b6, #db2777); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.name { font-weight: 700; font-size: 14px; color: var(--gray-900); }
.role { font-size: 12px; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
.stat-card { background: #fff; border: 1px solid var(--gray-100); border-radius: 18px; padding: 22px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-4px); }
.stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #fff; }
.stat-icon.pink { background: linear-gradient(135deg, #db2777, #be185d); }
.stat-icon.teal { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.stat-icon.purple { background: linear-gradient(135deg, #a855f7, #7e22ce); }
.stat-icon.amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-value { font-size: 28px; font-weight: 900; color: var(--gray-900); line-height: 1; }
.stat-label { font-size: 13px; color: var(--gray-500); margin-top: 4px; }

.section-header-row { margin-bottom: 20px; }
.section-title-sm { font-size: 18px; font-weight: 800; color: var(--gray-900); margin: 0; }
.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.action-card { background: #fff; border: 1px solid var(--gray-100); border-radius: 18px; padding: 24px; transition: all 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.action-card:hover { transform: translateY(-4px); border-color: var(--pink-200); box-shadow: 0 12px 32px rgba(219,39,119,0.08); }
.action-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 16px; }
.action-icon.pink { background: linear-gradient(135deg, #db2777, #be185d); }
.action-icon.teal { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.action-icon.purple { background: linear-gradient(135deg, #a855f7, #7e22ce); }
.action-icon.amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
.action-title { font-size: 16px; font-weight: 800; color: var(--gray-900); margin-bottom: 4px; }
.action-desc { font-size: 13px; color: var(--gray-500); }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: 1fr; }
}
</style>
