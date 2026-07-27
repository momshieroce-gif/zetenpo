<template>
  <div class="register-page">
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
        <h1 class="brand-headline">Join us,<br><span class="gradient-text">shop smarter.</span></h1>
        <p class="brand-desc">Create your free account and start discovering local shops, comparing prices, and getting same-day delivery.</p>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-9-4V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="#fff"/></svg>
          </div>
          <div>
            <h2 class="form-title">Create account</h2>
            <p class="form-subtitle">Sign up free and start shopping local</p>
          </div>
        </div>

        <form class="register-form" @submit.prevent="register">
          <div class="field">
            <label class="field-label">Full name</label>
            <input v-model="name" type="text" class="input" placeholder="John Doe" required autocomplete="name" />
          </div>
          <div class="field">
            <label class="field-label">Email address</label>
            <input v-model="email" type="email" class="input" placeholder="you@example.com" required autocomplete="email" />
          </div>
          <div class="field">
            <label class="field-label">Phone (optional)</label>
            <input v-model="phone" type="tel" class="input" placeholder="+1234567890" autocomplete="tel" />
          </div>
          <div class="field">
            <label class="field-label">Password</label>
            <div class="password-wrap">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" class="input" placeholder="At least 6 characters" required minlength="6" autocomplete="new-password" />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button>
            </div>
          </div>
          <div class="field">
            <label class="field-label">Confirm password</label>
            <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" class="input" placeholder="Re-enter your password" required minlength="6" autocomplete="new-password" />
          </div>
          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading">Creating account...</span>
            <span v-else>Create free account</span>
          </button>
          <div v-if="error" class="error-message">{{ error }}</div>
        </form>

        <div class="form-footer">
          Already have an account?
          <NuxtLink to="/login" class="login-link">Sign in</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

definePageMeta({ ssr: false });
useHead({ title: 'Register | My Near Shops' });

const { $firebase } = useNuxtApp() as any;
const authStore = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const hashPassword = async (value: string) => {
  const cryptoObj = (globalThis as any).crypto;
  const buf = await cryptoObj.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const register = async () => {
  error.value = '';
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }
  loading.value = true;
  try {
    const db = $firebase.db;
    if (!db || !$firebase.auth) throw new Error('Firebase is not available.');

    const cred = await createUserWithEmailAndPassword($firebase.auth, email.value, password.value);
    await updateProfile(cred.user, { displayName: name.value });

    await setDoc(doc(db, 'users', cred.user.uid), {
      name: name.value,
      displayName: name.value,
      email: email.value,
      phone: phone.value || '',
      password_hash: await hashPassword(password.value),
      roleId: 'customer',
      role: 'Customer',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const profile = {
      uid: cred.user.uid,
      email: email.value,
      displayName: name.value,
      photoURL: cred.user.photoURL,
      roleId: 'customer',
      role: 'Customer',
    };
    authStore.setUser(profile as any);
    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(profile))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    await router.push('/dashboard');
  } catch (e: any) {
    if (e?.code === 'auth/email-already-in-use') {
      error.value = 'This email is already registered. Try signing in instead.';
    } else if (e?.code === 'auth/weak-password') {
      error.value = 'Password is too weak. Use at least 6 characters.';
    } else {
      error.value = e?.message || 'Registration failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page { display: flex; min-height: 100vh; }
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
.register-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field-label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; }
.password-wrap { position: relative; }
.password-wrap .input { padding-right: 70px; }
.toggle-password { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #4f46e5; font-size: 12px; font-weight: 700; cursor: pointer; }
.btn-primary { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 50px; border-radius: 13px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; font-weight: 800; font-size: 15px; border: none; cursor: pointer; box-shadow: 0 8px 20px rgba(251,191,36,0.35); transition: all 0.25s ease; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(251,191,36,0.45); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.w-full { width: 100%; }
.error-message { font-size: 13px; color: #dc2626; background: #fef2f2; padding: 10px 12px; border-radius: 10px; margin-top: 4px; }
.form-footer { text-align: center; font-size: 14px; color: #64748b; margin-top: 20px; }
.login-link { color: #4f46e5; font-weight: 700; margin-left: 4px; }
.login-link:hover { color: #6366f1; text-decoration: underline; }

@media (max-width: 900px) {
  .brand-panel { display: none; }
  .form-panel { padding: 36px 20px; }
  .form-card { padding: 32px; }
}
</style>
