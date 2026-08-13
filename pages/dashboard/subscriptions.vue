<template>
  <div class="subscriptions-page">
    <div class="page-header">
      <div class="header-copy">
        <p class="eyebrow">Plans</p>
        <h1 class="page-title">Subscriptions</h1>
        <p class="page-subtitle">Choose the plan that fits your shop operations and keep track of your current access.</p>
      </div>
      <div class="status-chip" :class="`status-${subscriptionStatusTone}`">
        {{ currentSubscription ? displayStatus(currentSubscription.status) : 'No active subscription' }}
      </div>
    </div>

    <div v-if="loading" class="state loading">
      <div class="spinner"></div>
      <p>Loading subscription details...</p>
    </div>

    <div v-else class="content-stack">
      <div v-if="fetchError" class="state error">{{ fetchError }}</div>

      <section class="current-card">
        <div class="current-card-copy">
          <p class="section-kicker">Current subscription</p>
          <h2>{{ currentPlan?.name || 'Free Plan' }}</h2>
          <p>
            {{ currentPlan?.description || subscriptionPlans[0].description }}
          </p>
        </div>

        <div class="current-meta-grid">
          <div class="meta-card">
            <span class="meta-label">Plan ID</span>
            <strong>{{ currentSubscription?.planId || 'free' }}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">Status</span>
            <strong>{{ currentSubscription ? displayStatus(currentSubscription.status) : 'Available' }}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">Started</span>
            <strong>{{ currentSubscription?.startedAt ? formatDate(currentSubscription.startedAt) : 'Not started' }}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">Expires</span>
            <strong>{{ currentSubscription?.expiresAt ? formatDate(currentSubscription.expiresAt) : 'No expiry' }}</strong>
          </div>
        </div>
      </section>

      <section class="upgrade-card">
        <div class="upgrade-head">
          <div>
            <p class="section-kicker">Upgrade</p>
            <h2>Set your plan end date</h2>
          </div>
        </div>

        <div class="upgrade-grid">
          <label class="field">
            <span class="field-label">Selected plan</span>
            <select v-model="selectedPlanId" class="field-input">
              <option v-for="plan in subscriptionPlans" :key="plan.id" :value="plan.id">{{ plan.name }}</option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">End date</span>
            <input v-model="billingEndDate" type="date" class="field-input" />
          </label>
        </div>

        <div class="calc-panel">
          <div class="calc-item">
            <span>Monthly price</span>
            <strong>{{ selectedPlan?.priceLabel || 'Free' }}</strong>
          </div>
          <div class="calc-item">
            <span>Billing months</span>
            <strong>{{ billingMonths }}</strong>
          </div>
          <div class="calc-item total">
            <span>Total amount</span>
            <strong>{{ formatMoney(totalAmount) }}</strong>
          </div>
        </div>

        <p class="calc-note">Computation: {{ selectedPlan?.name || 'Plan' }} at {{ formatMoney(selectedPlan?.price || 0) }} per month x {{ billingMonths }} month{{ billingMonths > 1 ? 's' : '' }}.</p>

        <div v-if="actionError" class="action-error">{{ actionError }}</div>
        <div v-if="actionMessage" class="action-success">{{ actionMessage }}</div>

        <button class="apply-btn" :disabled="isSubmitting || !canSubmit" @click="startUpgradePayment">
          <span v-if="!isSubmitting">Apply Subscription</span>
          <span v-else>Saving...</span>
        </button>
      </section>
      
      <section class="plans-section">
        <div class="section-head">
          <div>
            <p class="section-kicker">Subscription plans</p>
            <h2>Compare your options</h2>
          </div>
        </div>

        <div class="plans-grid">
          <article
            v-for="plan in subscriptionPlans"
            :key="plan.id"
            class="plan-card"
            :class="{
              featured: plan.id === 'premium',
              current: currentSubscription?.planId === plan.id || (!currentSubscription && plan.id === 'free')
            }"
          >
            <div class="plan-badge-row">
              <span class="plan-tier">{{ plan.badge }}</span>
              <span v-if="currentSubscription?.planId === plan.id || (!currentSubscription && plan.id === 'free')" class="current-pill">Current</span>
            </div>
            <h3>{{ plan.name }}</h3>
            <div class="plan-price">{{ plan.priceLabel }}</div>
            <p class="plan-description">{{ plan.description }}</p>
            <ul class="feature-list">
              <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
            </ul>
            <button
              class="plan-select-btn"
              :class="{ selected: selectedPlanId === plan.id }"
              @click="selectedPlanId = plan.id"
            >
              {{ selectedPlanId === plan.id ? 'Selected' : `Select ${plan.name}` }}
            </button>
          </article>
        </div>
      </section>

      
    </div>

    <div v-if="showPaymentModal" class="payment-modal-overlay" @click.self="closePaymentModal">
      <div class="payment-modal-card">
        <div class="payment-modal-header">
          <h3>GCash Payment</h3>
          <button class="payment-close-btn" @click="closePaymentModal">&times;</button>
        </div>
        <div class="payment-modal-body">
          <img :src="gcashImage" alt="GCash QR" class="payment-qr-image" />
          <p class="payment-caption">Scan to pay.</p>
          <p class="payment-total">Amount: {{ formatMoney(totalAmount) }}</p>
          <div class="proof-grid">
            <label class="field">
              <span class="field-label">Reference No.</span>
              <input
                v-model="referenceNo"
                type="text"
                class="field-input"
                placeholder="Enter payment reference number"
              />
            </label>

            <label class="field">
              <span class="field-label">Upload screenshot</span>
              <input
                type="file"
                class="field-input"
                accept="image/*"
                @change="onPaymentScreenshotChange"
              />
            </label>
          </div>

          <p v-if="paymentScreenshotFile" class="payment-proof-file">Selected file: {{ paymentScreenshotFile.name }}</p>
          <p class="payment-proof-note">Add either Reference No. or screenshot to proceed.</p>
          <p v-if="proofValidationError" class="action-error">{{ proofValidationError }}</p>

          <button
            class="confirm-payment-btn"
            :disabled="isSubmitting || !hasPaymentProof || !hasRemainingWeeklySubmissions"
            @click="confirmPaymentAndCreateSubscription"
          >
            <span v-if="!isSubmitting">Confirm Payment</span>
            <span v-else>Saving...</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showPlanLimitModal" class="plan-limit-modal-overlay" @click.self="closePlanLimitModal">
      <div class="plan-limit-modal-card">
        <div class="plan-limit-header">
          <div>
            <p class="section-kicker">Upgrade Required</p>
            <h3>Shop Limit Reached</h3>
          </div>
          <button class="payment-close-btn" @click="closePlanLimitModal">&times;</button>
        </div>
        <div class="plan-limit-body">
          <p class="plan-limit-message">{{ planLimitModalMessage }}</p>
          <button class="apply-btn" @click="closePlanLimitModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Timestamp, addDoc, collection, getDocs, query, serverTimestamp, where } from '~/utils/firestoreLogger';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import gcashImage from '~/assets/images/gCash.jpg';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ssr: false,
});

useHead({ title: 'Subscriptions | My Near Shops' });

type SubscriptionPlanId = 'free' | 'basic' | 'premium';

type SubscriptionRecord = {
  id: string;
  userId: string;
  planId: SubscriptionPlanId;
  status: string;
  startedAt?: unknown;
  expiresAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  clientCreatedAt?: number;
  referenceNo?: string | null;
  screenshotUrl?: string | null;
  screenshotPath?: string | null;
  screenshotName?: string | null;
};

type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  badge: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  sortOrder: number;
  isActive: boolean;
};

const planOrder: SubscriptionPlanId[] = ['free', 'basic', 'premium'];

const planUiMeta: Record<SubscriptionPlanId, { badge: string; features: string[]; defaultDescription: string }> = {
  free: {
    badge: 'Starter',
    defaultDescription: 'A lightweight plan for trying out the dashboard and managing a small catalog.',
    features: ['Basic shop profile', 'Core product listing', 'Manual order monitoring'],
  },
  basic: {
    badge: 'Growth',
    defaultDescription: 'For growing stores that need better visibility and smoother daily operations.',
    features: ['Expanded product capacity', 'Priority listing placement', 'Sales tracking overview'],
  },
  premium: {
    badge: 'Best Value',
    defaultDescription: 'Full access for active shops that want more reach, insight, and support.',
    features: ['Unlimited product listings', 'Advanced dashboard insights', 'Priority support and onboarding'],
  },
};

const formatPriceLabel = (value: unknown) => {
  const price = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(price) || price <= 0) return 'Free';
  return `₱${price.toLocaleString()} / month`;
};

const createPlan = (id: SubscriptionPlanId, data?: Partial<Record<string, unknown>>): SubscriptionPlan => {
  const meta = planUiMeta[id];
  const numericPrice = typeof data?.price === 'number' ? data.price : Number(data?.price);
  const price = Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : 0;
  return {
    id,
    name: String(data?.name || id.charAt(0).toUpperCase() + id.slice(1)),
    badge: meta.badge,
    price,
    priceLabel: formatPriceLabel(price),
    description: String(data?.description || meta.defaultDescription),
    features: meta.features,
    sortOrder: Number(data?.sort_order) || planOrder.indexOf(id) + 1,
    isActive: data?.is_active === false ? false : true,
  };
};

const isPlanId = (value: string): value is SubscriptionPlanId => planOrder.includes(value as SubscriptionPlanId);

const subscriptionPlans = ref<SubscriptionPlan[]>(planOrder.map((id) => createPlan(id)));

const nuxtApp = useNuxtApp() as any;
const authStore = useAuthStore();
const route = useRoute();
const loading = ref(true);
const fetchError = ref('');
const currentSubscription = ref<SubscriptionRecord | null>(null);
const selectedPlanId = ref<SubscriptionPlanId>('free');
const billingEndDate = ref('');
const isSubmitting = ref(false);
const actionError = ref('');
const actionMessage = ref('');
const showPaymentModal = ref(false);
const referenceNo = ref('');
const paymentScreenshotFile = ref<File | null>(null);
const proofValidationError = ref('');
const submissionLimitError = ref('');
const weeklySubmissionCount = ref(0);
const showPlanLimitModal = ref(false);
const planLimitModalMessage = ref('');

const MAX_WEEKLY_SUBMISSIONS = 3;

const isStoreAdmin = computed(() => {
  const roleId = String(authStore.user?.roleId || '').toLowerCase().replace(/[_\s]+/g, '-');
  const role = String(authStore.user?.role || '').toLowerCase().replace(/[_\s]+/g, '-');
  return roleId === 'store-admin' || role === 'store-admin';
});

const todayAtMidnight = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const toInputDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseInputDate = (value: string) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const calculateBillingMonths = (startDate: Date, endDate: Date) => {
  if (endDate.getTime() <= startDate.getTime()) return 0;

  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  const anchor = new Date(startDate);
  anchor.setMonth(anchor.getMonth() + months);

  if (anchor.getTime() < endDate.getTime()) {
    months += 1;
  }

  return Math.max(1, months);
};

const formatMoney = (value: number) => {
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0);
  } catch {
    return `₱${(value || 0).toFixed(2)}`;
  }
};

const currentPlan = computed(() => {
  const activePlanId = currentSubscription.value?.planId || 'free';
  return subscriptionPlans.value.find((plan: SubscriptionPlan) => plan.id === activePlanId) || subscriptionPlans.value[0];
});

const selectedPlan = computed(() => {
  return subscriptionPlans.value.find((plan: SubscriptionPlan) => plan.id === selectedPlanId.value) || subscriptionPlans.value[0];
});

const billingMonths = computed(() => {
  const endDate = parseInputDate(billingEndDate.value);
  if (!endDate) return 0;
  return calculateBillingMonths(todayAtMidnight(), endDate);
});

const totalAmount = computed(() => {
  const monthlyPrice = selectedPlan.value?.price || 0;
  return monthlyPrice * billingMonths.value;
});

const canSubmit = computed(() => {
  return Boolean(selectedPlan.value) && selectedPlan.value.id !== 'free' && billingMonths.value > 0;
});

const hasPaymentProof = computed(() => {
  return Boolean(referenceNo.value.trim()) || Boolean(paymentScreenshotFile.value);
});

const remainingWeeklySubmissions = computed(() => {
  return Math.max(0, MAX_WEEKLY_SUBMISSIONS - weeklySubmissionCount.value);
});

const hasRemainingWeeklySubmissions = computed(() => remainingWeeklySubmissions.value > 0);

const submissionLimitNote = computed(() => {
  return `Maximum ${MAX_WEEKLY_SUBMISSIONS} submissions per week. Remaining this week: ${remainingWeeklySubmissions.value}.`;
});

const subscriptionStatusTone = computed(() => {
  const status = (currentSubscription.value?.status || '').toLowerCase();
  if (status === 'active') return 'active';
  if (status === 'expired') return 'expired';
  if (status === 'cancelled') return 'cancelled';
  return 'idle';
});

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === 'number' || typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const formatDate = (value: unknown) => {
  const date = toDate(value);
  if (!date) return 'Not available';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const displayStatus = (value: string) => {
  if (!value) return 'Unknown';
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const fetchSubscriptionPlans = async () => {
  if (!nuxtApp.$firebase?.db) return;

  const db = nuxtApp.$firebase.db;
  const snapshot = await getDocs(collection(db, 'subscriptionPlans'));
  const plansFromDb = snapshot.docs
    .map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const rawId = String(data.slug || doc.id || '').toLowerCase();
      if (!isPlanId(rawId)) return null;
      return createPlan(rawId, data);
    })
    .filter((plan): plan is SubscriptionPlan => plan !== null)
    .filter((plan: SubscriptionPlan) => plan.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (plansFromDb.length) {
    subscriptionPlans.value = plansFromDb;
  }
};

const fetchSubscription = async () => {
  if (!nuxtApp.$firebase?.db || !authStore.user?.uid) return;

  const db = nuxtApp.$firebase.db;
  const subscriptionsQuery = query(
    collection(db, 'subscriptions'),
    where('userId', '==', authStore.user.uid)
  );

  const snapshot = await getDocs(subscriptionsQuery);
  if (snapshot.empty) {
    currentSubscription.value = null;
    return;
  }

  const latest = snapshot.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<SubscriptionRecord, 'id'>) }))
    .sort((a, b) => {
      const aTime =
        toDate(a.updatedAt)?.getTime() ||
        toDate(a.createdAt)?.getTime() ||
        Number(a.clientCreatedAt || 0);
      const bTime =
        toDate(b.updatedAt)?.getTime() ||
        toDate(b.createdAt)?.getTime() ||
        Number(b.clientCreatedAt || 0);
      return bTime - aTime;
    })[0];

  currentSubscription.value = latest as SubscriptionRecord;
};

const getWeekStart = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - now.getDay());
  return start;
};

const refreshWeeklySubmissionCount = async () => {
  if (!nuxtApp.$firebase?.db || !authStore.user?.uid) {
    weeklySubmissionCount.value = 0;
    return;
  }

  const db = nuxtApp.$firebase.db;
  const startOfWeek = getWeekStart();
  const weeklyQuery = query(
    collection(db, 'subscriptions'),
    where('userId', '==', authStore.user.uid),
    where('createdAt', '>=', Timestamp.fromDate(startOfWeek))
  );
  const snapshot = await getDocs(weeklyQuery);
  weeklySubmissionCount.value = snapshot.size;
};

const fetchPageData = async () => {
  loading.value = true;
  fetchError.value = '';

  if (!isStoreAdmin.value) {
    loading.value = false;
    fetchError.value = 'Subscriptions are only available for Store Admin accounts.';
    await navigateTo('/dashboard');
    return;
  }

  try {
    await Promise.all([fetchSubscriptionPlans(), fetchSubscription(), refreshWeeklySubmissionCount()]);

    if (currentSubscription.value?.planId) {
      selectedPlanId.value = currentSubscription.value.planId;
    }

    const existingEndDate = toDate(currentSubscription.value?.expiresAt);
    if (existingEndDate) {
      billingEndDate.value = toInputDate(existingEndDate);
    } else {
      const defaultEndDate = todayAtMidnight();
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
      billingEndDate.value = toInputDate(defaultEndDate);
    }
  } catch (error: any) {
    fetchError.value = error?.message || 'Failed to load subscription details.';
    currentSubscription.value = null;
  } finally {
    loading.value = false;
  }
};

const getUpgradePayload = () => {
  actionError.value = '';

  if (!isStoreAdmin.value) {
    actionError.value = 'Only Store Admin accounts can manage subscriptions.';
    return null;
  }

  if (!nuxtApp.$firebase?.db || !authStore.user?.uid) {
    actionError.value = 'You must be logged in to update a subscription.';
    return null;
  }

  if (!selectedPlan.value) {
    actionError.value = 'Please select a subscription plan.';
    return null;
  }

  const endDate = parseInputDate(billingEndDate.value);
  if (!endDate) {
    actionError.value = 'Please select a valid end date.';
    return null;
  }

  const startDate = todayAtMidnight();
  const months = calculateBillingMonths(startDate, endDate);
  if (months <= 0) {
    actionError.value = 'End date must be after today.';
    return null;
  }

  return {
    startDate,
    endDate,
    months,
  };
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  proofValidationError.value = '';
  submissionLimitError.value = '';
};

const closePlanLimitModal = async () => {
  showPlanLimitModal.value = false;
  const nextQuery = { ...route.query } as Record<string, any>;
  delete nextQuery.upgradeReason;
  delete nextQuery.planId;
  delete nextQuery.maxShops;
  await navigateTo({ path: route.path, query: nextQuery }, { replace: true });
};

const openPlanLimitModalFromQuery = () => {
  const reason = String(route.query.upgradeReason || '');
  if (reason !== 'shop-limit' && reason !== 'product-limit') return;

  const planId = String(route.query.planId || 'free').toLowerCase();
  const prettyPlan = planId.charAt(0).toUpperCase() + planId.slice(1);

  if (reason === 'shop-limit') {
    const maxShops = Number(route.query.maxShops || 1) || 1;
    planLimitModalMessage.value = `Your ${prettyPlan} plan allows only ${maxShops} shop${maxShops > 1 ? 's' : ''}. Please upgrade your subscription to create more shops.`;
  } else {
    const maxProducts = Number(route.query.maxProducts || 1) || 1;
    planLimitModalMessage.value = `Your ${prettyPlan} plan allows only ${maxProducts} product${maxProducts > 1 ? 's' : ''} per shop. Please upgrade your subscription to add more products.`;
  }

  showPlanLimitModal.value = true;
};

const onPaymentScreenshotChange = (event: Event) => {
  proofValidationError.value = '';

  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;

  if (!file) {
    paymentScreenshotFile.value = null;
    return;
  }

  if (!file.type.startsWith('image/')) {
    proofValidationError.value = 'Please upload an image file for the screenshot.';
    paymentScreenshotFile.value = null;
    target.value = '';
    return;
  }

  paymentScreenshotFile.value = file;
  target.value = '';
};

const startUpgradePayment = async () => {
  actionMessage.value = '';
  proofValidationError.value = '';
  submissionLimitError.value = '';
  const payload = getUpgradePayload();
  if (!payload) return;

  await refreshWeeklySubmissionCount();
  if (!hasRemainingWeeklySubmissions.value) {
    submissionLimitError.value = `You already reached ${MAX_WEEKLY_SUBMISSIONS} submissions this week.`;
    return;
  }

  showPaymentModal.value = true;
};

const confirmPaymentAndCreateSubscription = async () => {
  actionError.value = '';
  actionMessage.value = '';
  proofValidationError.value = '';
  submissionLimitError.value = '';
  const payload = getUpgradePayload();
  if (!payload) {
    showPaymentModal.value = false;
    return;
  }

  if (!hasPaymentProof.value) {
    proofValidationError.value = 'Please provide either Reference No. or screenshot before saving.';
    return;
  }

  isSubmitting.value = true;
  try {
    const db = nuxtApp.$firebase.db;
    const storage = nuxtApp.$firebase?.storage;
    const userUid = authStore.user?.uid;
    if (!userUid) {
      actionError.value = 'You must be logged in to update a subscription.';
      return;
    }

    await refreshWeeklySubmissionCount();
    if (!hasRemainingWeeklySubmissions.value) {
      submissionLimitError.value = `You already reached ${MAX_WEEKLY_SUBMISSIONS} submissions this week.`;
      return;
    }

    let screenshotUrl: string | null = null;
    let screenshotPath: string | null = null;
    let screenshotName: string | null = null;

    if (paymentScreenshotFile.value) {
      if (!storage) {
        actionError.value = 'Storage is not available to upload screenshot.';
        return;
      }

      const file = paymentScreenshotFile.value;
      const safeName = file.name.replace(/\s+/g, '_');
      const path = `subscriptions/${userUid}/${Date.now()}_${safeName}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, file);
      screenshotUrl = await getDownloadURL(fileRef);
      screenshotPath = path;
      screenshotName = file.name;
    }

    const newSubscriptionPayload = {
      userId: userUid,
      planId: selectedPlan.value.id,
      status: 'active',
      referenceNo: referenceNo.value.trim() || null,
      screenshotUrl,
      screenshotPath,
      screenshotName,
      startedAt: Timestamp.fromDate(payload.startDate),
      expiresAt: Timestamp.fromDate(payload.endDate),
      months: payload.months,
      totalAmount: totalAmount.value,
      monthlyPrice: selectedPlan.value.price,
      clientCreatedAt: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const newSubscriptionRef = await addDoc(collection(db, 'subscriptions'), newSubscriptionPayload);

    actionMessage.value = `Subscription updated. ${selectedPlan.value.name} x ${payload.months} month${payload.months > 1 ? 's' : ''} = ${formatMoney(totalAmount.value)}.`;
    currentSubscription.value = {
      id: newSubscriptionRef.id,
      ...newSubscriptionPayload,
    } as SubscriptionRecord;
    selectedPlanId.value = selectedPlan.value.id;
    billingEndDate.value = toInputDate(payload.endDate);
    referenceNo.value = '';
    paymentScreenshotFile.value = null;
    showPaymentModal.value = false;
    await Promise.all([fetchSubscription(), refreshWeeklySubmissionCount()]);
  } catch (error: any) {
    actionError.value = error?.message || 'Failed to update subscription.';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchPageData();
  openPlanLimitModalFromQuery();
});
</script>

<style scoped>
.subscriptions-page {
  display: grid;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow,
.section-kicker {
  margin: 0 0 8px;
  color: #c2410c;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page-title,
.section-head h2,
.schema-copy h2,
.current-card-copy h2 {
  margin: 0;
  color: #111827;
  font-size: 34px;
  font-weight: 900;
}

.page-subtitle,
.current-card-copy p,
.schema-copy p {
  margin: 10px 0 0;
  max-width: 720px;
  color: #475569;
  line-height: 1.7;
}

.status-chip {
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.status-active { background: #dcfce7; color: #166534; }
.status-expired { background: #fee2e2; color: #b91c1c; }
.status-cancelled { background: #e2e8f0; color: #334155; }
.status-idle { background: #ffedd5; color: #9a3412; }

.content-stack {
  display: grid;
  gap: 24px;
}

.current-card,
.schema-card {
  display: grid;
  gap: 20px;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
  border: 1px solid rgba(251, 146, 60, 0.16);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

.current-meta-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.meta-card {
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.meta-label {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.meta-card strong {
  color: #0f172a;
  font-size: 16px;
}

.plans-section {
  display: grid;
  gap: 18px;
}

.section-head h2 {
  font-size: 28px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.plan-card {
  position: relative;
  display: grid;
  gap: 16px;
  padding: 24px;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.06);
}

.plan-card.featured {
  background: linear-gradient(180deg, #1f1147 0%, #312e81 100%);
  color: #ffffff;
  border-color: transparent;
}

.plan-card.current {
  outline: 2px solid #fb923c;
  outline-offset: 0;
}

.plan-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.plan-tier,
.current-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.plan-tier {
  background: #ffedd5;
  color: #9a3412;
}

.plan-card.featured .plan-tier {
  background: rgba(251, 191, 36, 0.18);
  color: #fde68a;
}

.current-pill {
  background: #111827;
  color: #ffffff;
}

.plan-card.featured .current-pill {
  background: #ffffff;
  color: #1f1147;
}

.plan-card h3 {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
}

.plan-price {
  font-size: 30px;
  font-weight: 900;
  color: #c2410c;
}

.plan-card.featured .plan-price,
.plan-card.featured .plan-description,
.plan-card.featured .feature-list li,
.plan-card.featured h3 {
  color: #ffffff;
}

.plan-description {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.feature-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.feature-list li {
  position: relative;
  padding-left: 22px;
  color: #334155;
}

.feature-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: #f59e0b;
  font-size: 18px;
  line-height: 1;
}

.plan-select-btn {
  width: 100%;
  border: 1px solid #f59e0b;
  background: #fff7ed;
  color: #9a3412;
  border-radius: 12px;
  min-height: 42px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-select-btn:hover {
  transform: translateY(-1px);
}

.plan-select-btn.selected {
  background: #f59e0b;
  color: #ffffff;
  border-color: #ea580c;
}

.upgrade-card {
  display: grid;
  gap: 16px;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
  border: 1px solid rgba(251, 146, 60, 0.16);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

.upgrade-head h2 {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 900;
}

.upgrade-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;
}

.field-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.field-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 12px;
  min-height: 44px;
  padding: 0 12px;
  color: #0f172a;
  font-weight: 600;
}

.calc-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.calc-item {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.calc-item span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.calc-item strong {
  color: #0f172a;
  font-size: 20px;
  font-weight: 900;
}

.calc-item.total {
  background: #1f1147;
  border-color: transparent;
}

.calc-item.total span,
.calc-item.total strong {
  color: #ffffff;
}

.calc-note {
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.action-error {
  color: #b91c1c;
  font-size: 14px;
  font-weight: 700;
}

.action-success {
  color: #166534;
  font-size: 14px;
  font-weight: 700;
}

.apply-btn {
  border: none;
  border-radius: 14px;
  min-height: 46px;
  padding: 0 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.apply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(234, 88, 12, 0.25);
}

.apply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.payment-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.payment-modal-card {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 22px 60px rgba(2, 6, 23, 0.35);
  overflow-y: auto;
}

.payment-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.payment-modal-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 900;
}

.payment-close-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.payment-modal-body {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 16px;
}

.payment-qr-image {
  width: 100%;
  max-width: 220px;
  max-height: 220px;
  object-fit: contain;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.payment-caption {
  margin: 0;
  color: #334155;
  font-weight: 700;
}

.payment-total {
  margin: 0;
  color: #0f172a;
  font-weight: 900;
}

.proof-grid {
  width: 100%;
  display: grid;
  gap: 12px;
}

.payment-proof-file {
  width: 100%;
  margin: 0;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.payment-proof-note,
.payment-limit-note {
  width: 100%;
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.confirm-payment-btn {
  width: 100%;
  border: none;
  border-radius: 14px;
  min-height: 46px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.confirm-payment-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.plan-limit-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: rgba(2, 6, 23, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.plan-limit-modal-card {
  width: 100%;
  max-width: 460px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
  border: 1px solid rgba(251, 146, 60, 0.28);
  box-shadow: 0 26px 70px rgba(2, 6, 23, 0.35);
  overflow: hidden;
}

.plan-limit-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(251, 146, 60, 0.2);
}

.plan-limit-header h3 {
  margin: 4px 0 0;
  color: #111827;
  font-size: 24px;
  font-weight: 900;
}

.plan-limit-body {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.plan-limit-message {
  margin: 0;
  color: #334155;
  line-height: 1.7;
}

.schema-block {
  margin: 0;
  padding: 20px;
  border-radius: 22px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 14px;
  line-height: 1.7;
  overflow-x: auto;
}

.schema-note {
  margin: 0;
  color: #64748b;
}

.state {
  display: grid;
  place-items: center;
  padding: 56px 20px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  text-align: center;
}

.state.error {
  color: #b91c1c;
}

.spinner {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 4px solid #fed7aa;
  border-top-color: #ea580c;
  animation: spin 0.9s linear infinite;
  margin-bottom: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1100px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }

  .current-meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .upgrade-grid,
  .calc-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
  }

  .current-card,
  .schema-card,
  .plan-card {
    padding: 22px;
  }

  .current-meta-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 28px;
  }
}
</style>