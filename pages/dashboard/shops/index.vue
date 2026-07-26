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
      <div class="header-right">
        <input v-model="searchQuery" type="text" class="search-input" placeholder="Search shop name..." />
        <button class="btn btn-primary" @click="openCreate">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Shop
        </button>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="state loading">
        <div class="spinner"></div>
        <p>Loading shops...</p>
      </div>
      <div v-else-if="fetchError" class="state error">{{ fetchError }}</div>
      <template v-else-if="filteredShops.length">
        <table class="data-table">
        <thead>
          <tr>
            <th>Shop</th>
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
              <span class="badge" :class="shop.isActive ? 'badge-success' : 'badge-inactive'">
                <span class="dot"></span>
                {{ shop.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon members" @click="openMembers(shop)" title="Members">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </button>
              <button class="btn-icon products" @click="navigateTo('/dashboard/shops/' + shop.id + '/products')" title="Products">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </button>
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
        <p class="empty-title">{{ searchQuery.trim() ? 'No matching shops' : 'No shops yet' }}</p>
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

    <div v-if="showMembersModal" class="modal-overlay" @click.self="closeMembersModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ selectedShopForMembers?.name || 'Shop' }} - Members</h3>
          <button class="close-btn" @click="closeMembersModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="member-add-row">
            <input v-model="memberEmail" type="email" class="input" placeholder="User email" @keyup.enter="addMember" />
            <select v-model="memberRole" class="input member-role">
              <option value="staff">Staff</option>
              <option value="cashier">Cashier</option>
              <option value="delivery">Delivery</option>
            </select>
            <button class="btn btn-primary" :disabled="memberSaving" @click="addMember">
              <span v-if="memberSaving">Adding...</span>
              <span v-else>Add</span>
            </button>
          </div>
          <div v-if="memberError" class="error">{{ memberError }}</div>
          <div v-if="memberSuccess" class="member-success">{{ memberSuccess }}</div>
          <div v-if="membersLoading" class="member-meta">Loading members...</div>
          <ul v-else-if="shopMembers.length" class="member-list">
            <li v-for="m in shopMembers" :key="m.id" class="member-item">
              <div>
                <div class="member-name">{{ m.name || m.email || m.uid }}</div>
                <div class="member-meta">{{ m.email }} · {{ m.role }}</div>
              </div>
              <button class="btn-icon delete" title="Remove" @click="removeMember(m)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </li>
          </ul>
          <div v-else class="member-meta">No members yet.</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeMembersModal">Close</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button class="close-btn" @click="closeDeleteModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this shop? This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeDeleteModal">Cancel</button>
          <button class="btn btn-danger" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>

    <div v-if="showProductsModal" class="modal-overlay" @click.self="closeProductsModal">
      <div class="modal-card product-modal">
        <div class="modal-header">
          <h3>{{ selectedShopForProducts?.name || 'Shop' }} - Products</h3>
          <button class="close-btn" @click="closeProductsModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="product-form">
            <div class="form-grid">
              <div class="field full">
                <label>Product Name</label>
                <input v-model="productForm.name" type="text" class="input" placeholder="Product name" />
              </div>
              <div class="field">
                <label>Price</label>
                <input v-model.number="productForm.price" type="number" step="any" class="input" placeholder="Price" />
              </div>
              <div class="field">
                <label>Category</label>
                <input v-model="productForm.category" type="text" class="input" placeholder="Category" />
              </div>
              <div class="field full">
                <label>Description</label>
                <textarea v-model="productForm.description" class="input" rows="2" placeholder="Description"></textarea>
              </div>
              <div class="field check">
                <label class="checkbox">
                  <input v-model="productForm.isAvailable" type="checkbox" />
                  Available
                </label>
              </div>
            </div>
            <div class="product-form-actions">
              <button class="btn btn-primary" :disabled="productSaving" @click="saveProduct">
                <span v-if="productSaving">Saving...</span>
                <span v-else>{{ isEditingProduct ? 'Update Product' : 'Add Product' }}</span>
              </button>
              <button v-if="isEditingProduct" class="btn btn-ghost" @click="openCreateProduct">Cancel</button>
            </div>
          </div>
          <div v-if="productError" class="error">{{ productError }}</div>

          <div v-if="productLoading" class="state loading">Loading products...</div>
          <div v-else-if="!products.length" class="state empty">No products yet.</div>
          <ul v-else class="product-list">
            <li v-for="p in products" :key="p.id" class="product-item">
              <div class="product-info">
                <div class="product-name">{{ p.name }}</div>
                <div class="product-meta">₱{{ (p.price || 0).toFixed(2) }} · {{ p.category || 'No category' }} · {{ p.isAvailable ? 'Available' : 'Unavailable' }}</div>
              </div>
              <div class="product-actions">
                <button class="btn-icon edit" @click="openEditProduct(p)" title="Edit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon delete" @click="softDeleteProduct(p.id)" title="Delete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, addDoc, doc, documentId, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import type { Shop, Product } from '~/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ssr: false,
});

useHead({ title: 'Shops | My Near Shops' });

const nuxtApp = useNuxtApp() as any;
const authStore = useAuthStore();

const db = nuxtApp.$firebase?.db;
const shops = ref<Shop[]>([]);
const loading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const formError = ref('');
const fetchError = ref('');
const showDeleteModal = ref(false);
const deletingId = ref<string | null>(null);
const showProductsModal = ref(false);
const selectedShopForProducts = ref<Shop | null>(null);
const products = ref<Product[]>([]);
const productLoading = ref(false);
const productError = ref('');
const productSaving = ref(false);
const isEditingProduct = ref(false);
const editingProductId = ref<string | null>(null);
const productForm = reactive({
  name: '',
  description: '',
  price: 0,
  category: '',
  isAvailable: true,
});
const perPage = 20;
const currentPage = ref(1);
const searchQuery = ref('');
const filteredShops = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return shops.value;
  return shops.value.filter((s: Shop) => s.name?.toLowerCase().includes(q));
});
const totalPages = computed(() => Math.ceil(filteredShops.value.length / perPage) || 1);
const paginatedShops = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredShops.value.slice(start, start + perPage);
});
watch(searchQuery, () => { currentPage.value = 1; });
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

const memberEmail = ref('');
const memberRole = ref('staff');
const memberSaving = ref(false);
const membersLoading = ref(false);
const memberError = ref('');
const memberSuccess = ref('');
const shopMembers = ref<any[]>([]);
const showMembersModal = ref(false);
const selectedShopForMembers = ref<Shop | null>(null);

const openMembers = (shop: Shop) => {
  resetMembers();
  selectedShopForMembers.value = shop;
  fetchShopMembers(shop.id);
  showMembersModal.value = true;
};

const closeMembersModal = () => {
  showMembersModal.value = false;
  selectedShopForMembers.value = null;
  resetMembers();
};

const resetMembers = () => {
  memberEmail.value = '';
  memberRole.value = 'staff';
  memberError.value = '';
  memberSuccess.value = '';
  shopMembers.value = [];
};

const fetchShopMembers = async (shopId: string) => {
  membersLoading.value = true;
  try {
    const snap = await getDocs(query(collection(db, 'shopMembers'), where('shopId', '==', shopId)));
    const members = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    await Promise.all(members.map(async (m: any) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', m.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as any;
          m.name = data.name || data.displayName || '';
          m.email = data.email || '';
        }
      } catch { /* keep uid fallback */ }
    }));
    shopMembers.value = members;
  } catch (e: any) {
    memberError.value = e?.message || 'Failed to load members.';
  } finally {
    membersLoading.value = false;
  }
};

const addMember = async () => {
  memberError.value = '';
  memberSuccess.value = '';
  const email = memberEmail.value.trim();
  if (!email) {
    memberError.value = 'Email is required.';
    return;
  }
  if (!selectedShopForMembers.value) return;
  memberSaving.value = true;
  try {
    const userSnap = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
    if (userSnap.empty) {
      memberError.value = 'No user found with that email.';
      return;
    }
    const userDoc = userSnap.docs[0];
    const uid = userDoc.id;
    const shopId = selectedShopForMembers.value.id;
    const memberId = `${shopId}_${uid}`;
    if (shopMembers.value.some((m: any) => m.id === memberId)) {
      memberError.value = 'This user is already a member of this shop.';
      return;
    }
    await setDoc(doc(db, 'shopMembers', memberId), {
      shopId,
      uid,
      role: memberRole.value,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    memberSuccess.value = `${(userDoc.data() as any).name || email} added as ${memberRole.value}.`;
    memberEmail.value = '';
    await fetchShopMembers(shopId);
  } catch (e: any) {
    memberError.value = e?.message || 'Failed to add member.';
  } finally {
    memberSaving.value = false;
  }
};

const removeMember = async (member: any) => {
  memberError.value = '';
  memberSuccess.value = '';
  try {
    await deleteDoc(doc(db, 'shopMembers', member.id));
    shopMembers.value = shopMembers.value.filter((m: any) => m.id !== member.id);
  } catch (e: any) {
    memberError.value = e?.message || 'Failed to remove member.';
  }
};

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
    const uid = authStore.user?.uid || '';
    const roleId = authStore.user?.roleId || '';

    let shopIds: string[] = [];
    if (roleId === 'super-admin' || roleId === 'super-delivery') {
      const snapshot = await getDocs(collection(db, 'shops'));
      shops.value = snapshot.docs
        .map((d: any) => ({ id: d.id, ...d.data() } as Shop))
        .filter((s: Shop) => !s.deletedAt);
      currentPage.value = 1;
      loading.value = false;
      return;
    } else if (['store-admin', 'store-staff', 'store-delivery'].includes(roleId)) {
      const [membersSnap, ownedSnap] = await Promise.all([
        getDocs(query(collection(db, 'shopMembers'), where('uid', '==', uid))),
        getDocs(query(collection(db, 'shops'), where('ownerId', '==', uid))),
      ]);
      shopIds = [
        ...membersSnap.docs.map((d: any) => d.data().shopId),
        ...ownedSnap.docs.map((d: any) => d.id),
      ];
    } else {
      shops.value = [];
      currentPage.value = 1;
      loading.value = false;
      return;
    }

    shopIds = [...new Set(shopIds)].filter(Boolean);
    if (!shopIds.length) {
      shops.value = [];
      currentPage.value = 1;
      loading.value = false;
      return;
    }

    const chunks = [];
    for (let i = 0; i < shopIds.length; i += 30) {
      chunks.push(shopIds.slice(i, i + 30));
    }
    const snapshots = await Promise.all(
      chunks.map(ids => getDocs(query(collection(db, 'shops'), where(documentId(), 'in', ids))))
    );
    shops.value = snapshots
      .flatMap(s => s.docs.map((d: any) => ({ id: d.id, ...d.data() } as Shop)))
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

const softDelete = (id: string) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  deletingId.value = null;
  showDeleteModal.value = false;
};

const confirmDelete = async () => {
  if (!deletingId.value) return;
  try {
    await updateDoc(doc(db, 'shops', deletingId.value), { deletedAt: new Date(), updatedAt: serverTimestamp() });
    await fetchShops();
  } catch (e) {
    console.error(e);
  } finally {
    closeDeleteModal();
  }
};

const resetProductForm = () => {
  productForm.name = '';
  productForm.description = '';
  productForm.price = 0;
  productForm.category = '';
  productForm.isAvailable = true;
  isEditingProduct.value = false;
  editingProductId.value = null;
  productError.value = '';
};

const openProducts = (shop: Shop) => {
  selectedShopForProducts.value = shop;
  showProductsModal.value = true;
  resetProductForm();
  fetchProducts(shop.id);
};

const closeProductsModal = () => {
  selectedShopForProducts.value = null;
  showProductsModal.value = false;
  products.value = [];
};

const fetchProducts = async (shopId: string) => {
  productLoading.value = true;
  productError.value = '';
  try {
    if (!db) throw new Error('Firebase is not available.');
    const q = query(collection(db, 'products'), where('shopId', '==', shopId));
    const snap = await getDocs(q);
    products.value = snap.docs
      .map((d: any) => ({ id: d.id, ...d.data() } as Product))
      .filter((p: Product) => !p.deletedAt);
  } catch (e: any) {
    productError.value = e?.message || 'Failed to load products.';
  } finally {
    productLoading.value = false;
  }
};

const openCreateProduct = () => {
  resetProductForm();
};

const openEditProduct = (product: Product) => {
  isEditingProduct.value = true;
  editingProductId.value = product.id;
  productForm.name = product.name || '';
  productForm.description = product.description || '';
  productForm.price = product.price || 0;
  productForm.category = product.category || '';
  productForm.isAvailable = product.isAvailable !== false;
};

const saveProduct = async () => {
  productError.value = '';
  if (!productForm.name.trim()) {
    productError.value = 'Product name is required.';
    return;
  }
  if (!selectedShopForProducts.value || !db) return;
  productSaving.value = true;
  try {
    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price) || 0,
      category: productForm.category.trim(),
      isAvailable: productForm.isAvailable,
      updatedAt: serverTimestamp(),
    };
    if (isEditingProduct.value && editingProductId.value) {
      await updateDoc(doc(db, 'products', editingProductId.value), payload);
    } else {
      await addDoc(collection(db, 'products'), {
        ...payload,
        shopId: selectedShopForProducts.value.id,
        shopName: selectedShopForProducts.value.name,
        images: [],
        latitude: selectedShopForProducts.value.latitude,
        longitude: selectedShopForProducts.value.longitude,
        deletedAt: null,
        createdAt: serverTimestamp(),
      });
    }
    resetProductForm();
    await fetchProducts(selectedShopForProducts.value.id);
  } catch (e: any) {
    productError.value = e?.message || 'Save failed.';
  } finally {
    productSaving.value = false;
  }
};

const softDeleteProduct = async (id: string) => {
  if (!db) return;
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await updateDoc(doc(db, 'products', id), { deletedAt: new Date(), updatedAt: serverTimestamp() });
    if (selectedShopForProducts.value) await fetchProducts(selectedShopForProducts.value.id);
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
.header-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-input { min-width: 240px; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 14px; outline: none; }
.search-input:focus { border-color: #fbbf24; box-shadow: 0 0 0 3px rgba(251,191,36,0.15); }
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
.actions, .data-table th.actions { text-align: right; white-space: nowrap; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
.btn-primary { padding: 10px 18px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; box-shadow: 0 8px 20px rgba(251,191,36,0.35); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(251,191,36,0.45); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-ghost { padding: 10px 18px; background: #f1f5f9; color: #475569; }
.btn-ghost:hover { background: #e2e8f0; }
.btn-danger { padding: 10px 18px; background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }
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
.member-add-row { display: flex; gap: 10px; align-items: center; }
.member-add-row .input { padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; outline: none; }
.btn-icon.members { color: #7e22ce; }
.btn-icon.members:hover { background: #faf5ff; border-color: #e9d5ff; }
.member-add-row .input { flex: 1; }
.member-role { max-width: 130px; }
.member-success { margin-top: 12px; font-size: 13px; color: #16a34a; background: #f0fdf4; padding: 10px 12px; border-radius: 10px; }
.member-list { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.member-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border: 1px solid #f1f5f9; border-radius: 10px; background: #fafafa; }
.member-name { font-size: 14px; font-weight: 700; color: #0f172a; }
.member-meta { font-size: 12px; color: #64748b; margin-top: 8px; }
.member-item .member-meta { margin-top: 2px; }
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #fff; }
.page-info { font-size: 14px; color: #64748b; font-weight: 600; }
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-grid .full { grid-column: span 1; }
  .data-table { display: block; overflow-x: auto; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
.btn-icon.products { color: #0f766e; }
.btn-icon.products:hover { background: #f0fdfa; border-color: #99f6e4; }
.modal-card.product-modal { max-width: 620px; }
.product-form { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
.product-form-actions { display: flex; gap: 12px; margin-top: 16px; }
.product-list { list-style: none; padding: 0; margin: 0; max-height: 320px; overflow-y: auto; }
.product-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.product-item:last-child { border-bottom: none; }
.product-name { font-weight: 700; color: #0f172a; }
.product-meta { font-size: 13px; color: #64748b; }
.product-actions { display: flex; gap: 6px; }
.product-actions .btn-icon { margin-left: 0; }
</style>
