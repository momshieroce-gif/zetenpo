<script setup lang="ts">
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import type { Product, Shop } from '~/types';

const route = useRoute();
const shopId = route.params.id as string;

const nuxtApp = useNuxtApp() as any;
const shop = ref<Shop | null>(null);
const products = ref<Product[]>([]);
const loading = ref(true);
const page = ref(1);
const pageSize = 10;
const { cart, addToCart } = useCart();

const totalPages = computed(() => Math.ceil(products.value.length / pageSize));
const paginatedProducts = computed(() => products.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const showMultiShopModal = ref(false);

const handleAddToCart = (product: Product) => {
  const cartShopId = cart.value.length ? cart.value[0].product.shopId : null;
  if (cartShopId && cartShopId !== shopId) {
    showMultiShopModal.value = true;
    return;
  }
  addToCart(product);
};

useHead({
  title: computed(() => (shop.value?.name ? `${shop.value.name} | My Near Shops` : 'Shop | My Near Shops')),
});

const fetchData = async () => {
  if (!process.client || !nuxtApp.$firebase?.db) return;
  loading.value = true;
  const db = nuxtApp.$firebase.db;

  const shopDoc = await getDoc(doc(db, 'shops', shopId));
  if (shopDoc.exists()) {
    shop.value = { id: shopDoc.id, ...shopDoc.data() } as Shop;
  }

  const q = query(collection(db, 'products'), where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  const list: Product[] = [];
  snapshot.forEach((d) => {
    const data = d.data() as Product;
    list.push({ ...data, id: d.id });
  });
  products.value = list;
  loading.value = false;
};

onMounted(fetchData);
</script>

<template>
  <div class="shop-page">
    <div class="shop-hero">
      <div class="shop-hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="grid"></div>
      </div>
      <div class="shop-hero-inner">
        <NuxtLink to="/find-shops" class="back-link">← Back to search</NuxtLink>
        <div v-if="shop" class="shop-header">
          <h1 class="shop-name">{{ shop.name }}</h1>
          <p v-if="shop.address" class="shop-meta">{{ shop.address }}</p>
          <p v-if="shop.phone" class="shop-meta">{{ shop.phone }}</p>
        </div>
        <div v-else-if="!loading" class="shop-header">
          <h1 class="shop-name">Shop not found</h1>
        </div>
      </div>
    </div>

    <div class="products-section">
      <div class="container">
        <div class="section-title">Products <span class="count">({{ products.length }})</span></div>

        <div v-if="loading" class="loading">Loading products...</div>
        <div v-else-if="!products.length" class="empty-state">
          <div class="empty-icon">P</div>
          <div class="empty-title">No products yet</div>
          <div class="empty-desc">This shop has not listed any products.</div>
        </div>
        <div v-else class="products-grid">
          <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
            <div class="product-image">
              <img v-if="product.images?.length" :src="product.images[0]" :alt="product.name" />
              <div v-else class="no-image">No image</div>
            </div>
            <div class="product-body">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">₱{{ Number(product.price).toFixed(2) }}</div>
              <div v-if="product.category" class="product-category">{{ product.category }}</div>
              <div v-if="product.stock !== undefined" class="product-stock">{{ product.stock }} in stock</div>
            <div class="product-actions">
              <NuxtLink :to="`/items/${product.id}`" class="view-btn">View</NuxtLink>
              <button class="add-btn" @click.stop="handleAddToCart(product)">Add to Cart</button>
            </div>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="page === 1" @click="page--">Previous</button>
          <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
          <button class="page-btn" :disabled="page === totalPages" @click="page++">Next</button>
        </div>
      </div>
    </div>

    <div v-if="showMultiShopModal" class="modal-overlay" @click.self="showMultiShopModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Multiple shops detected</h3>
          <button class="close-btn" @click="showMultiShopModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Your cart already has products from another shop. Complete your previous order first before adding items from this shop.</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-ghost" @click="showMultiShopModal = false">Continue Shopping</button>
          <NuxtLink to="/cart" class="modal-btn modal-btn-primary" @click="showMultiShopModal = false">Go to Cart</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-page {
  background: #f4f5f7;
  min-height: 100vh;
}

.shop-hero {
  position: relative;
  background: linear-gradient(145deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%);
  color: #fff;
  padding: 40px 0 28px;
  overflow: hidden;
}

.shop-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.3);
  top: -150px;
  right: -80px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: rgba(99, 102, 241, 0.25);
  bottom: -60px;
  left: -60px;
}

.grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}

.shop-hero-inner {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  z-index: 1;
}

.back-link {
  color: #fbbf24;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 16px;
  display: inline-block;
}

.shop-header {
  margin-top: 8px;
}

.shop-name {
  font-size: 32px;
  font-weight: 900;
  margin: 0 0 8px;
}

.shop-meta {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  margin: 2px 0;
}

.products-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.section-title {
  font-size: 22px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 24px;
}

.count {
  color: #9ca3af;
  font-weight: 600;
}

.loading, .empty-state {
  padding: 60px 0;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  margin: 0 auto 16px;
}

.empty-title {
  font-weight: 700;
  color: #374151;
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 13px;
  color: #9ca3af;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #f3f4f6;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.product-image {
  width: 100%;
  height: 180px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #9ca3af;
  font-size: 13px;
  font-weight: 600;
}

.product-body {
  padding: 16px;
}

.product-name {
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
  font-size: 15px;
}

.product-price {
  font-size: 20px;
  font-weight: 900;
  color: #4c1d95;
  margin-bottom: 8px;
}

.product-category, .product-stock {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.product-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.view-btn {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  border-radius: 10px;
  background: #ede9fe;
  color: #6d28d9;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition: background 0.2s;
}

.view-btn:hover {
  background: #c4b5fd;
}

.add-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.45);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
}

.page-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: #1e1b4b;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: #312e81;
}

.page-info {
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
}
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 100; }
.modal-card { background: #fff; border-radius: 20px; width: 100%; max-width: 440px; box-shadow: 0 24px 60px rgba(15,23,42,0.25); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 900; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 28px; line-height: 1; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 24px; color: #475569; font-size: 15px; line-height: 1.5; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #f8fafc; border-radius: 0 0 20px 20px; }
.modal-btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 18px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; border: none; }
.modal-btn-primary { background: #f59e0b; color: #fff; }
.modal-btn-primary:hover { background: #d97706; }
.modal-btn-ghost { background: transparent; color: #64748b; }
.modal-btn-ghost:hover { background: #f1f5f9; }
</style>
