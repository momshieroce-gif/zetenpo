<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore';
import { ref, computed, watch } from 'vue';

const { cart, cartCount, removeFromCart } = useCart();
const nuxtApp = useNuxtApp() as any;
const shopNames = ref<Record<string, string>>({});
const firstShopLink = computed(() => cart.value.length ? `/shops/${cart.value[0].product.shopId}` : '/find-shops');

const total = computed(() => cart.value.reduce((sum, item) => sum + Number(item.product.price || 0) * item.qty, 0));

const uniqueShopIds = computed(() => [...new Set(cart.value.map((item) => item.product.shopId).filter(Boolean))]);

const fetchShopNames = async () => {
  if (!process.client || !nuxtApp.$firebase?.db) return;
  const db = nuxtApp.$firebase.db;
  for (const shopId of uniqueShopIds.value) {
    if (shopNames.value[shopId]) continue;
    const snap = await getDoc(doc(db, 'shops', shopId));
    if (snap.exists()) {
      shopNames.value[shopId] = (snap.data() as { name?: string }).name || shopId;
    }
  }
};

watch(uniqueShopIds, fetchShopNames, { immediate: true });

useHead({
  title: 'Cart | My Near Shops',
});
</script>

<template>
  <div class="cart-page">
    <div class="cart-hero">
      <div class="cart-hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="grid"></div>
      </div>
      <div class="cart-hero-inner">
        <NuxtLink :to="firstShopLink" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
          <span>Back to shop</span>
        </NuxtLink>
        <h1 class="cart-title">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.82 14l-.76-3.18H3c-1.1 0-2-.9-2-2 0-.56.23-1.06.59-1.42L5.29 5.71l.71-2.12h13l-.65 1.93c.47.28.82.8.82 1.41 0 .94-.76 1.7-1.7 1.7h-.55l-.62 2.62H7.82zM6.16 8h11.15l-1.09-2.5H7.41L6.16 8z" fill="currentColor"/></svg>
          Your Cart
        </h1>
      </div>
    </div>

    <div class="cart-body">
      <div class="container">
        <div v-if="!cart.length" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.82 14l-.76-3.18H3c-1.1 0-2-.9-2-2 0-.56.23-1.06.59-1.42L5.29 5.71l.71-2.12h13l-.65 1.93c.47.28.82.8.82 1.41 0 .94-.76 1.7-1.7 1.7h-.55l-.62 2.62H7.82zM6.16 8h11.15l-1.09-2.5H7.41L6.16 8z" fill="currentColor"/></svg>
          </div>
          <div class="empty-title">Your cart is empty</div>
          <div class="empty-desc">Looks like you have not added anything yet.</div>
          <NuxtLink to="/find-shops" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/><circle cx="12" cy="9" r="2.5" fill="#1a1a1a"/></svg>
            Find Shops
          </NuxtLink>
        </div>
        <div v-else class="cart-grid">
          <div class="cart-items">
            <div v-for="(item, index) in cart" :key="item.product.id" class="cart-item">
              <NuxtLink :to="`/items/${item.product.id}`" class="item-image">
                <img v-if="item.product.images?.length" :src="item.product.images[0]" :alt="item.product.name" />
                <div v-else class="no-image"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/></svg></div>
              </NuxtLink>
              <div class="item-info">
                <NuxtLink :to="`/items/${item.product.id}`" class="item-name">{{ item.product.name }}</NuxtLink>
                <NuxtLink v-if="item.product.shopId" :to="`/shops/${item.product.shopId}`" class="item-shop">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/></svg>
                  {{ shopNames[item.product.shopId] || 'Shop' }}
                </NuxtLink>
                <div class="item-price">₱{{ (Number(item.product.price || 0) * item.qty).toFixed(2) }} <span class="qty">x{{ item.qty }}</span></div>
              </div>
              <button class="remove-btn" @click="removeFromCart(index)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div class="cart-summary">
            <div class="summary-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg>
              Order Summary
            </div>
            <div class="summary-row">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.82 14l-.76-3.18H3c-1.1 0-2-.9-2-2 0-.56.23-1.06.59-1.42L5.29 5.71l.71-2.12h13l-.65 1.93c.47.28.82.8.82 1.41 0 .94-.76 1.7-1.7 1.7h-.55l-.62 2.62H7.82zM6.16 8h11.15l-1.09-2.5H7.41L6.16 8z" fill="currentColor"/></svg>
                Items
              </span>
              <span>{{ cartCount }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>₱{{ total.toFixed(2) }}</span>
            </div>
            <button class="checkout-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  background: #f4f5f7;
  min-height: 100vh;
}

.cart-hero {
  position: relative;
  background: linear-gradient(145deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%);
  color: #fff;
  padding: 40px 0 28px;
  overflow: hidden;
}

.cart-hero-bg {
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

.cart-hero-inner {
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
}
.back-link:hover {
  opacity: 0.85;
}

.cart-title {
  font-size: 32px;
  font-weight: 900;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
  color: #6b7280;
}

.empty-icon {
  width: 96px;
  height: 96px;
  border-radius: 28px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.25);
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  margin-bottom: 24px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1a1a1a;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.45);
}

.cart-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  align-items: start;
  gap: 32px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s;
}

.item-image:hover img {
  transform: scale(1.08);
}

.no-image {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
  text-decoration: none;
  display: inline-block;
}

.item-name:hover {
  color: #4c1d95;
}

.item-shop {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.item-shop:hover {
  color: #4c1d95;
}

.item-price {
  font-size: 18px;
  font-weight: 900;
  color: #4c1d95;
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty {
  background: #ede9fe;
  color: #6d28d9;
  font-size: 12px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 10px;
}

.remove-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.remove-btn:hover {
  background: #fecaca;
}

.cart-summary {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  height: fit-content;
  position: sticky;
  top: 88px;
}

.summary-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
}

.summary-row span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.summary-row.total {
  border-bottom: none;
  color: #111827;
  font-weight: 800;
  font-size: 18px;
  margin-top: 8px;
}

.checkout-btn {
  width: 100%;
  margin-top: 24px;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.45);
}

@media (max-width: 900px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
