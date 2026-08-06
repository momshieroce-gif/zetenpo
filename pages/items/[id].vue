<script setup lang="ts">
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import type { Product, Shop } from '~/types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const productId = route.params.id as string;

const nuxtApp = useNuxtApp() as any;
const product = ref<Product | null>(null);
const shop = ref<Shop | null>(null);
const loading = ref(true);
const selectedImage = ref(0);
const { cart, addToCart } = useCart();
const added = ref(false);
const inquiryLoading = ref(false);

useHead({
  title: computed(() => (product.value?.name ? `${product.value.name} | My Near Shops` : 'Product | My Near Shops')),
});

const fetchData = async () => {
  if (!process.client || !nuxtApp.$firebase?.db) return;
  loading.value = true;
  const db = nuxtApp.$firebase.db;

  const productDoc = await getDoc(doc(db, 'products', productId));
  if (productDoc.exists()) {
    product.value = { id: productDoc.id, ...productDoc.data() } as Product;
    if (product.value?.shopId) {
      const shopDoc = await getDoc(doc(db, 'shops', product.value.shopId));
      if (shopDoc.exists()) {
        shop.value = { id: shopDoc.id, ...shopDoc.data() } as Shop;
      }
    }
  }
  loading.value = false;
};

const showMultiShopModal = ref(false);

const handleAddToCart = () => {
  if (!product.value) return;
  const cartShopId = cart.value.length ? cart.value[0].product.shopId : null;
  if (cartShopId && cartShopId !== product.value.shopId) {
    showMultiShopModal.value = true;
    return;
  }
  addToCart(product.value);
  added.value = true;
  setTimeout(() => (added.value = false), 1500);
};

const handleInquire = async () => {
  if (!product.value) return;
  if (!authStore.isLoggedIn) {
    return router.push({ path: '/login', query: { redirect: route.fullPath } });
  }

  inquiryLoading.value = true;
  const db = nuxtApp.$firebase.db;
  const chatsRef = collection(db, 'chats');
  const existingQuery = query(
    chatsRef,
    where('userId', '==', authStore.user?.uid),
    where('productId', '==', product.value.id)
  );

  const existingSnapshot = await getDocs(existingQuery);
  if (!existingSnapshot.empty) {
    const existingChat = existingSnapshot.docs[0];
    inquiryLoading.value = false;
    return router.push(`/chats/${existingChat.id}`);
  }

  const chatData = {
    userId: authStore.user?.uid,
    productId: product.value.id,
    shopId: product.value.shopId,
    lastMessage: 'Hi, I would like to inquire about this product.',
    lastMessageAt: serverTimestamp(),
    lastMessageSender: 'customer',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const newChatDoc = doc(chatsRef);
  await setDoc(newChatDoc, chatData);
  const messagesRef = collection(newChatDoc, 'messages');
  await addDoc(messagesRef, {
    senderId: authStore.user?.uid,
    senderType: 'customer',
    shopId: product.value.shopId,
    text: 'Hi, I would like to inquire about this product.',
    read: false,
    createdAt: serverTimestamp(),
  });

  inquiryLoading.value = false;
  router.push(`/chats/${newChatDoc.id}`);
};

onMounted(fetchData);
</script>

<template>
  <div class="item-page">
    <div class="item-hero">
      <div class="item-hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="grid"></div>
      </div>
      <div class="item-hero-inner">
        <NuxtLink v-if="product?.shopId" :to="`/shops/${product.shopId}`" class="back-link">← Back to shop</NuxtLink>
        <NuxtLink v-else to="/find-shops" class="back-link">← Back to search</NuxtLink>
        <h1 class="item-name">{{ product?.name || 'Product' }}</h1>
        <p v-if="shop" class="shop-name">Sold by {{ shop.name }}</p>
      </div>
    </div>

    <div class="item-body">
      <div class="container">
        <div v-if="loading" class="loading">Loading product...</div>
        <div v-else-if="!product" class="empty-state">
          <div class="empty-icon">?</div>
          <div class="empty-title">Product not found</div>
        </div>
        <div v-else class="item-detail">
          <div class="item-gallery">
            <div class="main-image">
              <img v-if="product.images?.length" :src="product.images[selectedImage]" :alt="product.name" />
              <div v-else class="no-image">No image</div>
            </div>
            <div v-if="product.images?.length > 1" class="thumbnails">
              <button v-for="(img, idx) in product.images" :key="idx" class="thumb" :class="{ active: selectedImage === idx }" @click="selectedImage = idx">
                <img :src="img" :alt="`${product.name} ${idx + 1}`" />
              </button>
            </div>
          </div>

          <div class="item-info">
            <div class="item-category" v-if="product.category">{{ product.category }}</div>
            <div class="item-price">₱{{ Number(product.price).toFixed(2) }}</div>
            <div v-if="product.stock !== undefined" class="item-stock" :class="{ low: product.stock <= 5 }">{{ product.stock }} in stock</div>

            <div class="item-desc">
              <h3>Description</h3>
              <p>{{ product.description || 'No description provided.' }}</p>
            </div>

            <div v-if="product.tags?.length" class="item-tags">
              <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>

            <div class="item-actions">
              <button class="add-to-cart" @click="handleAddToCart">
                <span v-if="!added">Add to Cart</span>
                <span v-else>Added!</span>
              </button>
              <button class="inquire-btn" @click="handleInquire" :disabled="inquiryLoading">
                <span v-if="!inquiryLoading">Product Inquiry</span>
                <span v-else>Opening chat...</span>
              </button>
            </div>
          </div>
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
.item-page {
  background: #f4f5f7;
  min-height: 100vh;
}

.item-hero {
  position: relative;
  background: linear-gradient(145deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%);
  color: #fff;
  padding: 40px 0 28px;
  overflow: hidden;
}

.item-hero-bg {
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

.item-hero-inner {
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

.item-name {
  font-size: 32px;
  font-weight: 900;
  margin: 0 0 8px;
}

.shop-name {
  margin: 0;
  font-size: 14px;
  color: rgba(255,255,255,0.7);
}

.item-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
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

.item-detail {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.item-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  width: 100%;
  height: 400px;
  background: #f9fafb;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #9ca3af;
  font-weight: 700;
}

.thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.thumb {
  width: 72px;
  height: 72px;
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #f3f4f6;
  padding: 0;
  transition: border-color 0.2s;
}

.thumb.active {
  border-color: #4c1d95;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-category {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6b7280;
}

.item-price {
  font-size: 32px;
  font-weight: 900;
  color: #4c1d95;
}

.item-stock {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}

.item-stock.low {
  color: #ef4444;
}

.item-desc h3 {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
}

.item-desc p {
  font-size: 15px;
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #ede9fe;
  color: #6d28d9;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
}

  .item-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: auto;
  }

  .add-to-cart,
  .inquire-btn {
    flex: 1 1 180px;
    min-width: 140px;
    border: none;
    border-radius: 14px;
    padding: 16px 22px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .add-to-cart {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #1a1a1a;
    box-shadow: 0 5px 18px rgba(251, 191, 36, 0.26);
  }

  .add-to-cart:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(251, 191, 36, 0.35);
  }

  .inquire-btn {
    background: #4c1d95;
    color: #ffffff;
    box-shadow: 0 5px 18px rgba(76, 29, 149, 0.22);
  }

  .inquire-btn:hover {
    transform: translateY(-2px);
    background: #6d28d9;
    box-shadow: 0 10px 24px rgba(76, 29, 149, 0.32);
  }

  .inquire-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 900px) {
    .item-detail {
      grid-template-columns: 1fr;
    }

    .item-actions {
      flex-direction: column;
    }
  }

.modal-btn-primary { background: #f59e0b; color: #fff; }
.modal-btn-primary:hover { background: #d97706; }
.modal-btn-ghost { background: transparent; color: #64748b; }
.modal-btn-ghost:hover { background: #f1f5f9; }
</style>
