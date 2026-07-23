<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
        <div class="hero-orb orb-3"></div>
        <div class="hero-grid"></div>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/></svg>
            <span>Rated #1 Local Shopping Platform</span>
            <div class="badge-dot"></div>
          </div>
          <h1 class="hero-title">Shop Local,<br><span class="hero-title-accent">Live Better</span></h1>
          <p class="hero-subtitle">Connect with hundreds of trusted local shops in your area. Get fresh products, great prices, and lightning-fast delivery — all in one place.</p>
          <div class="hero-actions">
            <NuxtLink to="/find-shops" class="btn hero-btn hero-btn-primary"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#1a1a1a"/><circle cx="12" cy="9" r="2.5" fill="#db2777"/></svg><span>Shops Near Me</span></NuxtLink>
            <NuxtLink to="/find-items" class="btn hero-btn hero-btn-secondary"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.49.49 1.28.49 1.77 0l.78-.78c.49-.49.49-1.28 0-1.77L15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg><span>Search Items</span></NuxtLink>
          </div>
          <div class="hero-trust">
            <div class="trust-avatars">
              <div v-for="n in 4" :key="n" class="trust-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg></div>
            </div>
            <div class="trust-text"><span class="trust-count">10,000+</span> happy customers this month</div>
          </div>
          <div class="hero-stats">
            <div class="stat-item"><div class="stat-number">500<span>+</span></div><div class="stat-label">Local Shops</div></div>
            <div class="stat-divider"></div>
            <div class="stat-item"><div class="stat-number">50K<span>+</span></div><div class="stat-label">Products</div></div>
            <div class="stat-divider"></div>
            <div class="stat-item"><div class="stat-number">4.9<span>★</span></div><div class="stat-label">App Rating</div></div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card-stack">
            <div class="floating-card card-delivery">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 18.5a1.5 1.5 0 01-1.5-1.5 1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-1.5 1.5zM9 18.5A1.5 1.5 0 117.5 17 1.5 1.5 0 019 18.5zM20.5 13H19V9c0-1.1-.9-2-2-2h-4V3H6v13H4c-.55 0-1 .45-1 1s.45 1 1 1h1.5a3 3 0 006 0H14a3 3 0 006 0h.5c.55 0 1-.45 1-1s-.45-1-1-1z" fill="#6d28d9"/></svg>
              <div class="floating-card-text"><span class="fc-label">Order Delivered</span><span class="fc-sub">2 mins ago</span></div>
            </div>
            <div class="hero-logo-container"><Logo :size="220" /></div>
            <div class="floating-card card-rating">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#f59e0b"/></svg>
              <div class="floating-card-text"><span class="fc-label">Top Rated</span><span class="fc-sub">4.9 / 5.0</span></div>
            </div>
            <div class="floating-card card-shops">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 4H4v2h16V4zm-2 10h-2v2h2v-2zM4 18h16v2H4v-2zm6-10v6h2V8H8zm4 0v6h2V8h-2zM4 7l1.5 9h13L20 7H4z" fill="#10b981"/></svg>
              <div class="floating-card-text"><span class="fc-label">New Shop</span><span class="fc-sub">Just joined!</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-wave"><svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" /></svg></div>
    </section>

    <section class="how-it-works-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-tag">Simple Process</div>
          <h2 class="section-title">From Browse to <span class="title-highlight">Doorstep</span></h2>
          <p class="section-subtitle">Get your essentials in 3 effortless steps</p>
        </div>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-icon-wrap"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/></svg><div class="step-number-badge">01</div></div>
            <div class="step-content"><h3 class="step-title">Find Nearby Shops</h3><p class="step-description">Enable location or search by area to instantly see all local shops stocked with what you need.</p></div>
          </div>
          <div class="step-card">
            <div class="step-icon-wrap step-icon-2"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/></svg><div class="step-number-badge">02</div></div>
            <div class="step-content"><h3 class="step-title">Pick &amp; Add to Cart</h3><p class="step-description">Browse products, compare prices across shops, and add your favorites to a single cart.</p></div>
          </div>
          <div class="step-card">
            <div class="step-icon-wrap step-icon-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M2 12h2l4-9 3 18 4-10 3 10h2" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="step-number-badge">03</div></div>
            <div class="step-content"><h3 class="step-title">Fast Delivery</h3><p class="step-description">Checkout in seconds and track your order in real-time as it heads straight to you.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="features-container">
        <div class="section-header">
          <div class="section-tag">Why We're Different</div>
          <h2 class="section-title">Built for <span class="title-highlight">Local Communities</span></h2>
          <p class="section-subtitle">Everything you need to shop smarter and support local</p>
        </div>
        <div class="features-grid">
          <div class="feature-card feature-card-large">
            <div class="feature-card-bg"></div>
            <div class="feature-icon-wrapper"><svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="white"/></svg></div>
            <h3 class="feature-title">100s of Local Shops</h3>
            <p class="feature-description">Discover a curated selection of local stores — from groceries and fresh produce to hardware and specialty goods.</p>
            <div class="feature-tag">Most Popular</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper fi-blue"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.19 1.75-.52 2.53l2.6 1.53c.56-1.24.92-2.59.92-4.06 0-5.13-3.92-9.35-9-9.95zM12 19c-2.77 0-5.19-1.76-6.05-4.28L4.11 15.78C5.4 19.39 8.37 22 12 22c.87 0 1.7-.13 2.5-.35l-1.29-2.34C12.85 19.5 12.43 19.55 12 19z" fill="white"/></svg></div>
            <h3 class="feature-title">Lightning Delivery</h3>
            <p class="feature-description">Same-day delivery from local shops means you get it faster — without the big-chain wait.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper fi-green"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="white"/></svg></div>
            <h3 class="feature-title">Verified &amp; Trusted</h3>
            <p class="feature-description">Every shop is manually verified for quality and reliability before listing on our platform.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper fi-orange"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.89 2.52 2.1h2.32c-.13-1.91-1.38-3.52-3.96-4.04V2h-3v3.06c-1.66.18-3.05.74-3.96 1.72-.92 1-1.36 2.3-1.36 3.87 0 3.02 2.26 4.52 6.23 5.32 2.55.53 3.27 1.23 3.27 2.17 0 .75-.67 1.62-2.7 1.62-2.13 0-3.13-.91-3.24-2.18H5.7c.14 1.94 1.35 3.27 3.96 3.82V22h3v-3.06c2.42-.29 4.39-1.25 5.16-2.71.45-.82.65-1.74.65-2.65-.01-3.18-2.68-4.5-6.67-5.35z" fill="white"/></svg></div>
            <h3 class="feature-title">Price Comparison</h3>
            <p class="feature-description">See the same item across multiple shops and instantly choose the best deal for you.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper fi-purple"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" fill="white"/></svg></div>
            <h3 class="feature-title">Secure Payments</h3>
            <p class="feature-description">Your transactions are protected end-to-end with bank-grade security and encryption.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper fi-teal"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white"/></svg></div>
            <h3 class="feature-title">24/7 Support</h3>
            <p class="feature-description">Our friendly support team is always a tap away — ready to resolve any issue in minutes.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="social-proof-section">
      <div class="section-container">
        <div class="proof-grid">
          <div class="proof-stat"><div class="proof-number">500<span>+</span></div><div class="proof-label">Verified Local Shops</div></div>
          <div class="proof-divider"></div>
          <div class="proof-stat"><div class="proof-number">50K<span>+</span></div><div class="proof-label">Products Available</div></div>
          <div class="proof-divider"></div>
          <div class="proof-stat"><div class="proof-number">10K<span>+</span></div><div class="proof-label">Happy Customers</div></div>
          <div class="proof-divider"></div>
          <div class="proof-stat"><div class="proof-number">4.9<span>★</span></div><div class="proof-label">Average Rating</div></div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-background">
        <div class="cta-orb cta-orb-1"></div>
        <div class="cta-orb cta-orb-2"></div>
        <div class="cta-orb cta-orb-3"></div>
        <div class="cta-grid"></div>
      </div>
      <div class="cta-container">
        <div class="cta-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5zm0 4h-2v-2h2v2z" fill="#fbbf24"/></svg>
          <span>Free to join — no credit card needed</span>
        </div>
        <h2 class="cta-title">Your Neighborhood Store,<br><span class="cta-title-accent">One Tap Away</span></h2>
        <p class="cta-description">Join thousands of customers already discovering better local shopping. Sign up free and find your first shop in under 30 seconds.</p>
        <div class="cta-actions">
          <NuxtLink to="/find-shops" class="btn cta-btn cta-btn-primary"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/><circle cx="12" cy="9" r="2.5" fill="#db2777"/></svg><span class="gt-xs">Find Shops Now</span><span class="lt-sm">Find Shops</span></NuxtLink>
          <NuxtLink to="/login" class="btn cta-btn cta-btn-secondary"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg><span class="gt-xs">Create Free Account</span><span class="lt-sm">Sign Up Free</span></NuxtLink>
        </div>
        <div class="cta-footnote">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>
          <span>Secure · Private · Always Free to Browse</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'My Near Shops - Shop Local, Live Better',
  meta: [
    { name: 'description', content: 'Discover verified local shops and products near you with My Near Shops.' },
    { property: 'og:title', content: 'My Near Shops - Shop Local, Live Better' },
    { property: 'og:description', content: 'Find nearby shops and items on a live map.' },
  ],
});
</script>

<style scoped>
/* Base */
.home-page { min-height: calc(100vh - 64px); overflow-x: hidden; background: #ffffff; }

/* Shared */
.section-container { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
.section-header { text-align: center; margin-bottom: 64px; }
.section-tag { display: inline-block; background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); color: #6d28d9; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 20px; margin-bottom: 16px; }
.section-title { font-size: 44px; font-weight: 800; color: #111827; margin: 0 0 16px; line-height: 1.15; letter-spacing: -0.5px; }
.title-highlight { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.section-subtitle { font-size: 18px; color: #6b7280; margin: 0; line-height: 1.6; }

/* Hero */
.hero-section { position: relative; background: linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #6d28d9 100%); padding: 110px 28px 0; color: white; overflow: hidden; }
.hero-background { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
.hero-orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: floatOrb 10s ease-in-out infinite; }
.hero-orb.orb-1 { width: 500px; height: 500px; background: rgba(139, 92, 246, 0.35); top: -150px; right: -100px; animation-delay: 0s; }
.hero-orb.orb-2 { width: 350px; height: 350px; background: rgba(99, 102, 241, 0.3); bottom: 0; left: -80px; animation-delay: 3s; }
.hero-orb.orb-3 { width: 250px; height: 250px; background: rgba(167, 139, 250, 0.2); top: 40%; left: 40%; animation-delay: 6s; }
.hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px); background-size: 60px 60px; }
@keyframes floatOrb { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(20px, -30px) scale(1.05); } 66% { transform: translate(-15px, 20px) scale(0.95); } }
.hero-content { position: relative; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 80px; z-index: 1; flex-wrap: wrap; }
.hero-text { flex: 1; min-width: 340px; animation: heroFadeIn 0.8s ease-out both; }
@keyframes heroFadeIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); padding: 7px 16px; border-radius: 24px; font-size: 13px; font-weight: 600; margin-bottom: 28px; color: #e9d5ff; position: relative; }
.badge-dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 6px #4ade80; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.4); } }
.hero-title { font-size: 64px; font-weight: 900; margin: 0 0 24px; line-height: 1.05; letter-spacing: -1.5px; color: white; }
.hero-title-accent { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fcd34d 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-subtitle { font-size: 19px; line-height: 1.75; margin: 0 0 40px; color: rgba(255, 255, 255, 0.8); max-width: 520px; }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 36px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; border-radius: 14px; text-decoration: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.hero-btn { height: 54px; font-size: 15px; padding: 0 28px; }
.hero-btn.hero-btn-primary { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1a1a1a; box-shadow: 0 8px 24px rgba(251, 191, 36, 0.35); }
.hero-btn.hero-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(251, 191, 36, 0.5); }
.hero-btn.hero-btn-secondary { background: rgba(255, 255, 255, 0.12); color: white; border: 1.5px solid rgba(255, 255, 255, 0.3); backdrop-filter: blur(10px); }
.hero-btn.hero-btn-secondary:hover { background: rgba(255, 255, 255, 0.22); transform: translateY(-3px); border-color: rgba(255, 255, 255, 0.5); }
.hero-trust { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; }
.trust-avatars { display: flex; }
.trust-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #4f46e5); border: 2px solid rgba(255, 255, 255, 0.3); display: flex; align-items: center; justify-content: center; margin-left: -8px; color: white; }
.trust-avatar:first-child { margin-left: 0; }
.trust-text { font-size: 14px; color: rgba(255, 255, 255, 0.75); }
.trust-count { font-weight: 700; color: #fbbf24; }
.hero-stats { display: flex; align-items: center; gap: 0; padding: 20px 28px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); border-radius: 16px; width: fit-content; animation: heroFadeIn 0.8s ease-out 0.3s both; }
.stat-item { text-align: center; padding: 0 28px; }
.stat-number { font-size: 28px; font-weight: 800; color: white; line-height: 1; margin-bottom: 4px; }
.stat-number span { font-size: 20px; color: #fbbf24; }
.stat-label { font-size: 12px; color: rgba(255, 255, 255, 0.65); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-divider { width: 1px; height: 40px; background: rgba(255, 255, 255, 0.15); flex-shrink: 0; }
.hero-visual { flex: 0 0 420px; display: flex; align-items: center; justify-content: center; padding-bottom: 40px; animation: heroFadeIn 0.8s ease-out 0.2s both; }
.hero-card-stack { position: relative; width: 320px; height: 360px; }
.hero-logo-container { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(20px); border-radius: 28px; padding: 40px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3); }
.floating-card { position: absolute; display: flex; align-items: center; gap: 10px; background: white; border-radius: 14px; padding: 12px 16px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18); white-space: nowrap; animation: floatCard 5s ease-in-out infinite; }
.floating-card.card-delivery { top: 10px; left: -20px; animation-delay: 0s; }
.floating-card.card-rating { bottom: 20px; right: -20px; animation-delay: 1.5s; }
.floating-card.card-shops { bottom: 80px; left: -30px; animation-delay: 3s; }
@keyframes floatCard { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.floating-card-text { display: flex; flex-direction: column; }
.fc-label { font-size: 13px; font-weight: 700; color: #111827; line-height: 1; }
.fc-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
.hero-wave { margin-top: 60px; line-height: 0; }
.hero-wave svg { display: block; width: 100%; height: 80px; }

/* How It Works */
.how-it-works-section { padding: 100px 0 110px; background: white; }
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; position: relative; }
.steps-grid::before { content: ''; position: absolute; top: 52px; left: calc(16.67% + 16px); right: calc(16.67% + 16px); height: 2px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); opacity: 0.25; z-index: 0; }
.step-card { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 40px 28px; background: white; border-radius: 20px; border: 1px solid #f3f4f6; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
.step-card:hover { transform: translateY(-8px); box-shadow: 0 20px 48px rgba(102, 126, 234, 0.12); border-color: #ddd6fe; }
.step-card:hover .step-icon-wrap { transform: scale(1.08); }
.step-icon-wrap { width: 72px; height: 72px; border-radius: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 28px; position: relative; flex-shrink: 0; transition: transform 0.3s ease; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35); }
.step-icon-wrap.step-icon-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); box-shadow: 0 8px 24px rgba(245, 87, 108, 0.35); }
.step-icon-wrap.step-icon-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); box-shadow: 0 8px 24px rgba(79, 172, 254, 0.35); }
.step-number-badge { position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; background: white; border-radius: 50%; font-size: 10px; font-weight: 800; color: #374151; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); border: 1.5px solid #e5e7eb; }
.step-content { flex: 1; }
.step-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px; }
.step-description { font-size: 15px; line-height: 1.65; color: #6b7280; margin: 0; }

/* Features */
.features-section { padding: 100px 0 110px; background: linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%); }
.features-container { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: auto auto; gap: 24px; }
.feature-card { position: relative; background: white; border-radius: 20px; padding: 32px; border: 1px solid #e9ecef; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
.feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0, 0, 0, 0.09); border-color: #ddd6fe; }
.feature-card:hover .feature-icon-wrapper { transform: scale(1.1) rotate(-5deg); }
.feature-card.feature-card-large { grid-column: span 1; grid-row: span 2; background: linear-gradient(145deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%); border: none; color: white; }
.feature-card.feature-card-large:hover { box-shadow: 0 20px 48px rgba(79, 70, 229, 0.3); border: none; }
.feature-card.feature-card-large .feature-title { color: white; }
.feature-card.feature-card-large .feature-description { color: rgba(255, 255, 255, 0.75); }
.feature-card-bg { position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; border-radius: 50%; background: rgba(255, 255, 255, 0.06); }
.feature-icon-wrapper { width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; transition: transform 0.3s ease; box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3); }
.feature-icon-wrapper.fi-blue { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); box-shadow: 0 6px 16px rgba(79, 172, 254, 0.3); }
.feature-icon-wrapper.fi-green { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); box-shadow: 0 6px 16px rgba(67, 233, 123, 0.3); }
.feature-icon-wrapper.fi-orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); box-shadow: 0 6px 16px rgba(245, 87, 108, 0.3); }
.feature-icon-wrapper.fi-purple { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); box-shadow: 0 6px 16px rgba(161, 140, 209, 0.3); }
.feature-icon-wrapper.fi-teal { background: linear-gradient(135deg, #0fd850 0%, #f9f047 100%); box-shadow: 0 6px 16px rgba(15, 216, 80, 0.3); }
.feature-title { font-size: 19px; font-weight: 700; color: #111827; margin: 0 0 10px; }
.feature-description { font-size: 14px; line-height: 1.65; color: #6b7280; margin: 0; }
.feature-tag { display: inline-flex; align-items: center; margin-top: 20px; padding: 5px 14px; background: rgba(251, 191, 36, 0.2); color: #fbbf24; font-size: 12px; font-weight: 700; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(251, 191, 36, 0.3); }

/* Social Proof */
.social-proof-section { padding: 72px 0; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); }
.proof-grid { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; }
.proof-stat { text-align: center; padding: 20px 48px; }
.proof-number { font-size: 48px; font-weight: 900; color: white; line-height: 1; margin-bottom: 8px; letter-spacing: -1px; }
.proof-number span { color: #fbbf24; font-size: 36px; }
.proof-label { font-size: 14px; color: rgba(255, 255, 255, 0.6); font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
.proof-divider { width: 1px; height: 60px; background: rgba(255, 255, 255, 0.15); flex-shrink: 0; }

/* CTA */
.cta-section { position: relative; padding: 120px 28px; background: linear-gradient(145deg, #0f0c29 0%, #302b63 50%, #24243e 100%); overflow: hidden; text-align: center; color: white; }
.cta-background { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
.cta-orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: floatOrb 12s ease-in-out infinite; }
.cta-orb.cta-orb-1 { width: 500px; height: 500px; background: rgba(109, 40, 217, 0.35); top: -200px; left: -100px; }
.cta-orb.cta-orb-2 { width: 400px; height: 400px; background: rgba(99, 102, 241, 0.25); bottom: -150px; right: -100px; animation-delay: 4s; }
.cta-orb.cta-orb-3 { width: 250px; height: 250px; background: rgba(251, 191, 36, 0.12); top: 40%; left: 50%; animation-delay: 8s; }
.cta-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 60px 60px; }
.cta-container { position: relative; max-width: 760px; margin: 0 auto; z-index: 1; }
.cta-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.3); color: #fbbf24; font-size: 13px; font-weight: 600; padding: 7px 18px; border-radius: 24px; margin-bottom: 28px; }
.cta-title { font-size: 52px; font-weight: 900; color: white; margin: 0 0 20px; line-height: 1.1; letter-spacing: -1px; }
.cta-title-accent { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.cta-description { font-size: 18px; line-height: 1.7; color: rgba(255, 255, 255, 0.72); margin: 0 0 44px; max-width: 560px; margin-left: auto; margin-right: auto; }
.cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 28px; }
.cta-btn { height: 56px; font-size: 16px; padding: 0 32px; }
.cta-btn.cta-btn-primary { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1a1a1a; box-shadow: 0 8px 24px rgba(251, 191, 36, 0.35); }
.cta-btn.cta-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(251, 191, 36, 0.5); }
.cta-btn.cta-btn-secondary { background: rgba(255, 255, 255, 0.12); color: white; border: 1.5px solid rgba(255, 255, 255, 0.3); backdrop-filter: blur(10px); }
.cta-btn.cta-btn-secondary:hover { background: rgba(255, 255, 255, 0.22); transform: translateY(-3px); border-color: rgba(255, 255, 255, 0.5); }
.cta-footnote { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255, 255, 255, 0.5); }

/* Responsive */
@media (max-width: 1024px) {
  .hero-title { font-size: 48px; }
  .hero-visual { flex: 1 1 100%; }
  .steps-grid { grid-template-columns: 1fr; }
  .steps-grid::before { display: none; }
  .features-grid { grid-template-columns: 1fr; }
  .feature-card.feature-card-large { grid-row: span 1; }
  .cta-title { font-size: 36px; }
  .proof-stat { padding: 16px 32px; }
}
@media (max-width: 768px) {
  .hero-section { padding-top: 80px; }
  .hero-title { font-size: 40px; }
  .hero-stats { display: none; }
  .cta-title { font-size: 32px; }
  .proof-number { font-size: 36px; }
  .proof-label { font-size: 12px; }
}
</style>
