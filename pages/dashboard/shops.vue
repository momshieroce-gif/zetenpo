<template>
  <div class="shops-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
        </div>
        <div>
          <h1 class="page-title">Shops</h1>
          <p class="page-subtitle">Manage your store locations and details</p>
        </div>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Shop
      </button>
    </div>

    <div class="card">
      <div v-if="loading" class="state loading">
        <div class="spinner"></div>
        <p>Loading shops...</p>
      </div>
      <div v-else-if="fetchError" class="state error">{{ fetchError }}</div>
      <template v-else-if="shops.length">
        <table class="data-table">
        <thead>
          <tr>
            <th>Shop</th>
            <th>Contact</th>
            <th>Location</th>
            <th>Status</th>
            <th class="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shop in paginatedShops" :key="shop.id">
            <td>
              <div class="shop-cell">
                <div class="shop-avatar">{{ shop.name?.[0] || 'S' }}</div>
                <div>
                  <div class="shop-name">{{ shop.name }}</div>
                  <div class="shop-address">{{ shop.address || 'No address' }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="contact-value">{{ shop.phone || '-' }}</span>
            </td>
            <td>
              <span class="coord">{{ shop.latitude.toFixed(4) }}, {{ shop.longitude.toFixed(4) }}</span>
            </td>
            <td>
              <span class="badge" :class="shop.isActive ? 'badge-success' : 'badge-inactive'">
                <span class="dot"></span>
                {{ shop.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon edit" @click="openEdit(shop)" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon delete" @click="softDelete(shop.id)" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
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
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
        </div>
        <p class="empty-title">No shops yet</p>
        <p class="empty-desc">Add your first shop to get started.</p>
        <button class="btn btn-primary" @click="openCreate">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Shop
        </button>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Shop' : 'Add Shop' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="field">
              <label>Name</label>
              <input v-model="form.name" type="text" class="input" placeholder="Shop name" />
            </div>
            <div class="field">
              <label>Phone</label>
              <input v-model="form.phone" type="text" class="input" placeholder="Phone number" />
            </div>
            <div class="field full">
              <label>Address</label>
              <input v-model="form.address" type="text" class="input" placeholder="Address" />
            </div>
            <div class="field">
              <label>Latitude</label>
              <input v-model.number="form.latitude" type="number" step="any" class="input" placeholder="Latitude" />
            </div>
            <div class="field">
              <label>Longitude</label>
              <input v-model.number="form.longitude" type="number" step="any" class="input" placeholder="Longitude" />
            </div>
            <div class="field full">
              <label>Description</label>
              <textarea v-model="form.description" class="input" rows="3" placeholder="Description"></textarea>
            </div>
            <div class="field check">
              <label class="checkbox">
                <input v-model="form.isActive" type="checkbox" />
                Active
              </label>
            </div>
          </div>
          <div v-if="formError" class="error">{{ formError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" :disabled="saving" @click="save">
            <span v-if="saving">Saving...</span>
            <span v-else>Save Shop</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, addDoc, doc, updateDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import type { Shop } from '~/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ssr: false,
});

useHead({ title: 'Shops | My Near Shops' });

const nuxtApp = useNuxtApp() as any;
const authStore = useAuthStore();

const db = nuxtApp.$firebase.db;
const shops = ref<Shop[]>([]);
const loading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const formError = ref('');
const fetchError = ref('');
const perPage = 20;
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(shops.value.length / perPage) || 1);
const paginatedShops = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return shops.value.slice(start, start + perPage);
});
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const form = reactive({
  name: '',
  description: '',
  address: '',
  latitude: 0,
  longitude: 0,
  phone: '',
  logo: '',
  isActive: true,
});

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.address = '';
  form.latitude = 0;
  form.longitude = 0;
  form.phone = '';
  form.logo = '';
  form.isActive = true;
  isEditing.value = false;
  editingId.value = null;
  formError.value = '';
};

const openCreate = () => {
  resetForm();
  showModal.value = true;
};

const openEdit = (shop: Shop) => {
  isEditing.value = true;
  editingId.value = shop.id;
  form.name = shop.name || '';
  form.description = shop.description || '';
  form.address = shop.address || '';
  form.latitude = shop.latitude || 0;
  form.longitude = shop.longitude || 0;
  form.phone = shop.phone || '';
  form.logo = shop.logo || '';
  form.isActive = shop.isActive !== false;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const fetchShops = async () => {
  loading.value = true;
  fetchError.value = '';
  try {
    if (!db) throw new Error('Firebase is not available.');
    const snapshot = await getDocs(collection(db, 'shops'));
    shops.value = snapshot.docs
      .map((d: any) => ({ id: d.id, ...d.data() } as Shop))
      .filter((s: Shop) => !s.deletedAt);
    currentPage.value = 1;
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load shops.';
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  formError.value = '';
  if (!form.name.trim()) {
    formError.value = 'Name is required.';
    return;
  }
  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      phone: form.phone.trim(),
      logo: form.logo.trim(),
      isActive: form.isActive,
      updatedAt: serverTimestamp(),
    };
    if (isEditing.value && editingId.value) {
      await updateDoc(doc(db, 'shops', editingId.value), payload);
    } else {
      await addDoc(collection(db, 'shops'), {
        ...payload,
        ownerId: authStore.user?.uid || '',
        deletedAt: null,
        createdAt: serverTimestamp(),
      });
    }
    await fetchShops();
    closeModal();
  } catch (e: any) {
    formError.value = e?.message || 'Save failed.';
  } finally {
    saving.value = false;
  }
};

const softDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this shop?')) return;
  try {
    await updateDoc(doc(db, 'shops', id), { deletedAt: new Date(), updatedAt: serverTimestamp() });
    await fetchShops();
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchShops();
});
</script>

<style scoped>
.shops-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 28px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 24px rgba(251,191,36,0.25); }
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
.data-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.data-table tbody tr:hover { background: #f8fafc; }
.data-table tr:last-child td { border-bottom: none; }
.shop-cell { display: flex; align-items: center; gap: 14px; }
.shop-avatar { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0; }
.shop-name { font-weight: 700; font-size: 15px; color: #0f172a; }
.shop-address { font-size: 13px; color: #64748b; margin-top: 2px; }
.contact-value, .coord { font-size: 14px; color: #475569; }
.coord { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #64748b; }
.badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-success .dot { background: #22c55e; }
.badge-inactive { background: #f1f5f9; color: #64748b; }
.badge-inactive .dot { background: #94a3b8; }
.actions { text-align: right; white-space: nowrap; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
.btn-primary { padding: 10px 18px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; box-shadow: 0 8px 20px rgba(251,191,36,0.35); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(251,191,36,0.45); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-ghost { padding: 10px 18px; background: #f1f5f9; color: #475569; }
.btn-ghost:hover { background: #e2e8f0; }
.btn-icon { width: 34px; height: 34px; border-radius: 10px; background: none; border: 1px solid transparent; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; margin-left: 6px; }
.btn-icon:hover { transform: translateY(-1px); }
.btn-icon.edit { color: #4f46e5; }
.btn-icon.edit:hover { background: #eef2ff; border-color: #c7d2fe; }
.btn-icon.delete { color: #ef4444; }
.btn-icon.delete:hover { background: #fef2f2; border-color: #fecaca; }
.modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { width: 100%; max-width: 520px; background: #fff; border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.2); overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-grid .full { grid-column: span 2; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
.field .input { padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; outline: none; }
.field .input:focus { border-color: #fbbf24; box-shadow: 0 0 0 3px rgba(251,191,36,0.15); }
.field.check { flex-direction: row; align-items: center; }
.checkbox { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #0f172a; text-transform: none; cursor: pointer; }
.error { margin-top: 12px; font-size: 13px; color: #dc2626; background: #fef2f2; padding: 10px 12px; border-radius: 10px; }
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #fff; }
.page-info { font-size: 14px; color: #64748b; font-weight: 600; }
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-grid .full { grid-column: span 1; }
  .data-table { display: block; overflow-x: auto; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
