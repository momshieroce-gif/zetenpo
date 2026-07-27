<template>
  <div class="forgot-page">
    <div class="brand-panel">
      <div class="brand-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="grid"></div>
      </div>
      <div class="brand-content">
        <NuxtLink to="/" class="brand-logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff"/><circle cx="12" cy="9" r="2.5" fill="#fbbf24"/></svg>
          </div>
          <span>My Near Shops</span>
        </NuxtLink>
        <h1 class="brand-headline">Forgot it?<br><span class="gradient-text">No worries.</span></h1>
        <p class="brand-desc">Enter the email you signed up with and we'll send you a link to reset your password.</p>
      </div>
    </div>

    <div class="form-panel">
      <div class="form-card">
        <div class="form-header">
          <div class="form-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#fff"/></svg>
          </div>
          <div>
            <h2 class="form-title">Reset password</h2>
            <p class="form-subtitle">We'll email you a reset link</p>
          </div>
        </div>

        <form v-if="!sent" class="forgot-form" @submit.prevent="sendReset">
          <div class="field">
            <label class="field-label">Email address</label>
            <input v-model="email" type="email" class="input" placeholder="you@example.com" required autocomplete="email" />
          </div>
          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading">Sending...</span>
            <span v-else>Send reset link</span>
          </button>
          <div v-if="error" class="error-message">{{ error }}</div>
        </form>

        <div v-else class="success-box">
          <div class="success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <p class="success-title">Check your inbox</p>
          <p class="success-desc">If an account exists for <strong>{{ email }}</strong>, a password reset link has been sent. It may take a few minutes to arrive — check your spam folder too.</p>
          <button type="button" class="btn btn-primary w-full" @click="sent = false">Send again</button>
        </div>

        <div class="form-footer">
          Remembered your password?
          <NuxtLink to="/login" class="login-link">Back to sign in</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sendPasswordResetEmail } from 'firebase/auth';

definePageMeta({ ssr: false });
useHead({ title: 'Forgot Password | My Near Shops' });

const { $firebase } = useNuxtApp() as any;

const email = ref('');
const loading = ref(false);
const error = ref('');
const sent = ref(false);

const sendReset = async () => {
  error.value = '';
  loading.value = true;
  try {
    if (!$firebase?.auth) throw new Error('Firebase is not available.');
    await sendPasswordResetEmail($firebase.auth, email.value);
    sent.value = true;
  } catch (e: any) {
    if (e?.code === 'auth/invalid-email') {
      error.value = 'Please enter a valid email address.';
    } else if (e?.code === 'auth/user-not-found') {
      // Do not reveal whether the account exists.
      sent.value = true;
    } else if (e?.code === 'auth/too-many-requests') {
      error.value = 'Too many attempts. Please try again later.';
    } else {
      error.value = e?.message || 'Failed to send reset email. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-page { display: flex; min-height: 100vh; }
.brand-panel { flex: 0 0 44%; position: relative; background: linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #111827 100%); color: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.brand-bg { position: absolute; inset: 0; }
.orb { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.25; animation: floatOrb 10s ease-in-out infinite; }
.orb-1 { width: 400px; height: 400px; background: #fbbf24; top: -120px; right: -80px; }
.orb-2 { width: 300px; height: 300px; background: #6366f1; bottom: -80px; left: -60px; animation-delay: 3s; }
@keyframes floatOrb { 0%, 100% { transform: translate(0,0); } 33% { transform: translate(16px,-24px); } 66% { transform: translate(-12px,16px); } }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 48px 48px; }
.brand-content { position: relative; z-index: 1; padding: 52px; width: 100%; max-width: 420px; }
.brand-logo { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 52px; }
.logo-icon { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; }
.brand-headline { font-size: 46px; font-weight: 900; line-height: 1.1; margin: 0 0 20px; }
.brand-headline .gradient-text { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.brand-desc { font-size: 16px; color: rgba(255,255,255,0.75); line-height: 1.7; margin: 0; }

.form-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 28px; background: #f8fafc; }
.form-card { width: 100%; max-width: 440px; background: #fff; border-radius: 24px; padding: 40px; box-shadow: 0 24px 60px rgba(15,23,42,0.12); border: 1px solid #e2e8f0; }
.form-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.form-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(251,191,36,0.25); }
.form-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; color: #0f172a; }
.form-subtitle { font-size: 14px; color: #64748b; margin: 0; }
.forgot-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field-label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; }
.btn-primary { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 50px; border-radius: 13px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; font-weight: 800; font-size: 15px; border: none; cursor: pointer; box-shadow: 0 8px 20px rgba(251,191,36,0.35); transition: all 0.25s ease; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(251,191,36,0.45); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.w-full { width: 100%; }
.error-message { font-size: 13px; color: #dc2626; background: #fef2f2; padding: 10px 12px; border-radius: 10px; margin-top: 4px; }
.success-box { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; margin-bottom: 24px; }
.success-icon { width: 56px; height: 56px; border-radius: 50%; background: #f0fdf4; display: flex; align-items: center; justify-content: center; }
.success-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
.success-desc { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 8px; }
.form-footer { text-align: center; font-size: 14px; color: #64748b; margin-top: 20px; }
.login-link { color: #4f46e5; font-weight: 700; margin-left: 4px; }
.login-link:hover { color: #6366f1; text-decoration: underline; }

@media (max-width: 900px) {
  .brand-panel { display: none; }
  .form-panel { padding: 36px 20px; }
  .form-card { padding: 32px; }
}
</style>
