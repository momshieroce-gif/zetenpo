<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner container">
        <NuxtLink to="/" class="logo-section">
          <div class="logo-container">
            <Logo :size="42" />
          </div>
          <div class="logo-text">
            <div class="logo-title">My Near Shops</div>
            <span class="logo-tagline">Marketplace</span>
          </div>
        </NuxtLink>

        <nav class="nav">
          <NuxtLink to="/" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/></svg>
            <span>Home</span>
          </NuxtLink>
          <NuxtLink to="/find-shops" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/><circle cx="12" cy="9" r="2.5" fill="#db2777"/></svg>
            <span>Find Shops</span>
          </NuxtLink>
          <NuxtLink to="/find-items" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.49.49 1.28.49 1.77 0l.78-.78c.49-.49.49-1.28 0-1.77L15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>
            <span>Find Items</span>
          </NuxtLink>
        </nav>

        <div class="header-actions">
          <button class="icon-btn cart-btn" aria-label="Cart" @click="navigateTo('/cart')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.82 14l-.76-3.18H3c-1.1 0-2-.9-2-2 0-.56.23-1.06.59-1.42L5.29 5.71l.71-2.12h13l-.65 1.93c.47.28.82.8.82 1.41 0 .94-.76 1.7-1.7 1.7h-.55l-.62 2.62H7.82zM6.16 8h11.15l-1.09-2.5H7.41L6.16 8z" fill="currentColor"/></svg>
            <span v-if="cartCount > 0" class="icon-badge">{{ cartCount }}</span>
          </button>
          <template v-if="!authStore.isLoggedIn">
            <NuxtLink to="/login" class="btn btn-ghost">Login</NuxtLink>
            <NuxtLink to="/login" class="btn btn-primary">Get Started</NuxtLink>
          </template>
          <template v-else>
           
            <div class="user-menu-wrapper" ref="userMenuRef">
              <button class="user-info-section" @click="toggleUserMenu">
                <div class="user-avatar">{{ initials }}</div>
                <div class="user-details">
                  <div class="user-name">{{ authStore.displayName || 'User' }}</div>
                  <div class="user-role">Member</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="expand-icon" :class="{ open: userMenuOpen }"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor"/></svg>
              </button>
              <div v-if="userMenuOpen" class="user-menu">
                <div class="user-menu-header">
                  <div class="user-menu-info">
                    <div class="user-menu-name">{{ authStore.displayName || 'User' }}</div>
                    <div class="user-menu-email">{{ authStore.user?.email || '' }}</div>
                  </div>
                </div>
                <div class="user-menu-divider"></div>
                <NuxtLink to="/dashboard" class="user-menu-item" @click="userMenuOpen = false">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>
                  <span>Dashboard</span>
                </NuxtLink>
                <div class="user-menu-divider"></div>
                <button class="user-menu-item logout-item" @click="userMenuOpen = false; handleLogout()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>

    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">My Near Shops</div>
          <p class="footer-desc">Your community marketplace for local shops and products.</p>
        </div>
        <div class="footer-links">
          <NuxtLink to="/" class="footer-link">Home</NuxtLink>
          <NuxtLink to="/find-shops" class="footer-link">Find Shops</NuxtLink>
          <NuxtLink to="/find-items" class="footer-link">Find Items</NuxtLink>
          <NuxtLink to="/login" class="footer-link">Login</NuxtLink>
        </div>
        <p class="footer-copy">&copy; {{ new Date().getFullYear() }} My Near Shops. All rights reserved.</p>
      </div>
    </footer>

    <div v-if="showLogoutDialog" class="logout-dialog-overlay" @click.self="showLogoutDialog = false">
      <div class="logout-dialog-card">
        <div class="logout-dialog-glow"></div>
        <div class="logout-dialog-header">
          <div class="logout-dialog-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>
          </div>
          <div class="logout-dialog-title">Sign Out?</div>
          <button class="logout-dialog-close" @click="showLogoutDialog = false" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
          </button>
        </div>
        <div class="logout-dialog-body">
          <div class="logout-dialog-text">Are you sure you want to sign out of your account?</div>
        </div>
        <div class="logout-dialog-actions">
          <button class="btn cancel-btn" @click="showLogoutDialog = false">Cancel</button>
          <button class="btn confirm-btn" @click="confirmLogout">Sign Out</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { signOut } from 'firebase/auth';

const authStore = useAuthStore();
const { $firebase } = useNuxtApp() as any;
const userMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);
const showLogoutDialog = ref(false);
const { cartCount } = useCart();

const initials = computed(() => {
  const name = authStore.displayName || 'U';
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
});

const toggleUserMenu = () => { userMenuOpen.value = !userMenuOpen.value; };

const handleLogout = () => { showLogoutDialog.value = true; };

const confirmLogout = async () => {
  try {
    await signOut($firebase.auth);
    authStore.logout();
    showLogoutDialog.value = false;
    await navigateTo('/');
  } catch (e) {
    // ignore
  }
};

const onClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    userMenuOpen.value = false;
  }
};

onMounted(() => { document.addEventListener('click', onClickOutside); });
onUnmounted(() => { document.removeEventListener('click', onClickOutside); });
</script>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; background: #f8fafc; }

/* Header */
.header { position: fixed; top: 0; left: 0; right: 0; z-index: 50; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2); height: 72px; }
.header-inner { display: flex; align-items: center; justify-content: space-between; height: 72px; padding: 0 24px; max-width: 1240px; margin: 0 auto; }

.logo-section { display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; }
.logo-section:hover { transform: scale(1.02); }
.logo-container { width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; padding: 4px; transition: all 0.3s ease; }
.logo-section:hover .logo-container { box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25); transform: scale(1.05); }
.logo-text { display: flex; flex-direction: column; line-height: 1.1; }
.logo-title { font-size: 20px; font-weight: 800; color: #f8fafc; letter-spacing: -0.4px; }
.logo-tagline { font-size: 11px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.8px; }

.nav { display: flex; align-items: center; gap: 6px; padding: 6px; background: rgba(255, 255, 255, 0.06); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); }
.nav-link { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #cbd5e1; padding: 8px 14px; border-radius: 12px; transition: all 0.25s ease; text-decoration: none; }
.nav-link:hover { color: #f8fafc; background: rgba(255, 255, 255, 0.1); }
.nav-link.router-link-active { color: #0f172a; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35); }
.nav-link.router-link-active svg path:first-child { fill: #0f172a; }

.header-actions { display: flex; align-items: center; gap: 10px; }
.icon-btn { position: relative; width: 42px; height: 42px; border-radius: 14px; background: rgba(255, 255, 255, 0.06); color: #cbd5e1; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.25s ease; }
.icon-btn:hover { background: rgba(255, 255, 255, 0.12); color: #f8fafc; transform: translateY(-2px); }
.icon-badge { position: absolute; top: 2px; right: 2px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; }

.user-menu-wrapper { position: relative; }
.user-info-section { display: flex; align-items: center; gap: 10px; border-radius: 16px; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); padding: 6px 14px 6px 8px; cursor: pointer; transition: all 0.3s ease; }
.user-info-section:hover { background: #334155; border-color: rgba(255, 255, 255, 0.14); transform: translateY(-1px); }
.user-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border: 2px solid rgba(255, 255, 255, 0.9); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
.user-details { display: flex; flex-direction: column; text-align: left; }
.user-name { font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.3; }
.user-role { font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; }
.expand-icon { color: #94a3b8; transition: transform 0.25s ease; }
.expand-icon.open { transform: rotate(180deg); }

.user-menu { position: absolute; top: calc(100% + 10px); right: 0; width: 230px; border-radius: 18px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35); background: #1e293b; overflow: hidden; z-index: 60; }
.user-menu-header { padding: 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); display: flex; align-items: center; gap: 14px; }
.user-menu-avatar { width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 255, 255, 0.22); border: 2px solid rgba(255, 255, 255, 0.45); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
.user-menu-info { display: flex; flex-direction: column; }
.user-menu-name { font-size: 15px; font-weight: 800; color: #ffffff; }
.user-menu-email { font-size: 12px; color: rgba(255, 255, 255, 0.8); margin-top: 2px; }
.user-menu-divider { height: 1px; background: rgba(255, 255, 255, 0.08); }
.user-menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; transition: background 0.2s ease; border: none; background: transparent; width: 100%; cursor: pointer; }
.user-menu-item:hover { background: rgba(255, 255, 255, 0.08); }
.user-menu-item.logout-item:hover { background: rgba(239, 68, 68, 0.12); }

.btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; transition: all 0.25s ease; cursor: pointer; border: none; }
.btn-ghost { padding: 10px 18px; color: #cbd5e1; background: transparent; }
.btn-ghost:hover { color: #f8fafc; background: rgba(255, 255, 255, 0.08); }
.btn-primary { padding: 10px 18px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #0f172a; box-shadow: 0 8px 20px rgba(251, 191, 36, 0.35); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(251, 191, 36, 0.45); }

.main { flex: 1; padding-top: 72px; }

/* Footer */
.footer { position: relative; background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 72px 0 32px; overflow: hidden; }
.footer::before { content: ''; position: absolute; top: -80px; left: 10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%); border-radius: 50%; filter: blur(40px); pointer-events: none; }
.footer-inner { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 28px; align-items: center; text-align: center; }
.footer-logo { font-size: 24px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
.footer-desc { font-size: 14px; color: #94a3b8; max-width: 360px; margin: 10px auto 0; line-height: 1.7; }
.footer-links { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.footer-link { font-size: 14px; font-weight: 600; color: #e2e8f0; padding: 8px 16px; border-radius: 10px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.25s ease; text-decoration: none; }
.footer-link:hover { color: #fff; background: rgba(255, 255, 255, 0.12); transform: translateY(-2px); }
.footer-copy { font-size: 13px; color: #64748b; margin: 0; }

/* Logout Dialog */
.logout-dialog-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; }
.logout-dialog-card { min-width: 420px; border-radius: 24px; overflow: hidden; position: relative; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 28px 70px rgba(0, 0, 0, 0.35); }
.logout-dialog-glow { position: absolute; top: -80px; right: -80px; width: 260px; height: 260px; border-radius: 50%; background: rgba(239, 68, 68, 0.18); filter: blur(60px); pointer-events: none; }
.logout-dialog-header { padding: 28px 24px 0; display: flex; align-items: center; gap: 16px; position: relative; }
.logout-dialog-title { flex: 1; font-size: 20px; font-weight: 800; color: #f8fafc; }
.logout-dialog-icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 12px 28px rgba(239, 68, 68, 0.35); }
.logout-dialog-close { position: absolute; top: 20px; right: 20px; width: 32px; height: 32px; border-radius: 10px; background: transparent; border: none; color: #94a3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.logout-dialog-close:hover { background: rgba(255, 255, 255, 0.08); color: #f8fafc; }
.logout-dialog-body { padding: 16px 24px 8px; }
.logout-dialog-text { color: #cbd5e1; font-weight: 500; }
.logout-dialog-actions { padding: 20px 24px 24px; display: flex; justify-content: flex-end; gap: 12px; }
.cancel-btn { height: 44px; padding: 0 22px; background: #334155; color: #e2e8f0; }
.cancel-btn:hover { background: #475569; }
.confirm-btn { height: 44px; padding: 0 26px; background: #ef4444; color: #fff; }
.confirm-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35); }

@media (max-width: 1024px) { .nav { display: none; } }
@media (max-width: 768px) {
  .header { height: 64px; }
  .header-inner { height: 64px; padding: 0 16px; }
  .logo-tagline, .user-details { display: none; }
  .main { padding-top: 64px; }
  .logout-dialog-card { min-width: calc(100% - 32px); max-width: 420px; }
}
</style>
