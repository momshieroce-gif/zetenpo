<script setup lang="ts">
import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, query, runLoggedTransaction, where, serverTimestamp } from '~/utils/firestoreLogger';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Inventory, Product, ProductVariant, Shop } from '~/types';

const route = useRoute();
const router = useRouter();
const shopId = computed(() => route.params.shopId as string);
const authStore = useAuthStore();

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
const inventorySummaryByProductId = ref<Record<string, { quantity: number; availableQuantity: number }>>({});
const loading = ref(true);
const fetchError = ref('');
const saving = ref(false);
const formError = ref('');
const searchName = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const stockSaving = ref(false);
const stockError = ref('');
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const showProductModal = ref(false);
const showVariantModal = ref(false);
const variantTargetProduct = ref<Product | null>(null);
const productVariants = ref<ProductVariant[]>([]);
const variantInventoryById = ref<Record<string, Inventory>>({});
const variantsLoading = ref(false);
const variantSaving = ref(false);
const variantError = ref('');
const showStockModal = ref(false);
const stockTargetProduct = ref<Product | null>(null);
const stockVariants = ref<ProductVariant[]>([]);
const stockInventoryByVariantId = ref<Record<string, Inventory>>({});
const stockVariantsLoading = ref(false);
const imageFiles = ref<File[]>([]);
const imagePreviews = ref<{ url: string; name: string }[]>([]);
const existingImages = ref<string[]>([]);
const defaultImageSelection = ref<{ source: 'existing' | 'new'; index: number } | null>(null);
const PRODUCT_LIMITS_BY_PLAN: Record<string, number> = {
  free: 10,
  basic: 30,
};

const form = reactive({
  name: '',
  description: '',
  price: 0,
  category: '',
  isActive: true,
});

const stockForm = reactive({
  variantId: '',
  movementType: 'in' as 'in' | 'out',
  quantity: 1,
  note: '',
});

const variantForm = reactive({
  sku: '',
  barcode: '',
  name: '',
  price: 0,
  size: '',
  color: '',
  quantity: 0,
  reorderLevel: 10,
});

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.price = 0;
  form.category = '';
  form.isActive = true;
  isEditing.value = false;
  editingId.value = null;
  formError.value = '';
  imagePreviews.value.forEach((p: { url: string; name: string }) => URL.revokeObjectURL(p.url));
  imageFiles.value = [];
  imagePreviews.value = [];
  existingImages.value = [];
  defaultImageSelection.value = null;
};

const openProductModal = () => { showProductModal.value = true; };
const closeProductModal = () => {
  showProductModal.value = false;
  resetForm();
};

const resetVariantForm = () => {
  variantForm.sku = '';
  variantForm.barcode = '';
  variantForm.name = variantTargetProduct.value?.name || '';
  variantForm.price = Number(variantTargetProduct.value?.price || 0);
  variantForm.size = '';
  variantForm.color = '';
  variantForm.quantity = 0;
  variantForm.reorderLevel = 10;
  variantError.value = '';
};

const isValidEan13 = (barcode: string) => {
  if (!/^\d{13}$/.test(barcode)) return false;
  const digits = barcode.split('').map(Number);
  const weightedSum = digits.slice(0, 12).reduce((sum, digit, index) => {
    return sum + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  return (10 - (weightedSum % 10)) % 10 === digits[12];
};

const fetchProductVariants = async (productId: string) => {
  if (!db) return;
  variantsLoading.value = true;
  try {
    const variantsSnapshot = await getDocs(query(
      collection(db, 'productVariants'),
      where('productId', '==', productId)
    ));
    productVariants.value = variantsSnapshot.docs.map((variantDoc: any) => ({
      id: variantDoc.id,
      ...variantDoc.data(),
    })) as ProductVariant[];

    const inventoryEntries: Array<readonly [string, Inventory] | null> = await Promise.all(productVariants.value.map(async (variant: ProductVariant) => {
      const inventorySnapshot = await getDoc(doc(db, 'inventory', variant.id));
      if (!inventorySnapshot.exists()) return null;
      const inventoryData = inventorySnapshot.data() as Omit<Inventory, 'id'>;
      return [variant.id, { id: inventorySnapshot.id, ...inventoryData }] as const;
    }));
    variantInventoryById.value = Object.fromEntries(
      inventoryEntries.filter((entry): entry is readonly [string, Inventory] => entry !== null)
    ) as Record<string, Inventory>;
  } finally {
    variantsLoading.value = false;
  }
};

const openVariantModal = async (product: Product) => {
  variantTargetProduct.value = product;
  productVariants.value = [];
  variantInventoryById.value = {};
  resetVariantForm();
  showVariantModal.value = true;
  try {
    await fetchProductVariants(product.id);
  } catch (e: any) {
    variantError.value = e?.message || 'Failed to load product variants.';
  }
};

const closeVariantModal = () => {
  showVariantModal.value = false;
  variantTargetProduct.value = null;
  productVariants.value = [];
  variantInventoryById.value = {};
  variantError.value = '';
};

const createProductVariant = async () => {
  if (!db || !variantTargetProduct.value) return;
  variantError.value = '';

  const sku = variantForm.sku.trim().toUpperCase();
  const barcode = variantForm.barcode.trim();
  const name = variantForm.name.trim();
  const size = variantForm.size.trim();
  const color = variantForm.color.trim();
  const price = Number(variantForm.price);
  const quantity = Number(variantForm.quantity);
  const reorderLevel = Number(variantForm.reorderLevel);
  if (!sku || !barcode || !name || !size || !color) {
    variantError.value = 'SKU, barcode, variant name, size, and color are required.';
    return;
  }
  if (!isValidEan13(barcode)) {
    variantError.value = 'Barcode must be a valid 13-digit EAN-13 barcode.';
    return;
  }
  if (![price, quantity, reorderLevel].every(Number.isFinite) || price < 0 || quantity < 0 || reorderLevel < 0) {
    variantError.value = 'Price, opening quantity, and reorder level must be valid non-negative numbers.';
    return;
  }

  variantSaving.value = true;
  try {
    const duplicateSkuSnapshot = await getDocs(query(collection(db, 'productVariants'), where('sku', '==', sku)));
    if (!duplicateSkuSnapshot.empty) {
      variantError.value = 'This SKU is already assigned to another variant.';
      return;
    }

    const variantRef = doc(db, 'productVariants', barcode);
    await runLoggedTransaction(db, async (firestoreTransaction: any) => {
      const barcodeSnapshot = await firestoreTransaction.get(variantRef);
      if (barcodeSnapshot.exists()) {
        throw new Error('This barcode is already assigned to another variant.');
      }

      firestoreTransaction.set(variantRef, {
        productId: variantTargetProduct.value!.id,
        sku,
        barcode,
        name,
        price,
        attributes: { size, color },
      });
      firestoreTransaction.set(doc(db, 'inventory', variantRef.id), {
        variantId: variantRef.id,
        sku,
        quantity,
        reservedQuantity: 0,
        availableQuantity: quantity,
        reorderLevel,
        updatedAt: serverTimestamp(),
      });
      if (quantity > 0) {
        firestoreTransaction.set(doc(collection(db, 'inventoryTransactions')), {
        variantId: variantRef.id,
        type: 'IN',
        quantity,
        referenceType: 'MANUAL',
        referenceId: variantTargetProduct.value!.id,
        createdAt: serverTimestamp(),
        createdBy: authStore.user?.uid || '',
      });
      }
    }, { barcode, sku, productId: variantTargetProduct.value.id }, {
      affectedCollections: ['productVariants', 'inventory', 'inventoryTransactions'],
    });

    await fetchProductVariants(variantTargetProduct.value.id);
    await fetchInventorySummaries(products.value.map((product: Product) => product.id));
    resetVariantForm();
  } catch (e: any) {
    variantError.value = e?.message || 'Failed to create product variant.';
  } finally {
    variantSaving.value = false;
  }
};
const openAddProduct = async () => {
  resetForm();
  const canCreate = await enforceProductLimitForCreate();
  if (!canCreate) return;
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
  form.isActive = product.isActive !== false;
  existingImages.value = product.images || [];
  const productDefaultImage = (product as any)?.defaultImage as string | undefined;
  const existingDefaultIndex = existingImages.value.findIndex((url: string) => url === productDefaultImage);
  if (existingDefaultIndex >= 0) {
    defaultImageSelection.value = { source: 'existing', index: existingDefaultIndex };
  }
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

  if (!defaultImageSelection.value || defaultImageSelection.value.source !== 'new') return;
  if (defaultImageSelection.value.index === index) {
    defaultImageSelection.value = null;
    return;
  }
  if (defaultImageSelection.value.index > index) {
    defaultImageSelection.value = {
      source: 'new',
      index: defaultImageSelection.value.index - 1,
    };
  }
};

const selectDefaultImage = (source: 'existing' | 'new', index: number) => {
  defaultImageSelection.value = { source, index };
};

const isDefaultImage = (source: 'existing' | 'new', index: number) => {
  return defaultImageSelection.value?.source === source && defaultImageSelection.value?.index === index;
};

const resolveDefaultImageUrl = (uploadedUrls: string[]) => {
  if (defaultImageSelection.value?.source === 'existing') {
    return existingImages.value[defaultImageSelection.value.index] || existingImages.value[0] || uploadedUrls[0] || '';
  }
  if (defaultImageSelection.value?.source === 'new') {
    return uploadedUrls[defaultImageSelection.value.index] || existingImages.value[0] || uploadedUrls[0] || '';
  }

  return existingImages.value[0] || uploadedUrls[0] || '';
};

const openStockModal = async (product: Product) => {
  stockTargetProduct.value = product;
  stockVariants.value = [];
  stockInventoryByVariantId.value = {};
  stockForm.variantId = '';
  stockForm.movementType = 'in';
  stockForm.quantity = 1;
  stockForm.note = '';
  stockError.value = '';
  showStockModal.value = true;

  if (!db) return;
  stockVariantsLoading.value = true;
  try {
    const variantsSnapshot = await getDocs(query(
      collection(db, 'productVariants'),
      where('productId', '==', product.id)
    ));
    stockVariants.value = variantsSnapshot.docs.map((variantDoc: any) => ({
      id: variantDoc.id,
      ...variantDoc.data(),
    })) as ProductVariant[];

    const inventoryEntries: Array<readonly [string, Inventory] | null> = await Promise.all(stockVariants.value.map(async (variant: ProductVariant) => {
      const inventorySnapshot = await getDoc(doc(db, 'inventory', variant.id));
      if (!inventorySnapshot.exists()) return null;
      const inventoryData = inventorySnapshot.data() as Omit<Inventory, 'id'>;
      return [variant.id, { id: inventorySnapshot.id, ...inventoryData }] as const;
    }));
    const availableInventoryEntries = inventoryEntries.filter(
      (entry): entry is readonly [string, Inventory] => entry !== null
    );
    stockInventoryByVariantId.value = Object.fromEntries(
      availableInventoryEntries
    ) as Record<string, Inventory>;
    stockForm.variantId = stockVariants.value[0]?.id || '';
    if (!stockVariants.value.length) {
      stockError.value = 'This product has no variants. Add a product variant before adjusting inventory.';
    }
  } catch (e: any) {
    stockError.value = e?.message || 'Failed to load product variants.';
  } finally {
    stockVariantsLoading.value = false;
  }
};

const closeStockModal = () => {
  showStockModal.value = false;
  stockTargetProduct.value = null;
  stockVariants.value = [];
  stockInventoryByVariantId.value = {};
  stockForm.variantId = '';
  stockError.value = '';
};

const selectedStockVariant = computed(() => {
  return stockVariants.value.find((variant: ProductVariant) => variant.id === stockForm.variantId) || null;
});

const selectedStockInventory = computed(() => {
  return stockForm.variantId ? stockInventoryByVariantId.value[stockForm.variantId] || null : null;
});

const stockBaseValue = computed(() => {
  return Number(selectedStockInventory.value?.availableQuantity || 0);
});

const stockProjectedValue = computed(() => {
  const qty = Math.max(0, Number(stockForm.quantity) || 0);
  return stockForm.movementType === 'in' ? stockBaseValue.value + qty : stockBaseValue.value - qty;
});

const applyStockMovement = async () => {
  if (!db || !stockTargetProduct.value) return;

  stockError.value = '';
  if (!selectedStockVariant.value || !selectedStockInventory.value) {
    stockError.value = 'Select a variant with an inventory record.';
    return;
  }
  const quantity = Number(stockForm.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    stockError.value = 'Quantity must be greater than 0.';
    return;
  }

  stockSaving.value = true;
  try {
    const inventoryRef = doc(db, 'inventory', selectedStockVariant.value.id);
    const inventorySnapshot = await getDoc(inventoryRef);
    if (!inventorySnapshot.exists()) {
      stockError.value = 'Inventory record not found for this variant.';
      return;
    }

    const inventoryData = inventorySnapshot.data() as Omit<Inventory, 'id'>;
    const previousQuantity = Number(inventoryData.quantity || 0);
    const reservedQuantity = Number(inventoryData.reservedQuantity || 0);
    const previousAvailableQuantity = Number(inventoryData.availableQuantity ?? previousQuantity - reservedQuantity);
    const adjustment = stockForm.movementType === 'in' ? quantity : -quantity;
    const newQuantity = previousQuantity + adjustment;
    const newAvailableQuantity = previousAvailableQuantity + adjustment;

    if (newQuantity < reservedQuantity || newAvailableQuantity < 0) {
      stockError.value = 'Stock out cannot reduce available inventory below 0 or reserved inventory.';
      return;
    }

    await updateDoc(inventoryRef, {
      quantity: newQuantity,
      availableQuantity: newAvailableQuantity,
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'inventoryTransactions'), {
      variantId: selectedStockVariant.value.id,
      type: stockForm.movementType === 'in' ? 'IN' : 'OUT',
      quantity,
      referenceType: 'MANUAL',
      referenceId: stockTargetProduct.value.id,
      note: stockForm.note.trim() || null,
      createdBy: authStore.user?.uid || '',
      createdAt: serverTimestamp(),
    });

    const aggregateAvailableQuantity = Object.entries(stockInventoryByVariantId.value as Record<string, Inventory>).reduce((sum, [variantId, inventory]) => {
      return sum + (variantId === selectedStockVariant.value?.id
        ? newAvailableQuantity
        : Number(inventory.availableQuantity || 0));
    }, 0);
    await updateDoc(doc(db, 'products', stockTargetProduct.value.id), {
      currentStock: aggregateAvailableQuantity,
      updatedAt: serverTimestamp(),
    });

    closeStockModal();
    await fetchProducts();
  } catch (e: any) {
    stockError.value = e?.message || 'Failed to update stock.';
  } finally {
    stockSaving.value = false;
  }
};

const fetchShop = async () => {
  if (!db) return;
  try {
    const snap = await getDoc(doc(db, 'shops', shopId.value));
    if (snap.exists()) {
      const data = (snap.data() || {}) as Record<string, any>;
      shop.value = Object.assign({ id: snap.id }, data) as Shop;
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

const fetchInventorySummaries = async (productIds: string[]) => {
  if (!db || !productIds.length) {
    inventorySummaryByProductId.value = {};
    return;
  }

  const variantSnapshots = await Promise.all(productIds.map((productId) => {
    return getDocs(query(collection(db, 'productVariants'), where('productId', '==', productId)));
  }));
  const variants = variantSnapshots.flatMap((snapshot: any) => {
    return snapshot.docs.map((variantDoc: any) => ({
      id: variantDoc.id,
      productId: variantDoc.data().productId as string,
    }));
  });
  const inventoryEntries = await Promise.all(variants.map(async (variant) => {
    const inventorySnapshot = await getDoc(doc(db, 'inventory', variant.id));
    if (!inventorySnapshot.exists()) return null;
    const inventory = inventorySnapshot.data() as Omit<Inventory, 'id'>;
    return { productId: variant.productId, inventory };
  }));

  const summaries = Object.fromEntries(productIds.map((productId) => [productId, {
    quantity: 0,
    availableQuantity: 0,
  }])) as Record<string, { quantity: number; availableQuantity: number }>;
  inventoryEntries.forEach((entry) => {
    if (!entry) return;
    summaries[entry.productId].quantity += Number(entry.inventory.quantity || 0);
    summaries[entry.productId].availableQuantity += Number(entry.inventory.availableQuantity || 0);
  });
  inventorySummaryByProductId.value = summaries;
};

const fetchProducts = async () => {
  if (!db) return;
  loading.value = true;
  fetchError.value = '';
  try {
    const q = query(collection(db, 'products'), where('shopId', '==', shopId.value));
    const snap = await getDocs(q);
    const fetchedProducts = snap.docs
      .map((d: any) => ({ id: d.id, ...d.data() } as Product))
      .filter((p: Product) => !p.deletedAt)
      .sort((a: Product, b: Product) => timestampToMillis(b.createdAt) - timestampToMillis(a.createdAt));
    products.value = fetchedProducts;
    await fetchInventorySummaries(fetchedProducts.map((product: Product) => product.id));
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load products.';
  } finally {
    loading.value = false;
  }
};

const filteredProducts = computed(() => {
  const queryText = searchName.value.trim().toLowerCase();
  if (!queryText) return products.value;

  return products.value.filter((p: Product) => String(p.name || '').toLowerCase().includes(queryText));
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredProducts.value.length / itemsPerPage));
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProducts.value.slice(start, start + itemsPerPage);
});

watch(searchName, () => {
  currentPage.value = 1;
});

watch(filteredProducts, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

const goToPreviousPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1;
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1;
};

const resolveCurrentPlanId = async (uid: string) => {
  if (!db) return 'free';
  const subscriptionsSnap = await getDocs(query(collection(db, 'subscriptions'), where('userId', '==', uid)));
  if (subscriptionsSnap.empty) return 'free';

  const latest = subscriptionsSnap.docs
    .map((d: any) => ({ id: d.id, ...(d.data() as any) }))
    .sort((a: any, b: any) => {
      const aTime =
        a?.updatedAt?.toDate?.()?.getTime?.() ||
        a?.createdAt?.toDate?.()?.getTime?.() ||
        Number(a?.clientCreatedAt || 0);
      const bTime =
        b?.updatedAt?.toDate?.()?.getTime?.() ||
        b?.createdAt?.toDate?.()?.getTime?.() ||
        Number(b?.clientCreatedAt || 0);
      return bTime - aTime;
    })[0];

  return String(latest?.planId || 'free').trim().toLowerCase();
};

const countActiveProductsForShop = async () => {
  if (!db) return 0;
  const productsSnap = await getDocs(query(collection(db, 'products'), where('shopId', '==', shopId.value)));
  return productsSnap.docs.filter((d: any) => {
    const data = d.data() as any;
    return !data?.deletedAt;
  }).length;
};

const enforceProductLimitForCreate = async () => {
  if (!db) {
    formError.value = 'Firebase is not available.';
    return false;
  }

  const uid = authStore.user?.uid || '';
  if (!uid) {
    formError.value = 'User is not authenticated.';
    return false;
  }

  const planId = await resolveCurrentPlanId(uid);
  const maxProducts = PRODUCT_LIMITS_BY_PLAN[planId];
  if (!maxProducts) return true;

  const productCount = await countActiveProductsForShop();
  if (productCount >= maxProducts) {
    await navigateTo({
      path: '/dashboard/subscriptions',
      query: {
        upgradeReason: 'product-limit',
        planId,
        maxProducts: String(maxProducts),
      },
    });
    return false;
  }

  return true;
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
    if (!isEditing.value) {
      const canCreate = await enforceProductLimitForCreate();
      if (!canCreate) return;
    }

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
    const defaultImage = resolveDefaultImageUrl(uploadedUrls);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      category: form.category.trim(),
      isActive: form.isActive,
      images,
      defaultImage,
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
        currentStock: 0,
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
      <div class="header-actions">
        <input
          v-model="searchName"
          type="text"
          class="search-input"
          placeholder="Search product name"
        />
        <button class="btn btn-primary" @click="openAddProduct">Add Product</button>
      </div>
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
                  <img :src="url" alt="Existing" :class="{ 'is-default': isDefaultImage('existing', i) }" @click="selectDefaultImage('existing', i)" />
                  <span v-if="isDefaultImage('existing', i)" class="default-badge">Default</span>
                </div>
              </div>
              <div v-if="imagePreviews.length" class="preview-list">
                <div v-for="(p, i) in imagePreviews" :key="i" class="preview-thumb">
                  <img :src="p.url" :alt="p.name" :class="{ 'is-default': isDefaultImage('new', i) }" @click="selectDefaultImage('new', i)" />
                  <span v-if="isDefaultImage('new', i)" class="default-badge">Default</span>
                  <button type="button" class="remove-thumb" @click="removeImage(i)">&times;</button>
                </div>
              </div>
            </div>
            <div class="field check">
              <label class="checkbox">
                <input v-model="form.isActive" type="checkbox" />
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

    <div v-if="showVariantModal" class="modal-overlay" @click.self="closeVariantModal">
      <div class="modal-card variant-modal-card">
        <div class="modal-header">
          <div>
            <h3>Manage Product Variants</h3>
            <div class="modal-subtitle">{{ variantTargetProduct?.name || '-' }}</div>
          </div>
          <button class="close-btn" @click="closeVariantModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="variant-section-heading">
            <span>Existing Variants</span>
            <span class="variant-count">{{ productVariants.length }}</span>
          </div>
          <div v-if="variantsLoading" class="variant-empty">Loading variants...</div>
          <div v-else-if="!productVariants.length" class="variant-empty">No variants yet. Create the first variant below.</div>
          <div v-else class="variant-table-wrap">
            <table class="variant-table">
              <thead>
                <tr>
                  <th>Variant</th>
                  <th>SKU</th>
                  <th>Barcode</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="variant in productVariants" :key="variant.id">
                  <td>
                    <div class="variant-name">{{ variant.attributes.size }} / {{ variant.attributes.color }}</div>
                    <div class="variant-description">{{ variant.name }}</div>
                  </td>
                  <td><span class="variant-sku">{{ variant.sku }}</span></td>
                  <td><span class="variant-barcode">{{ variant.barcode || '-' }}</span></td>
                  <td>₱{{ Number(variant.price || 0).toFixed(2) }}</td>
                  <td>{{ variantInventoryById[variant.id]?.quantity ?? 0 }}</td>
                  <td>{{ variantInventoryById[variant.id]?.availableQuantity ?? 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="variant-form-divider"></div>
          <div class="variant-section-heading">Create Variant</div>
          <div class="form-grid variant-form-grid">
            <div class="field">
              <label>SKU</label>
              <input v-model="variantForm.sku" type="text" class="input" placeholder="MNS-SHIRT-BLK-M" />
            </div>
            <div class="field">
              <label>Barcode (EAN-13)</label>
              <input v-model="variantForm.barcode" type="text" inputmode="numeric" maxlength="13" class="input" placeholder="4801234567891" />
            </div>
            <div class="field">
              <label>Variant Name</label>
              <input v-model="variantForm.name" type="text" class="input" placeholder="Product variant name" />
            </div>
            <div class="field">
              <label>Size</label>
              <input v-model="variantForm.size" type="text" class="input" placeholder="Medium" />
            </div>
            <div class="field">
              <label>Color</label>
              <input v-model="variantForm.color" type="text" class="input" placeholder="Black" />
            </div>
            <div class="field">
              <label>Price</label>
              <input v-model.number="variantForm.price" type="number" min="0" step="0.01" class="input" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Opening Quantity</label>
              <input v-model.number="variantForm.quantity" type="number" min="0" step="1" class="input" placeholder="0" />
            </div>
            <div class="field full">
              <label>Reorder Level</label>
              <input v-model.number="variantForm.reorderLevel" type="number" min="0" step="1" class="input" placeholder="10" />
            </div>
          </div>
          <div v-if="variantError" class="error">{{ variantError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeVariantModal">Close</button>
          <button class="btn btn-primary" :disabled="variantSaving" @click="createProductVariant">
            <span v-if="variantSaving">Creating...</span>
            <span v-else>Create Variant</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="state loading">Loading products...</div>
    <div v-else-if="fetchError" class="state error">{{ fetchError }}</div>
    <div v-else-if="!products.length" class="state empty">No products yet.</div>
    <div v-else-if="!filteredProducts.length" class="state empty">No products found for "{{ searchName }}".</div>
    <div v-else class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Inventory Quantity</th>
              <th>Availability</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in paginatedProducts" :key="p.id">
              <td data-label="Product">
                <div class="product-name">{{ p.name }}</div>
                <div class="product-desc">{{ p.description || '-' }}</div>
              </td>
              <td data-label="Price">₱{{ (p.price || 0).toFixed(2) }}</td>
              <td data-label="Inventory Quantity">{{ inventorySummaryByProductId[p.id]?.quantity ?? 0 }}</td>
              <td data-label="Availability">
                <span class="badge" :class="p.isActive ? 'badge-success' : 'badge-inactive'">
                  <span class="dot"></span>
                  {{ p.isActive ? 'Available' : 'Unavailable' }}
                </span>
              </td>
              <td data-label="Actions" class="actions">
                <button class="btn-variants" @click="openVariantModal(p)">Variants</button>
                <button class="btn-stock" @click="openStockModal(p)">Stocks</button>
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
      <div v-if="filteredProducts.length > itemsPerPage" class="pagination">
        <button class="btn btn-ghost" :disabled="currentPage === 1" @click="goToPreviousPage">Previous</button>
        <span class="pagination-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button class="btn btn-ghost" :disabled="currentPage === totalPages" @click="goToNextPage">Next</button>
      </div>
    </div>

    <div v-if="showStockModal" class="modal-overlay" @click.self="closeStockModal">
      <div class="modal-card stock-modal-card">
        <div class="modal-header">
          <h3>Add Product Stock</h3>
          <button class="close-btn" @click="closeStockModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="stock-summary">
            <div class="stock-name">{{ stockTargetProduct?.name || '-' }}</div>
            <div class="stock-grid">
              <div>
                <div class="stock-label">Current Stock</div>
                <div class="stock-value">{{ stockBaseValue }}</div>
              </div>
              <div>
                <div class="stock-label">Projected Stock</div>
                <div class="stock-value" :class="stockProjectedValue < 0 ? 'danger' : 'ok'">{{ stockProjectedValue }}</div>
              </div>
            </div>
          </div>

          <div class="form-grid stock-form-grid">
            <div class="field full">
              <label>Product Variant</label>
              <select v-model="stockForm.variantId" class="input" :disabled="stockVariantsLoading || !stockVariants.length">
                <option value="" disabled>{{ stockVariantsLoading ? 'Loading variants...' : 'Select a variant' }}</option>
                <option v-for="variant in stockVariants" :key="variant.id" :value="variant.id">
                  {{ variant.attributes.size }} / {{ variant.attributes.color }} - {{ variant.sku }}
                </option>
              </select>
              <div v-if="selectedStockVariant" class="selected-variant-meta">
                <span>{{ selectedStockVariant.name }}</span>
                <span class="variant-sku">{{ selectedStockVariant.sku }}</span>
              </div>
            </div>
            <div class="field">
              <label>Movement Type</label>
              <select v-model="stockForm.movementType" class="input">
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
              </select>
            </div>
            <div class="field">
              <label>Quantity</label>
              <input v-model.number="stockForm.quantity" type="number" min="1" step="1" class="input" placeholder="1" />
            </div>
            <div class="field full">
              <label>Note (Optional)</label>
              <textarea v-model="stockForm.note" class="input" rows="2" placeholder="Reason or remarks"></textarea>
            </div>
          </div>

          <div v-if="stockError" class="error">{{ stockError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeStockModal">Cancel</button>
          <button class="btn btn-primary" :disabled="stockSaving || stockVariantsLoading || !selectedStockInventory" @click="applyStockMovement">
            <span v-if="stockSaving">Saving...</span>
            <span v-else>Save Stock Movement</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-page { max-width: 1100px; margin: 0 auto; padding: 24px 0px; }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.page-title { font-size: 28px; font-weight: 900; margin: 0 0 6px; color: #0f172a; }
.page-subtitle { font-size: 14px; color: #64748b; margin: 0; }
.search-input { min-width: 220px; padding: 10px 12px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 14px; outline: none; background: #fff; }
.search-input:focus { border-color: #fbbf24; box-shadow: 0 0 0 3px rgba(251,191,36,0.15); }
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
.btn-stock { margin-left: 5px; height: 36px; border-radius: 10px; border: 1px solid #c7d2fe; background: #eef2ff; color: #3730a3; font-weight: 700; font-size: 12px; padding: 0 10px; cursor: pointer; transition: all 0.2s; }
.btn-stock:hover { margin-left: 5px; background: #e0e7ff; border-color: #a5b4fc; }
.btn-variants { height: 36px; border-radius: 10px; border: 1px solid #99f6e4; background: #f0fdfa; color: #0f766e; font-weight: 700; font-size: 12px; padding: 0 10px; cursor: pointer; transition: all 0.2s; }
.btn-variants:hover { background: #ccfbf1; border-color: #5eead4; }
.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 14px; }
.pagination-info { font-size: 13px; font-weight: 700; color: #475569; }
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
  .card { padding: 14px; }
  .form-grid { grid-template-columns: 1fr; }
  .form-grid .full { grid-column: span 1; }
  .header-actions { width: 100%; }
  .search-input { width: 100%; min-width: 0; }
  .data-table thead { display: none; }
  .data-table,
  .data-table tbody,
  .data-table tr,
  .data-table td {
    display: block;
    width: 100%;
  }
  .data-table tbody tr {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 10px;
    overflow: hidden;
    background: #fff;
  }
  .data-table td {
    position: static;
    text-align: left;
    padding: 12px;
    padding-left: 12px;
    border-bottom: 1px solid #f1f5f9;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .data-table td:last-child { border-bottom: none; }
  .data-table td::before {
    content: attr(data-label);
    position: static;
    transform: none;
    font-size: 11px;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .data-table td[data-label='Product'] {
    text-align: left;
  }
  .data-table td.actions {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    padding-left: 12px;
    overflow-x: auto;
  }
  .data-table td.actions::before { content: none; }
  .product-item { flex-direction: column; align-items: flex-start; gap: 12px; }
  .product-actions { align-self: flex-end; }
}
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 100; }
.modal-card { background: #fff; border-radius: 20px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(15,23,42,0.25); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 900; color: #0f172a; }
.modal-subtitle { margin-top: 3px; color: #64748b; font-size: 12px; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 28px; line-height: 1; color: #94a3b8; cursor: pointer; }
.close-btn:hover { color: #0f172a; }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #f8fafc; border-radius: 0 0 20px 20px; }
.stock-modal-card { max-width: 620px; }
.variant-modal-card { max-width: 820px; }
.variant-section-heading { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #0f172a; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
.variant-count { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; padding: 0 7px; border-radius: 999px; background: #ccfbf1; color: #0f766e; font-size: 11px; }
.variant-empty { padding: 24px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #f8fafc; color: #64748b; text-align: center; font-size: 13px; font-weight: 600; }
.variant-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; }
.variant-table { width: 100%; border-collapse: collapse; }
.variant-table th { padding: 10px 12px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 10px; font-weight: 900; text-align: left; text-transform: uppercase; }
.variant-table td { padding: 11px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px; }
.variant-table tbody tr:last-child td { border-bottom: none; }
.variant-name { font-weight: 800; }
.variant-description { margin-top: 2px; color: #64748b; font-size: 11px; }
.variant-form-divider { height: 1px; margin: 24px 0; background: #e2e8f0; }
.variant-form-grid { gap: 14px; }
.stock-summary { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 14px; padding: 14px; margin-bottom: 14px; }
.stock-name { font-size: 15px; font-weight: 900; color: #78350f; margin-bottom: 10px; }
.stock-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.stock-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #92400e; font-weight: 700; }
.stock-value { font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.1; }
.stock-value.ok { color: #166534; }
.stock-value.danger { color: #dc2626; }
.stock-form-grid { margin-top: 6px; }
.selected-variant-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #64748b; font-size: 12px; }
.variant-sku { padding: 3px 7px; border-radius: 5px; background: #eef2ff; color: #4338ca; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 800; white-space: nowrap; }
.variant-barcode { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; letter-spacing: 0; white-space: nowrap; }
.table-wrap { width: 100%; overflow-x: auto; }
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
.preview-thumb img { width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
.preview-thumb img.is-default { outline: 3px solid #f59e0b; outline-offset: -3px; }
.default-badge { position: absolute; left: 4px; bottom: 4px; font-size: 9px; font-weight: 800; color: #fff; background: rgba(15,23,42,0.8); border-radius: 999px; padding: 2px 6px; }
.remove-thumb { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,0.5); color: #fff; border: none; font-size: 14px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
</style>
