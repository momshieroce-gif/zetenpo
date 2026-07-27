<template>
  <div class="users-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div>
          <h1 class="page-title">Users</h1>
          <p class="page-subtitle">Manage app users and accounts</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="state loading">
        <div class="spinner"></div>
        <p>Loading users...</p>
      </div>
      <div v-else-if="fetchError" class="state error">{{ fetchError }}</div>
      <template v-else-if="users.length">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td>{{ user.name || user.displayName || '-' }}</td>
              <td>{{ user.email || '-' }}</td>
              <td>{{ user.phone || '-' }}</td>
              <td>{{ user.role || '-' }}</td>
              <td>
                <span class="badge" :class="activeClass(user.isActive)">
                  <span class="dot"></span>
                  {{ activeLabel(user.isActive) }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-sm btn-edit" @click="openEdit(user)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="totalPages > 1" class="pagination">
          <button class="btn btn-ghost" :disabled="currentPage === 1" @click="prevPage">Previous</button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn btn-ghost" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
        </div>
      </template>
      <div v-else class="state empty">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <p class="empty-title">No users found</p>
        <p class="empty-desc">Users will appear here once they sign up.</p>
      </div>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Edit User</h3>
        <button type="button" class="close-btn" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <form class="edit-form" @submit.prevent="saveUser">
          <div class="edit-grid">
            <div class="form-group full">
              <label>Name</label>
              <input v-model="editForm.name" type="text" class="form-input" />
            </div>
            <div class="form-group full">
              <label>Email</label>
              <input v-model="editForm.email" type="email" class="form-input" disabled />
            </div>
            <div class="form-group" :class="{ full: !isSuperAdmin }">
              <label>Phone</label>
              <input v-model="editForm.phone" type="tel" class="form-input" />
            </div>
            <div v-if="isSuperAdmin" class="form-group">
              <label>Role</label>
              <select v-model="editForm.roleId" class="form-input" @change="setRoleName">
                <option disabled value="">Select role</option>
                <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
            </div>
            <div class="form-group full">
              <label>Status</label>
              <select v-model="editForm.isActive" class="form-input">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div v-if="editError" class="edit-error">{{ editError }}</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, doc, documentId, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';

interface User {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ssr: false,
});

useHead({ title: 'Users | My Near Shops' });

const nuxtApp = useNuxtApp() as any;
const db = nuxtApp.$firebase?.db;
const authStore = useAuthStore();

const isSuperAdmin = computed(() => authStore.user?.roleId === 'super-admin');

const roles = ref<{ id: string; name: string; level?: number }[]>([]);

const fetchRoles = async () => {
  try {
    if (!db) return;
    const snapshot = await getDocs(collection(db, 'roles'));
    roles.value = snapshot.docs
      .map((d: any) => ({ id: d.id, ...d.data() } as { id: string; name: string; level?: number }))
      .sort((a, b) => (a.level || 0) - (b.level || 0));
  } catch (e) {
    console.error('Failed to load roles:', e);
  }
};

const setRoleName = () => {
  const role = roles.value.find((r: { id: string; name: string; level?: number }) => r.id === editForm.value.roleId);
  editForm.value.role = role?.name || '';
};

const users = ref<User[]>([]);
const loading = ref(true);
const fetchError = ref('');

const perPage = 20;
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(users.value.length / perPage) || 1);
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return users.value.slice(start, start + perPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const showModal = ref(false);
const saving = ref(false);
const editError = ref('');
const selectedUser = ref<User | null>(null);
const editForm = ref({ name: '', email: '', phone: '', roleId: '', role: '', isActive: true });

const resolveRoleId = (user: User) => {
  if (user.roleId && roles.value.some((r: { id: string }) => r.id === user.roleId)) return user.roleId;
  const roleValue = (user.role || '').toLowerCase().trim();
  if (!roleValue) return '';
  const match = roles.value.find(
    (r: { id: string; name: string }) => r.id.toLowerCase() === roleValue || r.name.toLowerCase() === roleValue
  );
  return match?.id || '';
};

const openEdit = (user: User) => {
  selectedUser.value = user;
  editForm.value = {
    name: user.name || user.displayName || '',
    email: user.email || '',
    phone: user.phone || '',
    roleId: resolveRoleId(user),
    role: user.role || '',
    isActive: user.isActive !== false,
  };
  editError.value = '';
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
  selectedUser.value = null;
};
const saveUser = async () => {
  if (!selectedUser.value) return;
  saving.value = true;
  editError.value = '';
  try {
    if (!db) throw new Error('Firebase is not available.');
    const payload: Record<string, any> = {
      name: editForm.value.name,
      displayName: editForm.value.name,
      phone: editForm.value.phone,
      isActive: editForm.value.isActive,
    };
    if (isSuperAdmin.value) {
      setRoleName();
      payload.roleId = editForm.value.roleId;
      payload.role = editForm.value.role;
    }
    await updateDoc(doc(db, 'users', selectedUser.value.id), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    Object.assign(selectedUser.value, payload);
    showModal.value = false;
  } catch (e: any) {
    console.error('Save user failed:', e, {
      userId: selectedUser.value?.id,
      authenticatedId: authStore.user?.uid,
      payload: JSON.parse(JSON.stringify(editForm.value)),
    });
    editError.value = e?.message || 'Failed to update user.';
  } finally {
    saving.value = false;
  }
};

const activeLabel = (value?: boolean) => (value !== false ? 'Active' : 'Inactive');
const activeClass = (value?: boolean) => (value !== false ? 'badge-success' : 'badge-inactive');

const toggleActive = async (user: User) => {
  const newActive = !(user.isActive ?? true);
  try {
    if (!db) throw new Error('Firebase is not available.');
    await updateDoc(doc(db, 'users', user.id), { isActive: newActive, updatedAt: serverTimestamp() });
    user.isActive = newActive;
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to update user status.';
  }
};

const fetchUsers = async () => {
  loading.value = true;
  fetchError.value = '';
  try {
    if (!db) throw new Error('Firebase is not available.');
    const uid = authStore.user?.uid || '';
    const roleId = authStore.user?.roleId || '';

    if (roleId === 'super-admin') {
      const snapshot = await getDocs(collection(db, 'users'));
      const fetched: User[] = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as User));
      fetched.sort((a, b) => (a.name || a.displayName || '').localeCompare(b.name || b.displayName || ''));
      users.value = fetched;
      currentPage.value = 1;
      return;
    }

    if (roleId !== 'store-admin' && roleId !== 'store-staff') {
      users.value = [];
      currentPage.value = 1;
      return;
    }

    const myMemberships = await getDocs(query(collection(db, 'shopMembers'), where('uid', '==', uid)));
    let shopIds = myMemberships.docs.map((d: any) => d.data().shopId).filter(Boolean);
    shopIds = [...new Set(shopIds)];

    if (!shopIds.length) {
      users.value = [];
      currentPage.value = 1;
      return;
    }

    const memberChunks: string[][] = [];
    for (let i = 0; i < shopIds.length; i += 30) {
      memberChunks.push(shopIds.slice(i, i + 30));
    }
    const memberSnapshots = await Promise.all(
      memberChunks.map(ids => getDocs(query(collection(db, 'shopMembers'), where('shopId', 'in', ids))))
    );
    const userIds = [
      ...new Set([
        ...memberSnapshots.flatMap((s: any) => s.docs.map((d: any) => d.data().uid)),
        uid,
      ])
    ].filter(Boolean);

    if (!userIds.length) {
      users.value = [];
      currentPage.value = 1;
      return;
    }

    const userChunks: string[][] = [];
    for (let i = 0; i < userIds.length; i += 30) {
      userChunks.push(userIds.slice(i, i + 30));
    }
    const userSnapshots = await Promise.all(
      userChunks.map(ids => getDocs(query(collection(db, 'users'), where(documentId(), 'in', ids))))
    );
    const fetched: User[] = userSnapshots
      .flatMap((s: any) => s.docs.map((d: any) => ({ id: d.id, ...d.data() } as User)));
    fetched.sort((a, b) => (a.name || a.displayName || '').localeCompare(b.name || b.displayName || ''));
    users.value = fetched;
    currentPage.value = 1;
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load users.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRoles();
  fetchUsers();
});
</script>

<style scoped>
.users-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 28px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 24px rgba(79,70,229,0.25); }
.page-title { font-size: 28px; font-weight: 900; margin: 0 0 4px; color: #0f172a; }
.page-subtitle { font-size: 14px; color: #64748b; margin: 0; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 0; box-shadow: 0 10px 40px rgba(15,23,42,0.05); overflow: hidden; }
.state { padding: 48px; text-align: center; color: #64748b; }
.state p { margin: 8px 0 0; }
.spinner { width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { width: 72px; height: 72px; border-radius: 50%; background: #f8fafc; color: #94a3b8; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.empty-desc { font-size: 14px; color: #64748b; margin: 0 0 20px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 14px 16px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
.data-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 14px; color: #0f172a; }
.data-table tbody tr:hover { background: #f8fafc; }
.data-table tr:last-child td { border-bottom: none; }
.badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-success .dot { background: #22c55e; }
.badge-inactive { background: #f1f5f9; color: #64748b; }
.badge-inactive .dot { background: #94a3b8; }
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #fff; }
.page-info { font-size: 14px; color: #64748b; font-weight: 600; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
.btn-ghost { padding: 10px 18px; background: #f1f5f9; color: #475569; }
.btn-ghost:hover { background: #e2e8f0; }
.actions { text-align: right; white-space: nowrap; }
.btn-sm { padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; }
.btn-success { background: #dcfce7; color: #166534; }
.btn-success:hover { background: #bbf7d0; }
.btn-inactive { background: #fee2e2; color: #991b1b; }
.btn-inactive:hover { background: #fecaca; }
.btn-edit { background: #e0e7ff; color: #4f46e5; margin-right: 6px; }
.btn-edit:hover { background: #c7d2fe; }
.modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; background: #fff; border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; }
.modal-body { padding: 24px; }
.edit-form { display: flex; flex-direction: column; gap: 20px; }
.edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: span 2; }
.form-group label { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.form-input { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; outline: none; }
.form-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
.form-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.edit-error { color: #ef4444; font-size: 13px; font-weight: 600; }
@media (max-width: 640px) {
  .data-table { display: block; overflow-x: auto; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
