<template>
  <div class="transactions-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M7 11h0M7 7h0M12 15h6M12 11h6M12 7h6"/></svg>
        </div>
        <div>
          <h1 class="page-title">Transactions</h1>
          <p class="page-subtitle">View and track all orders across shops</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="state loading">
        <div class="spinner"></div>
        <p>Loading transactions...</p>
      </div>
      <div v-else-if="fetchError" class="state error">{{ fetchError }}</div>
      <template v-else-if="transactions.length">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Shop</th>
              <th>Customer Mobile</th>
              <th>Total</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in paginatedTransactions" :key="tx.id">
              <td>{{ formatDate(tx.createdAt) }}</td>
              <td>{{ shopMap[tx.store_id] || tx.store_id || '-' }}</td>
              <td>{{ tx.customer_mobile || '-' }}</td>
              <td>{{ formatTotal(tx) }}</td>
              <td>{{ tx.payment_method || '-' }}</td>
              <td>
                <template v-if="canManageStatuses">
                  <select class="status-select" :value="tx.status || 'pending'" @change="handleStatusChange($event, tx)">
                    <option v-for="status in statusList" :key="status.slug" :value="status.slug">
                      {{ status.name || displayStatus(status.slug) }}
                    </option>
                  </select>
                </template>
                <span v-else class="badge" :class="statusClass(tx.status)">
                  <span class="dot"></span>
                  {{ displayStatus(tx.status) }}
                </span>
              </td>
              <td class="actions">
                <button
                  class="btn-action feedback"
                  :title="(tx.status || '').toLowerCase() === 'completed' ? 'Feedback' : 'Feedback available only for completed orders'"
                  :disabled="(tx.status || '').toLowerCase() !== 'completed'"
                  @click="openFeedbackModal(tx)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg>
                  <span>Feedback</span>
                </button>
                <button class="btn-icon view" title="View" @click="viewTransaction(tx)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-icon cancel" title="Cancel" :disabled="!isCancellable(tx)" @click="cancelTransaction(tx)">
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
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M7 11h0M7 7h0M12 15h6M12 11h6M12 7h6"/></svg>
        </div>
        <p class="empty-title">No transactions yet</p>
        <p class="empty-desc">Orders will appear here once customers start checking out.</p>
      </div>
    </div>

    <div v-if="showViewModal" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Transaction Details</h3>
          <button class="close-btn" @click="closeViewModal">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedTransaction">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Order Number</span>
              <span class="detail-value">{{ selectedTransaction.order_number || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date & Time</span>
              <span class="detail-value">{{ formatDate(selectedTransaction.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <div class="detail-value">
                <template v-if="canManageStatuses">
                  <select class="status-select" :value="selectedTransaction.status || 'pending'" @change="handleStatusChange($event, selectedTransaction)">
                    <option v-for="status in statusList" :key="status.slug" :value="status.slug">
                      {{ status.name || displayStatus(status.slug) }}
                    </option>
                  </select>
                </template>
                <span v-else class="badge" :class="statusClass(selectedTransaction.status)">
                  <span class="dot"></span>
                  {{ displayStatus(selectedTransaction.status) }}
                </span>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-label">Payment Method</span>
              <span class="detail-value">{{ selectedTransaction.payment_method || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Delivery Method</span>
              <span class="detail-value">{{ selectedTransaction.delivery_method || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Customer Mobile</span>
              <span class="detail-value">{{ selectedTransaction.customer_mobile || '-' }}</span>
            </div>
            <div class="detail-item full">
              <span class="detail-label">Customer Note</span>
              <span class="detail-value">{{ selectedTransaction.customer_note || '-' }}</span>
            </div>
            <div class="detail-item full">
              <span class="detail-label">Delivery Address</span>
              <span class="detail-value">{{ selectedTransaction.delivery_location?.address || '-' }}</span>
            </div>
            <div class="detail-item full">
              <span class="detail-label">Store Location</span>
              <a class="detail-value map-link" :href="mapUrl(selectedTransaction.store_location)" target="_blank" rel="noopener">
                {{ shopMap[selectedTransaction.store_id] || 'Store' }} — Show Drive Map
              </a>
            </div>
            <div class="detail-item full">
              <span class="detail-label">User Location</span>
              <a class="detail-value map-link" :href="mapUrl(selectedTransaction.user_location)" target="_blank" rel="noopener">
                Receiver — Show Drive Map
              </a>
            </div>
          </div>

          <div class="section-title">Items</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in selectedTransaction.items" :key="idx">
                <td>
                  <NuxtLink v-if="item.product_id" :to="'/items/' + item.product_id" class="product-link">{{ item.name || '-' }}</NuxtLink>
                  <span v-else>{{ item.name || '-' }}</span>
                </td>
                <td>{{ formatMoney(item.price) }}</td>
                <td>{{ item.qty ?? 1 }}</td>
                <td>{{ formatMoney(item.subtotal) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>{{ formatMoney(selectedTransaction.subtotal) }}</span>
            </div>
            <div class="total-row">
              <span>Delivery Charge</span>
              <span>{{ formatMoney(selectedTransaction.delivery_charge) }}</span>
            </div>
            <div class="total-row grand">
              <span>Total</span>
              <span>{{ formatTotal(selectedTransaction) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showFeedbackModal" class="modal-overlay" @click.self="closeFeedbackModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Submit Feedback</h3>
          <button class="close-btn" @click="closeFeedbackModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item full">
              <span class="detail-label">Transaction</span>
              <span class="detail-value">{{ selectedTransactionForFeedback?.order_number || 'Unknown' }}</span>
            </div>
            <div class="detail-item full">
              <span class="detail-label">Shop</span>
              <span class="detail-value">{{ shopMap[selectedTransactionForFeedback?.store_id || ''] || selectedTransactionForFeedback?.store_id || '-' }}</span>
            </div>
            <div class="detail-item full">
              <span class="detail-label">Product</span>
              <div class="detail-value">
                <template v-if="selectedTransactionForFeedback?.items?.length">
                  <select class="status-select" v-model="feedbackProductId">
                    <option
                      v-for="(item, idx) in selectedTransactionForFeedback.items"
                      :key="idx"
                      :value="item.product_id"
                      :disabled="feedbackedProductIds.includes(item.product_id)"
                    >
                      {{ (item.name || ('Item ' + (idx + 1))) + (feedbackedProductIds.includes(item.product_id) ? ' — Submitted' : '') }}
                    </option>
                  </select>
                </template>
                <div v-else>Unknown product</div>
              </div>
            </div>
            <div class="detail-item full">
              <span class="detail-label">Rating</span>
              <div class="rating-stars">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  class="star"
                  :class="{ active: feedbackRating >= n }"
                  @click="feedbackRating = n"
                  :aria-label="`${n} Star`"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="detail-item full">
              <span class="detail-label">Message</span>
              <textarea class="input" v-model="feedbackMessage" rows="4" placeholder="Write your feedback..."></textarea>
            </div>
          </div>

          <div v-if="feedbackError" class="field-error">{{ feedbackError }}</div>
          <div v-if="feedbackSuccess" class="empty-title" style="color:#15803d;">{{ feedbackSuccess }}</div>

          <button class="complete-btn" type="button" :disabled="isSubmittingFeedback || allItemsFeedbacked" @click="submitFeedback">
            <span v-if="!isSubmittingFeedback">Submit Feedback</span>
            <span v-else>Sending...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addDoc, collection, doc, documentId, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';

interface Transaction {
  id: string;
  order_number?: string;
  user_id?: string;
  store_id?: string;
  user_location?: { latitude?: number; longitude?: number };
  store_location?: { latitude?: number; longitude?: number };
  delivery_location?: { latitude?: number; longitude?: number; address?: string };
  delivery_method?: string;
  payment_method?: string;
  items?: any[];
  subtotal?: number;
  delivery_charge?: number;
  total?: number;
  currency?: string;
  customer_mobile?: string;
  customer_note?: string;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
}

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ssr: false,
});

useHead({ title: 'Transactions | My Near Shops' });

const nuxtApp = useNuxtApp() as any;
const db = nuxtApp.$firebase?.db;
const authStore = useAuthStore();

const transactions = ref<Transaction[]>([]);
const loading = ref(true);
const fetchError = ref('');
const shopMap = ref<Record<string, string>>({});

const userLat = ref<number | null>(null);
const userLng = ref<number | null>(null);

const getUserLocation = () => {
  if (!process.client || !navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => { userLat.value = pos.coords.latitude; userLng.value = pos.coords.longitude; },
    () => { /* silently ignore */ }
  );
};

const perPage = 20;
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(transactions.value.length / perPage) || 1);
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return transactions.value.slice(start, start + perPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  return new Date(value);
};

const formatDate = (value: any) => {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatTotal = (tx: Transaction) => {
  if (tx.total == null) return '-';
  const currency = tx.currency || 'PHP';
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(tx.total);
  } catch {
    return `₱${tx.total.toFixed(2)}`;
  }
};

const statusClass = (status?: string) => {
  const s = (status || 'pending').toLowerCase();
  if (s === 'completed' || s === 'delivered') return 'badge-success';
  if (s === 'cancelled' || s === 'failed') return 'badge-inactive';
  return 'badge-warning';
};

const formatMoney = (value?: number) => {
  if (value == null) return '-';
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
  } catch {
    return `₱${value.toFixed(2)}`;
  }
};

const mapUrl = (location?: { latitude?: number; longitude?: number }) => {
  if (location?.latitude == null || location?.longitude == null) return '#';
  const originParam = userLat.value != null && userLng.value != null ? `origin=${userLat.value},${userLng.value}&` : '';
  return `https://www.google.com/maps/dir/?api=1&${originParam}destination=${location.latitude},${location.longitude}&travelmode=two-wheeler&dir_action=navigate`;
};

const humanize = (str: string) => str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const statusList = ref<any[]>([]);
const statusMap = computed(() => Object.fromEntries(statusList.value.map((s: any) => [s.slug, s])));
const canManageStatuses = computed(() => {
  const roleId = authStore.user?.roleId || '';
  return ['super-admin', 'store-admin', 'store-staff'].includes(roleId);
});

const displayStatus = (status?: string) => {
  if (!status) return 'Pending';
  return statusMap.value[status]?.name || humanize(status);
};

const isCancellable = (tx: Transaction) => {
  if (tx.status?.toLowerCase() === 'cancelled') return false;
  const created = toDate(tx.createdAt);
  if (!created) return false;
  return Date.now() - created.getTime() < 30 * 60 * 1000;
};

const updateTransactionStatus = async (tx: Transaction | null, status: string) => {
  if (!tx?.id || !status || !canManageStatuses.value) return;
  const previousStatus = tx.status;
  try {
    if (!db) throw new Error('Firebase is not available.');
    tx.status = status;
    await updateDoc(doc(db, 'transactions', tx.id), { status, updatedAt: serverTimestamp() });
  } catch (e: any) {
    tx.status = previousStatus;
    fetchError.value = e?.message || 'Failed to update transaction status.';
  }
};

const handleStatusChange = (event: Event, tx: Transaction | null) => {
  const target = event.target as HTMLSelectElement | null;
  if (!target || !tx) return;
  void updateTransactionStatus(tx, target.value);
};

const selectedTransaction = ref<Transaction | null>(null);
const showViewModal = ref(false);
const selectedTransactionForFeedback = ref<Transaction | null>(null);
const showFeedbackModal = ref(false);
const feedbackProductId = ref('');
const feedbackMessage = ref('');
const feedbackRating = ref(5);
const feedbackError = ref('');
const feedbackSuccess = ref('');
const isSubmittingFeedback = ref(false);
const feedbackedProductIds = ref<string[]>([]);
const allItemsFeedbacked = computed(() => {
  const items = selectedTransactionForFeedback.value?.items || [];
  if (!items.length) return false;
  return items.every((it: any) => feedbackedProductIds.value.includes(it.product_id));
});

const viewTransaction = (tx: Transaction) => {
  selectedTransaction.value = tx;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedTransaction.value = null;
};

const openFeedbackModal = async (tx: Transaction) => {
  selectedTransactionForFeedback.value = tx;
  feedbackMessage.value = '';
  feedbackRating.value = 5;
  feedbackError.value = '';
  feedbackSuccess.value = '';
  feedbackedProductIds.value = [];

  if (db && tx?.id) {
    try {
      const q = query(collection(db, 'transaction_feedbacks'), where('transactionId', '==', tx.id));
      const snap = await getDocs(q);
      feedbackedProductIds.value = snap.docs.map((d: any) => d.data().productId).filter(Boolean);
    } catch (e) {
      // ignore fetch errors for now
      feedbackedProductIds.value = [];
    }
  }

  // choose first non-submitted product if available
  const firstAvailable = tx.items?.find((it: any) => !feedbackedProductIds.value.includes(it.product_id))?.product_id;
  feedbackProductId.value = firstAvailable || tx.items?.[0]?.product_id || '';
  showFeedbackModal.value = true;
};

const closeFeedbackModal = () => {
  showFeedbackModal.value = false;
  selectedTransactionForFeedback.value = null;
  feedbackProductId.value = '';
  feedbackMessage.value = '';
  feedbackRating.value = 5;
  feedbackError.value = '';
  feedbackSuccess.value = '';
};

const submitFeedback = async () => {
  feedbackError.value = '';
  feedbackSuccess.value = '';
  const tx = selectedTransactionForFeedback.value;
  if (!tx) {
    feedbackError.value = 'No transaction selected.';
    return;
  }
  if (!db) {
    feedbackError.value = 'Firebase is not available.';
    return;
  }
  if (!feedbackProductId.value) {
    feedbackError.value = 'Select a product for feedback.';
    return;
  }
  if (feedbackedProductIds.value.includes(feedbackProductId.value)) {
    feedbackError.value = 'Feedback already submitted for this product.';
    return;
  }
  if (!tx.store_id) {
    feedbackError.value = 'Unable to determine store for this transaction.';
    return;
  }

  isSubmittingFeedback.value = true;
  try {
    await addDoc(collection(db, 'transaction_feedbacks'), {
      transactionId: tx.id,
      productId: feedbackProductId.value,
      shopId: tx.store_id,
      message: feedbackMessage.value.trim(),
      rating: feedbackRating.value,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    feedbackSuccess.value = 'Feedback submitted successfully.';
    setTimeout(() => {
      closeFeedbackModal();
    }, 1200);
  } catch (e: any) {
    feedbackError.value = e?.message || 'Failed to submit feedback.';
  } finally {
    isSubmittingFeedback.value = false;
  }
};

const cancelTransaction = async (tx: Transaction) => {
  if (!isCancellable(tx)) return;
  try {
    if (!db) throw new Error('Firebase is not available.');
    await updateDoc(doc(db, 'transactions', tx.id), { status: 'cancelled', updatedAt: serverTimestamp() });
    tx.status = 'cancelled';
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to cancel transaction.';
  }
};

const getShopMapByIds = async (shopIds: string[]) => {
  const uniqueIds = [...new Set(shopIds.filter(Boolean))] as string[];
  if (!uniqueIds.length) return {} as Record<string, string>;

  const chunks: string[][] = [];
  for (let i = 0; i < uniqueIds.length; i += 30) {
    chunks.push(uniqueIds.slice(i, i + 30));
  }

  const shopSnaps = await Promise.all(
    chunks.map(ids => getDocs(query(collection(db, 'shops'), where(documentId(), 'in', ids))))
  );

  return Object.fromEntries(
    shopSnaps.flatMap((snap: any) => snap.docs.map((d: any) => [d.id, d.data().name || d.id]))
  ) as Record<string, string>;
};

const fetchTransactions = async () => {
  loading.value = true;
  fetchError.value = '';
  try {
    if (!db) throw new Error('Firebase is not available.');
    const uid = authStore.user?.uid || '';
    const roleId = authStore.user?.roleId || '';

    let shopIdFilter: string[] | null = null;
    const isCustomer = roleId === 'customer';
    const isStoreAdmin = roleId === 'store-admin';

    const statusSnap = await getDocs(collection(db, 'transaction_statuses'));
    statusList.value = statusSnap.docs.map((d: any) => d.data());

    let fetched: Transaction[] = [];

    if (isCustomer) {
      const txSnap = await getDocs(query(collection(db, 'transactions'), where('user_id', '==', uid)));
      fetched = txSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Transaction));
    } else if (isStoreAdmin) {
      const ownerShopsSnap = await getDocs(query(collection(db, 'shops'), where('ownerId', '==', uid)));
      const ownerShopIds = ownerShopsSnap.docs.map((d: any) => d.id).filter(Boolean);

      const membersSnap = await getDocs(query(collection(db, 'shopMembers'), where('uid', '==', uid)));
      const memberShopIds = membersSnap.docs.map((d: any) => d.data().shopId).filter(Boolean);

      const allowedShopIds = [...new Set([...ownerShopIds, ...memberShopIds])];
      if (allowedShopIds.length) {
        const chunks: string[][] = [];
        for (let i = 0; i < allowedShopIds.length; i += 30) {
          chunks.push(allowedShopIds.slice(i, i + 30));
        }
        const txSnaps = await Promise.all(
          chunks.map(ids => getDocs(query(collection(db, 'transactions'), where('store_id', 'in', ids))))
        );
        fetched = txSnaps.flatMap((snap: any) => snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Transaction)));
        shopMap.value = await getShopMapByIds(allowedShopIds);
      } else {
        fetched = [];
        shopMap.value = {};
      }
    } else if (roleId === 'store-staff') {
      const membersSnap = await getDocs(query(collection(db, 'shopMembers'), where('uid', '==', uid)));
      shopIdFilter = membersSnap.docs.map((d: any) => d.data().shopId).filter(Boolean);
      if (shopIdFilter.length) {
        const chunks: string[][] = [];
        for (let i = 0; i < shopIdFilter.length; i += 30) {
          chunks.push(shopIdFilter.slice(i, i + 30));
        }
        const txSnaps = await Promise.all(
          chunks.map(ids => getDocs(query(collection(db, 'transactions'), where('store_id', 'in', ids))))
        );
        fetched = txSnaps.flatMap((snap: any) => snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Transaction)));
      } else {
        fetched = [];
      }
    } else if (roleId === 'store-delivery') {
      const membersSnap = await getDocs(query(collection(db, 'shopMembers'), where('uid', '==', uid)));
      shopIdFilter = membersSnap.docs.map((d: any) => d.data().shopId).filter(Boolean);
      const txSnap = await getDocs(collection(db, 'transactions'));
      fetched = txSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Transaction));
      if (shopIdFilter) {
        fetched = fetched.filter(tx => tx.store_id && shopIdFilter!.includes(tx.store_id));
      }
    } else {
      const txSnap = await getDocs(collection(db, 'transactions'));
      fetched = txSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Transaction));
    }

    if (isCustomer) {
      // Only fetch the shops referenced by the customer's own transactions
      const storeIds = [...new Set(fetched.map(tx => tx.store_id).filter(Boolean))] as string[];
      if (storeIds.length) {
        shopMap.value = await getShopMapByIds(storeIds);
      } else {
        shopMap.value = {};
      }
    } else if (!isStoreAdmin) {
      const shopSnap = await getDocs(collection(db, 'shops'));
      shopMap.value = Object.fromEntries(shopSnap.docs.map((d: any) => [d.id, d.data().name || d.id]));
    }
    fetched.sort((a, b) => {
      const da = toDate(a.createdAt)?.getTime() || 0;
      const db = toDate(b.createdAt)?.getTime() || 0;
      return db - da;
    });
    transactions.value = fetched;
    currentPage.value = 1;
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load transactions.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getUserLocation();
  fetchTransactions();
});
</script>

<style scoped>
.transactions-page { max-width: 1200px; margin: 0 auto; }
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
.order-id { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600; color: #0f172a; }
.badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-success .dot { background: #22c55e; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-warning .dot { background: #f59e0b; }
.badge-inactive { background: #f1f5f9; color: #64748b; }
.badge-inactive .dot { background: #94a3b8; }
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #fff; }
.page-info { font-size: 14px; color: #64748b; font-weight: 600; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
.btn-ghost { padding: 10px 18px; background: #f1f5f9; color: #475569; }
.btn-ghost:hover { background: #e2e8f0; }
.actions { text-align: right; white-space: nowrap; }
.btn-icon { width: 34px; height: 34px; border-radius: 10px; background: none; border: 1px solid transparent; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; margin-left: 6px; }
.btn-icon:hover { transform: translateY(-1px); }
.btn-icon:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-icon.view { color: #4f46e5; }
.btn-icon.view:hover { background: #eef2ff; border-color: #c7d2fe; }
.btn-icon.cancel { color: #ef4444; }
.btn-icon.cancel:hover { background: #fef2f2; border-color: #fecaca; }
.btn-action { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; margin-left: 6px; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-action.view { color: #4f46e5; background: #eef2ff; border-color: #c7d2fe; }
.btn-action.view:hover { background: #e0e7ff; }
.btn-action.cancel { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.btn-action.cancel:hover { background: #fee2e2; }
.btn-action.feedback { color: #0f766e; background: #ccfbf1; border-color: #99f6e4; }
.btn-action.feedback:hover { background: #99f6e4; }
.modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; background: #fff; border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; }
.modal-body { padding: 24px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item.full { grid-column: span 2; }
.detail-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 14px; font-weight: 600; color: #0f172a; }
.status-select { width: 100%; min-width: 180px; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; color: #0f172a; font-size: 14px; font-weight: 600; }
.status-select:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
.rating-stars { display: flex; gap: 10px; align-items: center; }
.rating-stars .star { background: transparent; border: none; padding: 4px; cursor: pointer; color: #cbd5e1; transition: color 0.2s ease; display: inline-flex; align-items: center; justify-content: center; }
.rating-stars .star:hover,
.rating-stars .star:focus { color: #fbbf24; outline: none; }
.rating-stars .star.active { color: #f59e0b; }
.rating-stars .star svg { display: block; }
  .complete-btn {
    width: 100%;
    padding: 14px 18px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    cursor: pointer;
    box-shadow: 0 18px 40px rgba(79, 70, 229, 0.18);
    transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .complete-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  }
  .complete-btn:disabled {
    cursor: not-allowed;
    opacity: 0.72;
    box-shadow: none;
    background: #c7d2fe;
  }
.map-link { color: #4f46e5; text-decoration: none; }
.map-link:hover { text-decoration: underline; }
.section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
.items-table th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.items-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
.product-link { color: #4f46e5; text-decoration: none; font-weight: 600; }
.product-link:hover { text-decoration: underline; }
.totals { border-top: 1px solid #f1f5f9; padding-top: 16px; }
.total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #475569; }
.total-row.grand { font-size: 16px; font-weight: 800; color: #0f172a; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 8px; }
@media (max-width: 640px) {
  .data-table { display: block; overflow-x: auto; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
