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

    <div v-if="loading" class="state loading">
      <div class="spinner"></div>
      <p>Loading dashboard...</p>
    </div>

    <template v-else>
      <div v-if="isAdmin" class="stats-grid">
        <div class="stat-card pink">
          <div class="stat-icon">S</div>
          <div>
            <div class="stat-value">{{ summary.shops }}</div>
            <div class="stat-label">{{ isSuperAdmin ? 'Total Shops' : 'My Shops' }}</div>
          </div>
        </div>
        <div class="stat-card teal">
          <div class="stat-icon">P</div>
          <div>
            <div class="stat-value">{{ summary.products }}</div>
            <div class="stat-label">{{ isSuperAdmin ? 'Products' : 'My Products' }}</div>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">O</div>
          <div>
            <div class="stat-value">{{ summary.transactions }}</div>
            <div class="stat-label">{{ isSuperAdmin ? 'Orders' : 'My Orders' }}</div>
          </div>
        </div>
        <div class="stat-card amber">
          <div class="stat-icon">U</div>
          <div>
            <div class="stat-value">{{ summary.users }}</div>
            <div class="stat-label">{{ isSuperAdmin ? 'Users' : 'Staff / Users' }}</div>
          </div>
        </div>
      </div>

      <template v-if="isAdmin">
        <div class="section-header-row">
          <h2 class="section-title-sm">Quick Actions</h2>
        </div>
        <div class="actions-grid">
          <NuxtLink v-if="isSuperAdmin" to="/dashboard/shops" class="action-card">
            <div class="action-icon pink">+</div>
            <div class="action-title">Add Shop</div>
            <div class="action-desc">Register a new store location</div>
          </NuxtLink>
          <NuxtLink to="/dashboard/shops" class="action-card">
            <div class="action-icon teal">P</div>
            <div class="action-title">Add Product</div>
            <div class="action-desc">List a new product with images</div>
          </NuxtLink>
          <NuxtLink v-if="isSuperAdmin" to="/dashboard/users" class="action-card">
            <div class="action-icon purple">U</div>
            <div class="action-title">Manage Users</div>
            <div class="action-desc">Assign roles and permissions</div>
          </NuxtLink>
          <NuxtLink to="/dashboard/transactions" class="action-card">
            <div class="action-icon amber">R</div>
            <div class="action-title">Reports</div>
            <div class="action-desc">View sales and analytics</div>
          </NuxtLink>
        </div>
      </template>

      <template v-if="!isAdmin">
        <div class="section-header-row">
          <h2 class="section-title-sm">Summary</h2>
        </div>
        <div class="stats-grid">
          <div v-if="isStoreAdmin || isStoreStaff" class="stat-card pink">
            <div class="stat-icon">S</div>
            <div>
              <div class="stat-value">{{ summary.shops }}</div>
              <div class="stat-label">{{ isStoreAdmin ? 'My Shops' : 'Assigned Shops' }}</div>
            </div>
          </div>
          <div v-if="isStoreAdmin || isStoreStaff" class="stat-card teal">
            <div class="stat-icon">P</div>
            <div>
              <div class="stat-value">{{ summary.products }}</div>
              <div class="stat-label">Products</div>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon">O</div>
            <div>
              <div class="stat-value">{{ summary.transactions }}</div>
              <div class="stat-label">{{ isCustomer ? 'My Orders' : 'Transactions' }}</div>
            </div>
          </div>
          <div v-if="isStoreAdmin" class="stat-card amber">
            <div class="stat-icon">U</div>
            <div>
              <div class="stat-value">{{ summary.users }}</div>
              <div class="stat-label">Shop Users</div>
            </div>
          </div>
        </div>
      </template>

      <div class="section-header-row" style="margin-top: 15px;">
        <h2 class="section-title-sm">Recent Activity</h2>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">{{ isCustomer ? 'My Purchases Last 7 Days' : 'Orders Last 7 Days' }}</div>
          <div class="chart-total">{{ formatCurrency(summary.revenue) }} {{ isCustomer ? 'total spent' : 'total revenue' }}</div>
        </div>
        <div class="bar-chart">
          <div v-for="bar in chartData" :key="bar.label" class="bar-group">
            <div class="bar-track">
              <div class="bar-fill" :style="{ height: bar.height }"></div>
            </div>
            <div class="bar-label">{{ bar.label }}</div>
            <div class="bar-value">{{ bar.value }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { collection, getDocs, query, where } from '~/utils/firestoreLogger';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ssr: false,
});

useHead({ title: 'Dashboard | My Near Shops' });

const nuxtApp = useNuxtApp() as any;
const db = nuxtApp.$firebase?.db;
const authStore = useAuthStore();

const uid = computed(() => authStore.user?.uid || '');
const roleId = computed(() => authStore.user?.roleId || '');

const isSuperAdmin = computed(() => roleId.value === 'super-admin');
const isStoreAdmin = computed(() => roleId.value === 'store-admin');
const isStoreStaff = computed(() => roleId.value === 'store-staff');
const isCustomer = computed(() => roleId.value === 'customer');
const isAdmin = computed(() => isSuperAdmin.value || isStoreAdmin.value);

const initials = computed(() => {
  const name = authStore.displayName || 'U';
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
});

const userRole = computed(() => authStore.user?.role || 'Member');

const loading = ref(true);
const summary = reactive({
  shops: 0,
  products: 0,
  transactions: 0,
  users: 0,
  revenue: 0,
});
const recentTransactions = ref<any[]>([]);

const toMillis = (value: any) => {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return new Date(value).getTime();
};

const formatCurrency = (value: number) => {
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0);
  } catch {
    return `₱${(value || 0).toFixed(2)}`;
  }
};

const fetchSummary = async () => {
  if (!db) return;
  loading.value = true;
  try {
    const uidVal = uid.value;
    if (isSuperAdmin.value) {
      const [shopsSnap, productsSnap, transactionsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'shops')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'transactions')),
        getDocs(collection(db, 'users')),
      ]);
      summary.shops = shopsSnap.size;
      summary.products = productsSnap.size;
      summary.transactions = transactionsSnap.size;
      summary.users = usersSnap.size;
      summary.revenue = transactionsSnap.docs.reduce((sum, d) => sum + ((d.data() as any).total || 0), 0);
      recentTransactions.value = transactionsSnap.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    } else if (isStoreAdmin.value) {
      const shopsSnap = await getDocs(query(collection(db, 'shops'), where('ownerId', '==', uidVal)));
      const shopIds = shopsSnap.docs.map(d => d.id);
      const [productsSnap, transactionsSnap, membersSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'transactions')),
        getDocs(collection(db, 'shopMembers')),
      ]);
      const products = productsSnap.docs.filter(d => shopIds.includes((d.data() as any).shopId));
      const transactions = transactionsSnap.docs.filter(d => shopIds.includes((d.data() as any).store_id));
      const members = membersSnap.docs.filter(d => shopIds.includes((d.data() as any).shopId));
      summary.shops = shopIds.length;
      summary.products = products.length;
      summary.transactions = transactions.length;
      summary.users = members.length;
      summary.revenue = transactions.reduce((sum, d) => sum + ((d.data() as any).total || 0), 0);
      recentTransactions.value = transactions
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    } else if (isStoreStaff.value) {
      const membersSnap = await getDocs(query(collection(db, 'shopMembers'), where('uid', '==', uidVal)));
      const shopIds = membersSnap.docs.map(d => (d.data() as any).shopId);
      const [productsSnap, transactionsSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'transactions')),
      ]);
      const products = productsSnap.docs.filter(d => shopIds.includes((d.data() as any).shopId));
      const transactions = transactionsSnap.docs.filter(d => shopIds.includes((d.data() as any).store_id));
      summary.shops = shopIds.length;
      summary.products = products.length;
      summary.transactions = transactions.length;
      summary.users = 0;
      summary.revenue = transactions.reduce((sum, d) => sum + ((d.data() as any).total || 0), 0);
      recentTransactions.value = transactions
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    } else if (isCustomer.value) {
      const transactionsSnap = await getDocs(query(collection(db, 'transactions'), where('user_id', '==', uidVal)));
      summary.shops = 0;
      summary.products = 0;
      summary.transactions = transactionsSnap.size;
      summary.users = 0;
      summary.revenue = transactionsSnap.docs.reduce((sum, d) => sum + ((d.data() as any).total || 0), 0);
      recentTransactions.value = transactionsSnap.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    }
  } catch (e: any) {
    console.error('Dashboard summary error:', e);
  } finally {
    loading.value = false;
  }
};

const chartData = computed(() => {
  const days: { key: string; label: string; value: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push({
      key: d.toDateString(),
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      value: 0,
    });
  }
  recentTransactions.value.forEach((tx: any) => {
    const ms = toMillis(tx.createdAt);
    if (!ms) return;
    const key = new Date(ms).toDateString();
    const day = days.find(d => d.key === key);
    if (day) day.value++;
  });
  const max = Math.max(...days.map(d => d.value), 1);
  return days.map(d => ({ label: d.label, value: d.value, height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%` }));
});

onMounted(() => {
  fetchSummary();
});
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

.state { padding: 48px; text-align: center; color: var(--gray-500); }
.state p { margin: 8px 0 0; }
.spinner { width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

.chart-card { background: #fff; border: 1px solid var(--gray-100); border-radius: 18px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 10px; }
.chart-title { font-size: 16px; font-weight: 800; color: var(--gray-900); }
.chart-total { font-size: 14px; font-weight: 700; color: #22c55e; }
.bar-chart { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; height: 200px; }
.bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; height: 100%; }
.bar-track { width: 100%; flex: 1; background: #f1f5f9; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; min-height: 0; }
.bar-fill { width: 100%; background: linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%); border-radius: 8px 8px 0 0; transition: height 0.5s ease; }
.bar-label { font-size: 11px; color: var(--gray-500); font-weight: 600; }
.bar-value { font-size: 12px; font-weight: 800; color: var(--gray-900); }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: 1fr; }
}
</style>
