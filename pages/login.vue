<template>
  <div class="login-page">
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
        <h1 class="brand-headline">Shop local,<br><span class="gradient-text">live better.</span></h1>
        <p class="brand-desc">Discover hundreds of local stores, compare prices, and get same-day delivery all in one place.</p>
        <ul class="brand-features">
          <li>500+ verified shops</li>
          <li>Fast same-day delivery</li>
          <li>Safe & secure shopping</li>
        </ul>
      </div>
    </div>

    <div class="form-panel">
      <div class="form-card">
        <div class="form-header">
          <div class="form-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 6c1.66 0 3 1.34 3 3v2H9V9c0-1.66 1.34-3 3-3z" fill="#fff"/></svg>
          </div>
          <div>
            <h2 class="form-title">Welcome back</h2>
            <p class="form-subtitle">Sign in to continue to your account</p>
          </div>
        </div>

        <form class="login-form" @submit.prevent="signIn">
          <div class="field">
            <label class="field-label">Email address</label>
            <input v-model="email" type="email" class="input" placeholder="you@example.com" required autocomplete="email" />
          </div>
          <div class="field">
            <label class="field-label">Password</label>
            <div class="password-wrap">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" class="input" placeholder="Enter your password" required autocomplete="current-password" />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button>
            </div>
          </div>
          <div class="forgot-row">
            <NuxtLink to="/login" class="forgot-link">Forgot password?</NuxtLink>
          </div>
          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in to account</span>
          </button>
          <div v-if="error" class="error-message">{{ error }}</div>
        </form>

        <div class="or-divider"><span class="line"></span><span class="or-text">or continue with</span><span class="line"></span></div>

        <button class="social-btn google" :disabled="loading" @click="signInWithGoogle">
          <span class="sb-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.251 17.64 11.945 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          </span>
          <span>Continue with Google</span>
        </button>
        <button class="social-btn" disabled>
          <span class="sb-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" fill="#1877F2"/></svg>
          </span>
          <span>Continue with Facebook</span>
          <span class="soon">Soon</span>
        </button>

        <div class="form-footer">
          Don't have an account?
          <NuxtLink to="/login" class="register-link">Create one free</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';

definePageMeta({ ssr: false });
useHead({ title: 'Login | My Near Shops' });

const { $firebase } = useNuxtApp() as any;
const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const hashPassword = async (password: string) => {
  const cryptoObj = (globalThis as any).crypto;
  const buf = await cryptoObj.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const signIn = async () => {
  error.value = '';
  loading.value = true;
  try {
    const db = $firebase.db;
    const cred = await signInWithEmailAndPassword($firebase.auth, email.value, password.value);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (!userDoc.exists()) throw new Error('User account not found.');
    const data = userDoc.data() as any;
    const profile = {
      uid: cred.user.uid,
      email: data.email || cred.user.email,
      displayName: data.name || data.displayName || cred.user.displayName,
      photoURL: data.photoURL || cred.user.photoURL,
    };
    authStore.setUser(profile as any);
    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(profile))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    await router.push('/dashboard');
  } catch (e: any) {
    error.value = e?.message || 'Sign in failed. Please try again.';
  } finally {
    loading.value = false;
  }
};

const signInWithGoogle = async () => {
  error.value = '';
  loading.value = true;
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup($firebase.auth, provider);
    const profile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      photoURL: cred.user.photoURL,
    };
    authStore.setUser(profile as any);
    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(profile))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    await router.push('/dashboard');
  } catch (e: any) {
    error.value = e?.message || 'Google sign in failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page { display: flex; min-height: 100vh; }
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
.brand-desc { font-size: 16px; color: rgba(255,255,255,0.75); line-height: 1.7; margin: 0 0 36px; }
.brand-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.brand-features li { display: flex; align-items: center; gap: 10px; font-size: 15px; color: rgba(255,255,255,0.9); }
.brand-features li::before { content: '✓'; width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }

.form-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 28px; background: #f8fafc; }
.form-card { width: 100%; max-width: 440px; background: #fff; border-radius: 24px; padding: 40px; box-shadow: 0 24px 60px rgba(15,23,42,0.12); border: 1px solid #e2e8f0; }
.form-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.form-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(251,191,36,0.25); }
.form-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; color: #0f172a; }
.form-subtitle { font-size: 14px; color: #64748b; margin: 0; }
.login-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field-label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; }
.password-wrap { position: relative; }
.password-wrap .input { padding-right: 70px; }
.toggle-password { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #4f46e5; font-size: 12px; font-weight: 700; cursor: pointer; }
.forgot-row { display: flex; justify-content: flex-end; margin-top: -4px; }
.forgot-link { font-size: 13px; font-weight: 700; color: #4f46e5; transition: color 0.2s; }
.forgot-link:hover { color: #6366f1; text-decoration: underline; }
.btn-primary { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 50px; border-radius: 13px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; font-weight: 800; font-size: 15px; border: none; cursor: pointer; box-shadow: 0 8px 20px rgba(251,191,36,0.35); transition: all 0.25s ease; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(251,191,36,0.45); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.w-full { width: 100%; }
.error-message { font-size: 13px; color: #dc2626; background: #fef2f2; padding: 10px 12px; border-radius: 10px; margin-top: 4px; }
.or-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
.line { flex: 1; height: 1px; background: #e2e8f0; }
.or-text { font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.social-btn { display: flex; align-items: center; gap: 12px; width: 100%; height: 50px; padding: 0 18px; border-radius: 13px; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; transition: all 0.22s; }
.social-btn:hover:not(:disabled) { border-color: #fbbf24; box-shadow: 0 4px 14px rgba(251,191,36,0.12); }
.social-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.sb-icon { display: flex; align-items: center; justify-content: center; }
.soon { margin-left: auto; background: #f1f5f9; color: #64748b; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; }
.form-footer { text-align: center; font-size: 14px; color: #64748b; margin-top: 20px; }
.register-link { color: #4f46e5; font-weight: 700; margin-left: 4px; }
.register-link:hover { color: #6366f1; text-decoration: underline; }

@media (max-width: 900px) {
  .brand-panel { display: none; }
  .form-panel { padding: 36px 20px; }
  .form-card { padding: 32px; }
}
</style>
