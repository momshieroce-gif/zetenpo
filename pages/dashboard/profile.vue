<template>
  <div class="profile-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <h1 class="page-title">My Profile</h1>
          <p class="page-subtitle">View and edit your account details</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="state loading">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>
      <div v-else-if="fetchError" class="state error">{{ fetchError }}</div>
      <template v-else-if="profile">
        <form class="profile-form" @submit.prevent="saveProfile">
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="form.name" type="text" class="form-input" placeholder="Your name" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" class="form-input" disabled />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input v-model="form.phone" type="tel" class="form-input" placeholder="Phone number" />
            </div>
            <div class="form-group">
              <label>Role</label>
              <input v-model="form.role" type="text" class="form-input" disabled />
            </div>
            <div class="form-group full">
              <label>Address</label>
              <input v-model="form.address" type="text" class="form-input" placeholder="Your address" />
            </div>
            <div class="form-group">
              <label>Latitude</label>
              <input v-model.number="form.latitude" type="number" step="any" class="form-input" placeholder="Latitude" disabled />
            </div>
            <div class="form-group">
              <label>Longitude</label>
              <input v-model.number="form.longitude" type="number" step="any" class="form-input" placeholder="Longitude" disabled />
            </div>
            <div class="form-group full">
              <button type="button" class="btn btn-secondary" :disabled="detecting" @click="detectLocation">
                {{ detecting ? 'Detecting...' : 'Detect my location' }}
              </button>
            </div>
          </div>

          <div v-if="message" class="alert" :class="messageType">{{ message }}</div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </template>
      <div v-else class="state empty">
        <p class="empty-title">Profile not found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';

interface Profile {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  role?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ssr: false,
});

useHead({ title: 'My Profile | My Near Shops' });

const nuxtApp = useNuxtApp() as any;
const db = nuxtApp.$firebase?.db;
const authStore = useAuthStore();

const profile = ref<Profile | null>(null);
const loading = ref(true);
const fetchError = ref('');
const saving = ref(false);
const message = ref('');
const messageType = ref('success');
const detecting = ref(false);

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  address: '',
  latitude: 0,
  longitude: 0,
});

const loadProfile = async () => {
  loading.value = true;
  fetchError.value = '';
  try {
    if (!db) throw new Error('Firebase is not available.');
    const email = authStore.user?.email;
    if (!email) throw new Error('No authenticated email found.');
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error('Profile not found.');
    const data = snapshot.docs[0].data() as Omit<Profile, 'id'>;
    profile.value = { id: snapshot.docs[0].id, ...data };
    form.value = {
      name: data.name || data.displayName || '',
      email: data.email || email,
      phone: data.phone || '',
      role: data.role || '',
      address: (data as any).address || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    };
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load profile.';
  } finally {
    loading.value = false;
  }
};

const saveProfile = async () => {
  if (!profile.value) return;
  saving.value = true;
  message.value = '';
  try {
    if (!db) throw new Error('Firebase is not available.');
    await updateDoc(doc(db, 'users', profile.value.id), {
      name: form.value.name,
      displayName: form.value.name,
      phone: form.value.phone,
      address: form.value.address,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      updatedAt: serverTimestamp(),
    });
    message.value = 'Profile saved successfully.';
    messageType.value = 'success';
  } catch (e: any) {
    console.error('Profile save failed:', e, { profileId: profile.value?.id, userUid: authStore.user?.uid, form: form.value });
    message.value = e?.message || 'Failed to save profile.';
    messageType.value = 'error';
  } finally {
    saving.value = false;
  }
};

const detectLocation = () => {
  if (!('geolocation' in navigator)) {
    message.value = 'Geolocation is not supported by this browser.';
    messageType.value = 'error';
    return;
  }
  detecting.value = true;
  message.value = '';
  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = position.coords.latitude;
      form.value.longitude = position.coords.longitude;
      detecting.value = false;
      message.value = 'Location detected successfully.';
      messageType.value = 'success';
    },
    (error) => {
      detecting.value = false;
      message.value = 'Unable to retrieve location: ' + (error?.message || 'permission denied');
      messageType.value = 'error';
    }
  );
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-page { max-width: 800px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 28px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 24px rgba(79,70,229,0.25); }
.page-title { font-size: 28px; font-weight: 900; margin: 0 0 4px; color: #0f172a; }
.page-subtitle { font-size: 14px; color: #64748b; margin: 0; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 28px; box-shadow: 0 10px 40px rgba(15,23,42,0.05); }
.state { padding: 48px; text-align: center; color: #64748b; }
.state p { margin: 8px 0 0; }
.spinner { width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
.profile-form { display: flex; flex-direction: column; gap: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: span 2; }
.form-group label { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.form-input { padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; color: #0f172a; background: #fff; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.form-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
.form-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
.form-actions { display: flex; justify-content: flex-end; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
.btn-primary { padding: 12px 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; box-shadow: 0 8px 20px rgba(79,70,229,0.25); }
.btn-primary:hover { opacity: 0.95; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { padding: 12px 24px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
.alert { padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; }
.alert.success { background: #dcfce7; color: #166534; }
.alert.error { background: #fee2e2; color: #991b1b; }
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full { grid-column: span 1; }
}
</style>
