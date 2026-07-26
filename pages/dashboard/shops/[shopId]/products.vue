<script setup lang="ts">
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Shop, Product } from '~/types';

const route = useRoute();
const router = useRouter();
const shopId = computed(() => route.params.shopId as string);

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ssr: false,
});

useHead({ title: 'Products | My Near Shops' });

const nuxtApp = useNuxtApp() as any;
const db = nuxtApp.$firebase?.db;
const storage = nuxtApp.$firebase?.storage;

const shop = ref<Shop | null>(null);
const products = ref<Product[]>([]);
const loading = ref(true);
const fetchError = ref('');
const saving = ref(false);
const formError = ref('');
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const showProductModal = ref(false);
const imageFiles = ref<File[]>([]);
const imagePreviews = ref<{ url: string; name: string }[]>([]);
const existingImages = ref<string[]>([]);

const form = reactive({
  name: '',
  description: '',
  price: 0,
  category: '',
  isAvailable: true,
});

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.price = 0;
  form.category = '';
  form.isAvailable = true;
  isEditing.value = false;
  editingId.value = null;
  formError.value = '';
  imagePreviews.value.forEach((p: { url: string; name: string }) => URL.revokeObjectURL(p.url));
  imageFiles.value = [];
  imagePreviews.value = [];
  existingImages.value = [];
};

const openProductModal = () => { showProductModal.value = true; };
const closeProductModal = () => {
  showProductModal.value = false;
  resetForm();
};
const openAddProduct = () => {
  resetForm();
  openProductModal();
};
const openEditProduct = (product: Product) => {
  resetForm();
  isEditing.value = true;
  editingId.value = product.id;
  form.name = product.name || '';
  form.description = product.description || '';
  form.price = product.price || 0;
  form.category = product.category || '';
  form.isAvailable = product.isAvailable !== false;
  existingImages.value = product.images || [];
  openProductModal();
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;
  const files = Array.from(target.files).filter((f) => f.type.startsWith('image/'));
  files.forEach((file) => {
    imageFiles.value.push(file);
    imagePreviews.value.push({ url: URL.createObjectURL(file), name: file.name });
  });
  target.value = '';
};
const removeImage = (index: number) => {
  URL.revokeObjectURL(imagePreviews.value[index].url);
  imageFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const moveExistingImage = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= existingImages.value.length) return;
  [existingImages.value[index], existingImages.value[newIndex]] = [existingImages.value[newIndex], existingImages.value[index]];
};

const moveImage = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= imagePreviews.value.length) return;
  [imagePreviews.value[index], imagePreviews.value[newIndex]] = [imagePreviews.value[newIndex], imagePreviews.value[index]];
  [imageFiles.value[index], imageFiles.value[newIndex]] = [imageFiles.value[newIndex], imageFiles.value[index]];
};

const fetchShop = async () => {
  if (!db) return;
  try {
    const snap = await getDoc(doc(db, 'shops', shopId.value));
    if (snap.exists()) {
      shop.value = { id: snap.id, ...snap.data() } as Shop;
    }
  } catch (e) {
    console.error(e);
  }
};

const timestampToMillis = (v: any) => {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.getTime === 'function') return v.getTime();
  return 0;
};

const fetchProducts = async () => {
  if (!db) return;
  loading.value = true;
  fetchError.value = '';
  try {
    const q = query(collection(db, 'products'), where('shopId', '==', shopId.value));
    const snap = await getDocs(q);
    products.value = snap.docs
      .map((d: any) => ({ id: d.id, ...d.data() } as Product))
      .filter((p: Product) => !p.deletedAt)
      .sort((a: Product, b: Product) => timestampToMillis(b.createdAt) - timestampToMillis(a.createdAt));
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load products.';
  } finally {
    loading.value = false;
  }
};

const saveProduct = async () => {
  formError.value = '';
  if (!form.name.trim()) {
    formError.value = 'Product name is required.';
    return;
  }
  if (!db) return;
  saving.value = true;
  try {
    const uploadedUrls: string[] = [];
    if (storage && imageFiles.value.length) {
      for (const file of imageFiles.value) {
        const fileRef = storageRef(storage, `products/${shopId.value}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        uploadedUrls.push(downloadUrl);
      }
    }
    const images = [...existingImages.value, ...uploadedUrls];
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      category: form.category.trim(),
      isAvailable: form.isAvailable,
      images,
      updatedAt: serverTimestamp(),
    };
    if (isEditing.value && editingId.value) {
      await updateDoc(doc(db, 'products', editingId.value), payload);
    } else {
      await addDoc(collection(db, 'products'), {
        ...payload,
        shopId: shopId.value,
        shopName: shop.value?.name || '',
        latitude: shop.value?.latitude,
        longitude: shop.value?.longitude,
        deletedAt: null,
        createdAt: serverTimestamp(),
      });
    }
    closeProductModal();
    await fetchProducts();
  } catch (e: any) {
    formError.value = e?.message || 'Save failed.';
  } finally {
    saving.value = false;
  }
};

const softDelete = async (id: string) => {
  if (!db) return;
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await updateDoc(doc(db, 'products', id), { deletedAt: new Date(), updatedAt: serverTimestamp() });
    await fetchProducts();
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchShop();
  fetchProducts();
});
</script>

<template>
  <div class="products-page">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-ghost" @click="router.back()">Back</button>
        <div>
          <h1 class="page-title">{{ shop?.name || 'Shop' }} - Products</h1>
          <p class="page-subtitle">Manage products for this shop</p>
        </div>
      </div>
      <button class="btn btn-primary" @click="openAddProduct">Add Product</button>
    </div>

    <div v-if="showProductModal" class="modal-overlay" @click.self="closeProductModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Product' : 'Add Product' }}</h3>
          <button class="close-btn" @click="closeProductModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="field full">
              <label>Product Name</label>
              <input v-model="form.name" type="text" class="input" placeholder="Product name" />
            </div>
            <div class="field">
              <label>Price</label>
              <input v-model.number="form.price" type="number" step="any" class="input" placeholder="Price" />
            </div>
            <div class="field">
              <label>Category</label>
              <input v-model="form.category" type="text" class="input" placeholder="Category" />
            </div>
            <div class="field full">
              <label>Description</label>
              <textarea v-model="form.description" class="input" rows="2" placeholder="Description"></textarea>
            </div>
            <div class="field full">
              <label>Images</label>
              <input type="file" accept="image/*" multiple class="input file-input" @change="onFileChange" />
              <div v-if="existingImages.length" class="preview-list existing">
                <div v-for="(url, i) in existingImages" :key="'existing-' + i" class="preview-thumb">
                  <img :src="url" alt="Existing" />
                  <button v-if="i > 0" type="button" class="move-thumb left" @click="moveExistingImage(i, -1)">&#10094;</button>
                  <button v-if="i < existingImages.length - 1" type="button" class="move-thumb right" @click="moveExistingImage(i, 1)">&#10095;</button>
                </div>
              </div>
              <div v-if="imagePreviews.length" class="preview-list">
                <div v-for="(p, i) in imagePreviews" :key="i" class="preview-thumb">
                  <img :src="p.url" :alt="p.name" />
                  <button v-if="i > 0" type="button" class="move-thumb left" @click="moveImage(i, -1)">&#10094;</button>
                  <button v-if="i < imagePreviews.length - 1" type="button" class="move-thumb right" @click="moveImage(i, 1)">&#10095;</button>
                  <button type="button" class="remove-thumb" @click="removeImage(i)">&times;</button>
                </div>
              </div>
            </div>
            <div class="field check">
              <label class="checkbox">
                <input v-model="form.isAvailable" type="checkbox" />
                Available
              </label>
            </div>
          </div>
          <div v-if="formError" class="error">{{ formError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeProductModal">Cancel</button>
          <button class="btn btn-primary" :disabled="saving" @click="saveProduct">
            <span v-if="saving">Saving...</span>
            <span v-else>{{ isEditing ? 'Update Product' : 'Add Product' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="state loading">Loading products...</div>
    <div v-else-if="fetchError" class="state error">{{ fetchError }}</div>
    <div v-else-if="!products.length" class="state empty">No products yet.</div>
    <div v-else class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Category</th>
            <th>Availability</th>
            <th class="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>
              <div class="product-name">{{ p.name }}</div>
              <div class="product-desc">{{ p.description || '-' }}</div>
            </td>
            <td>₱{{ (p.price || 0).toFixed(2) }}</td>
            <td>{{ p.category || '-' }}</td>
            <td>
              <span class="badge" :class="p.isAvailable ? 'badge-success' : 'badge-inactive'">
                <span class="dot"></span>
                {{ p.isAvailable ? 'Available' : 'Unavailable' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon edit" @click="openEditProduct(p)" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon delete" @click="softDelete(p.id)" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.products-page { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.page-title { font-size: 28px; font-weight: 900; margin: 0 0 6px; color: #0f172a; }
.page-subtitle { font-size: 14px; color: #64748b; margin: 0; }
.header-left .btn-ghost { padding: 10px 18px; border-radius: 12px; font-weight: 700; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 28px; box-shadow: 0 10px 40px rgba(15,23,42,0.05); margin-bottom: 24px; }
.product-list-card { padding: 0; overflow: hidden; }
.product-form { margin-bottom: 8px; }
.product-form-actions { display: flex; gap: 12px; margin-top: 20px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-grid .full { grid-column: span 2; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
.field .input { padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 14px; outline: none; transition: all 0.2s; background: #fff; }
.field .input:focus { border-color: #fbbf24; box-shadow: 0 0 0 3px rgba(251,191,36,0.15); }
textarea.input { resize: vertical; min-height: 64px; }
.field.check { flex-direction: row; align-items: center; margin-top: 4px; }
.checkbox { display: flex; align-items: center; gap: 10px; font-weight: 600; color: #0f172a; text-transform: none; cursor: pointer; font-size: 14px; }
.checkbox input[type='checkbox'] { width: 18px; height: 18px; accent-color: #f59e0b; cursor: pointer; }
.error { margin-top: 16px; font-size: 13px; color: #dc2626; background: #fef2f2; padding: 12px 14px; border-radius: 12px; border: 1px solid #fecaca; }
.state { padding: 40px; text-align: center; color: #64748b; background: #fff; border-radius: 20px; margin-top: 24px; font-weight: 600; }
.state.empty { background: #f8fafc; border: 1px dashed #e2e8f0; }
.product-list { list-style: none; padding: 0; margin: 0; }
.product-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 28px; border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
.product-item:last-child { border-bottom: none; }
.product-item:hover { background: #f8fafc; }
.product-name { font-weight: 800; font-size: 16px; color: #0f172a; margin-bottom: 6px; }
.product-meta { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.product-actions { display: flex; gap: 8px; flex-shrink: 0; }
.product-actions .btn-icon { margin-left: 0; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
.btn-ghost { padding: 10px 18px; background: #f1f5f9; color: #475569; }
.btn-ghost:hover { background: #e2e8f0; }
.btn-primary { padding: 12px 22px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; box-shadow: 0 8px 20px rgba(251,191,36,0.35); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(251,191,36,0.45); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-icon { width: 36px; height: 36px; border-radius: 10px; background: none; border: 1px solid transparent; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.btn-icon.edit { color: #4f46e5; }
.btn-icon.edit:hover { background: #eef2ff; border-color: #c7d2fe; }
.btn-icon.delete { color: #ef4444; }
.btn-icon.delete:hover { background: #fef2f2; border-color: #fecaca; }
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-grid .full { grid-column: span 1; }
  .product-item { flex-direction: column; align-items: flex-start; gap: 12px; }
  .product-actions { align-self: flex-end; }
}
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 100; }
.modal-card { background: #fff; border-radius: 20px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(15,23,42,0.25); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 900; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 28px; line-height: 1; color: #94a3b8; cursor: pointer; }
.close-btn:hover { color: #0f172a; }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #f8fafc; border-radius: 0 0 20px 20px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 16px 20px; text-align: left; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
.data-table thead th { background: #f8fafc; font-weight: 800; color: #475569; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table .actions { text-align: right; white-space: nowrap; }
.product-desc { font-size: 13px; color: #64748b; margin-top: 2px; }
.badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-success .dot { background: #22c55e; }
.badge-inactive { background: #f1f5f9; color: #64748b; }
.badge-inactive .dot { background: #94a3b8; }
.file-input { padding: 8px 0; border: none; background: transparent; cursor: pointer; }
.preview-list { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.preview-thumb { position: relative; width: 70px; height: 70px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
.preview-thumb img { width: 100%; height: 100%; object-fit: cover; }
.remove-thumb { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,0.5); color: #fff; border: none; font-size: 14px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.move-thumb { position: absolute; bottom: 2px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,0.5); color: #fff; border: none; font-size: 10px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.move-thumb.left { left: 2px; }
.move-thumb.right { right: 2px; }
</style>
