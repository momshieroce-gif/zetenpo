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

type ProductFeedback = {
  id: string;
  userId?: string;
  userName?: string;
  message?: string;
  rating?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

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
    await fetchFeedbacks();
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

const feedbacks = ref<ProductFeedback[]>([]);
const feedbacksLoading = ref(false);
const fetchFeedbacks = async () => {
  if (!process.client || !nuxtApp.$firebase?.db) return;
  feedbacksLoading.value = true;
  try {
    const db = nuxtApp.$firebase.db;
    const q = query(collection(db, 'transaction_feedbacks'), where('productId', '==', productId));
    const snap = await getDocs(q);
    feedbacks.value = snap.docs
      .map((d: any) => ({ id: d.id, ...d.data() }) as ProductFeedback)
      .sort((left, right) => {
        const leftTime = toDate(left.createdAt)?.getTime() || 0;
        const rightTime = toDate(right.createdAt)?.getTime() || 0;
        return rightTime - leftTime;
      });
  } catch (e) {
    feedbacks.value = [];
  } finally {
    feedbacksLoading.value = false;
  }
};

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  return new Date(value);
};

const formatDate = (value: any) => {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const normalizedRating = (value: number | undefined) => {
  if (!value) return 0;
  return Math.max(0, Math.min(5, Math.round(value)));
};

const averageRating = computed(() => {
  if (!feedbacks.value.length) return 0;
  const total = feedbacks.value.reduce((sum: number, feedback: ProductFeedback) => sum + normalizedRating(feedback.rating), 0);
  return total / feedbacks.value.length;
});

const ratingBreakdown = computed(() => {
  const counts = [5, 4, 3, 2, 1].map((rating) => {
    const count = feedbacks.value.filter((feedback: ProductFeedback) => normalizedRating(feedback.rating) === rating).length;
    const percent = feedbacks.value.length ? (count / feedbacks.value.length) * 100 : 0;
    return { rating, count, percent };
  });

  return counts;
});

const reviewerInitials = (feedback: ProductFeedback) => {
  const label = feedback.userName || feedback.userId || 'Anonymous';
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'AN';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
};

const reviewerName = (feedback: ProductFeedback) => feedback.userName || feedback.userId || 'Anonymous';

const starFillWidth = (rating: number) => `${(Math.max(0, Math.min(5, rating)) / 5) * 100}%`;

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

      <div class="product-reviews container" v-if="!loading && product">
        <div class="reviews-shell">
          <div class="reviews-heading">
            <div>
              <p class="section-eyebrow">Customer feedback</p>
              <h3 class="section-title">Reviews</h3>
            </div>
            <div v-if="feedbacks.length" class="reviews-count">{{ feedbacks.length }} review{{ feedbacks.length > 1 ? 's' : '' }}</div>
          </div>

          <div v-if="feedbacksLoading" class="loading reviews-loading">Loading reviews...</div>

          <template v-else-if="feedbacks.length">
            <div class="reviews-summary">
              <div class="summary-score-card">
                <div class="summary-score">{{ averageRating.toFixed(1) }}</div>
                <div class="summary-stars" :aria-label="`Average rating ${averageRating.toFixed(1)} out of 5`">
                  <div class="stars-base">★★★★★</div>
                  <div class="stars-fill" :style="{ width: starFillWidth(averageRating) }">★★★★★</div>
                </div>
                <p class="summary-caption">Based on verified customer feedback</p>
              </div>

              <div class="ratings-breakdown" aria-label="Rating distribution">
                <div v-for="item in ratingBreakdown" :key="item.rating" class="breakdown-row">
                  <span class="breakdown-label">{{ item.rating }}★</span>
                  <div class="breakdown-track">
                    <div class="breakdown-bar" :style="{ width: `${item.percent}%` }"></div>
                  </div>
                  <span class="breakdown-value">{{ item.count }}</span>
                </div>
              </div>
            </div>

            <ul class="reviews-list">
              <li v-for="fb in feedbacks" :key="fb.id" class="review-item">
                <div class="review-avatar">{{ reviewerInitials(fb) }}</div>
                <div class="review-content">
                  <div class="review-header">
                    <div>
                      <strong class="reviewer-name">{{ reviewerName(fb) }}</strong>
                      <div v-if="fb.createdAt" class="review-date">{{ formatDate(fb.createdAt) }}</div>
                    </div>
                    <div class="review-rating-wrap">
                      <div class="review-stars" :aria-label="`Rated ${normalizedRating(fb.rating)} out of 5`">
                        <div class="stars-base">★★★★★</div>
                        <div class="stars-fill" :style="{ width: starFillWidth(normalizedRating(fb.rating)) }">★★★★★</div>
                      </div>
                      <span class="rating-pill">{{ normalizedRating(fb.rating) }}.0</span>
                    </div>
                  </div>
                  <div class="review-message">{{ fb.message || 'No written feedback provided.' }}</div>
                </div>
              </li>
            </ul>
          </template>

          <div v-else class="reviews-empty">
            <div class="empty-icon review-empty-icon">★</div>
            <div class="empty-title">No reviews yet</div>
            <p class="empty-copy">This product has not received customer feedback yet.</p>
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

.product-reviews { max-width: 1200px; margin: 20px auto 0; padding: 0 24px 40px; }
.reviews-shell {
  background: linear-gradient(180deg, #ffffff 0%, #faf7ff 100%);
  border: 1px solid rgba(124, 58, 237, 0.08);
  border-radius: 28px;
  box-shadow: 0 18px 50px rgba(76, 29, 149, 0.08);
  padding: 28px;
}

.reviews-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.section-eyebrow {
  margin: 0 0 6px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 900;
}

.reviews-count {
  padding: 10px 14px;
  border-radius: 999px;
  background: #f3e8ff;
  color: #6d28d9;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.reviews-loading {
  padding: 40px 0;
}

.reviews-summary {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.summary-score-card {
  background: radial-gradient(circle at top, rgba(251, 191, 36, 0.22), transparent 55%), #1f1147;
  color: #fff;
  border-radius: 22px;
  padding: 24px;
}

.summary-score {
  font-size: 56px;
  line-height: 1;
  font-weight: 900;
}

.summary-stars,
.review-stars {
  position: relative;
  display: inline-block;
  letter-spacing: 0.22em;
  line-height: 1;
}

.summary-stars {
  margin: 12px 0 10px;
  font-size: 20px;
}

.review-stars {
  font-size: 14px;
}

.stars-base {
  color: rgba(255, 255, 255, 0.2);
}

.review-stars .stars-base {
  color: #ddd6fe;
}

.stars-fill {
  position: absolute;
  inset: 0 auto 0 0;
  overflow: hidden;
  color: #fbbf24;
  white-space: nowrap;
}

.summary-caption {
  margin: 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 13px;
}

.ratings-breakdown {
  display: grid;
  gap: 12px;
  align-content: center;
}

.breakdown-row {
  display: grid;
  grid-template-columns: 42px 1fr 28px;
  align-items: center;
  gap: 12px;
}

.breakdown-label,
.breakdown-value {
  font-size: 13px;
  font-weight: 700;
  color: #4b5563;
}

.breakdown-track {
  height: 10px;
  border-radius: 999px;
  background: #ede9fe;
  overflow: hidden;
}

.breakdown-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8b5cf6 0%, #f59e0b 100%);
}

.reviews-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 16px;
}

.review-item {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 16px;
  background: #fff;
  border: 1px solid rgba(124, 58, 237, 0.08);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.review-avatar {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.review-content {
  min-width: 0;
}

.review-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.reviewer-name {
  display: block;
  color: #111827;
  font-size: 16px;
}

.review-date {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
}

.review-rating-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.rating-pill {
  min-width: 48px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f3e8ff;
  color: #6d28d9;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

.review-message {
  color: #374151;
  line-height: 1.7;
}

.reviews-empty {
  padding: 20px 0 8px;
  text-align: center;
}

.review-empty-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #ede9fe 100%);
  color: #7c3aed;
}

.empty-copy {
  margin: 0;
  color: #6b7280;
}

@media (max-width: 900px) {
  .reviews-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .reviews-shell {
    padding: 22px 18px;
  }

  .reviews-heading,
  .review-header {
    flex-direction: column;
  }

  .review-item {
    grid-template-columns: 1fr;
  }

  .review-avatar {
    width: 48px;
    height: 48px;
    border-radius: 16px;
  }

  .review-rating-wrap {
    justify-content: space-between;
    width: 100%;
  }
}
</style>
