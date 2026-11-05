<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: 'My Near Shops — Local shops. Better days.' });

const steps = [
  { t: 'Find nearby shops', d: 'Share your location or search an area to see every local store around you.', n: '01' },
  { t: 'Pick & add to cart', d: 'Compare prices across shops and fill one cart with your favorites.', n: '02' },
  { t: 'Fast delivery', d: 'Check out in seconds and follow your order right to your door.', n: '03' },
];

const features = [
  { t: 'Local Shops', d: 'Groceries, produce, hardware and more — from neighbors you can trust.', bg: '#fde7c3', fg: '#b7791f', i: 'M3 9l1.5-5h15L21 9M4 9v11h16V9M9 20v-6h6v6' },
  { t: 'Fast Delivery', d: 'Same-day, without the big-chain wait.', bg: '#dbeafe', fg: '#2563eb', i: 'M13 2L4 14h7l-1 8 9-12h-7z' },
  { t: 'Verified Shops', d: 'Every shop is checked before it is listed.', bg: '#dcfce7', fg: '#16a34a', i: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4' },
  { t: 'Best Prices', d: 'Compare one item across nearby shops in a tap.', bg: '#fee2e2', fg: '#dc2626', i: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01' },
  { t: 'Secure Payments', d: 'Bank-grade protection on every order.', bg: '#ede9fe', fg: '#7c3aed', i: 'M6 11V8a6 6 0 0112 0v3M5 11h14v10H5z' },
  { t: 'Friendly Support', d: 'Real people, ready to help whenever you need.', bg: '#cffafe', fg: '#0891b2', i: 'M4 14v-2a8 8 0 0116 0v2M4 14h3v5H4zM17 14h3v5h-3zM20 19c0 2-3 2-6 2' },
];

const stats = [['500+', 'Local shops'], ['50K+', 'Products'], ['10K+', 'Customers'], ['4.9★', 'Rating']];

const merchant = [
  'Get discovered by shoppers searching within walking and riding distance',
  'List your products and manage stock from one simple dashboard',
  'Receive orders directly and keep the profit you earn',
  'Free to get started — no complicated setup or contracts',
];

const faqs = [
  { q: 'Is My Near Shops free to use?', a: 'Browsing shops and products is always free. Delivery and payment options are shown clearly at checkout.' },
  { q: 'How do I list my shop?', a: 'Send us an inquiry below with your shop details. Our team will verify your shop and get you onboarded, usually within 2 business days.' },
  { q: 'Which areas do you cover?', a: 'We are growing neighborhood by neighborhood. Tell us your area in an inquiry and we will let you know when we reach you.' },
  { q: 'How are shops verified?', a: 'We confirm each shop’s identity and location before it appears in search, so you always know who you are buying from.' },
  { q: 'Which payment methods are supported?', a: 'Cash on delivery and popular e-wallets such as GCash are supported, depending on the shop.' },
];
const openFaq = ref<number | null>(0);

const topics = ['General question', 'List my shop', 'Partnership', 'Support', 'Feedback'];
const form = reactive({ name: '', email: '', phone: '', topic: topics[0], message: '', website: '' });
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle');
const errorMsg = ref('');

async function submit() {
  if (status.value === 'sending') return;
  status.value = 'sending';
  errorMsg.value = '';
  try {
    await $fetch('/api/inquiry', { method: 'POST', body: form });
    status.value = 'sent';
    Object.assign(form, { name: '', email: '', phone: '', topic: topics[0], message: '', website: '' });
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || 'Something went wrong. Please try again.';
    status.value = 'error';
  }
}

const menuOpen = ref(false);
const year = new Date().getFullYear();
</script>

<template>
  <div class="lp">
    <header class="nav">
      <div class="wrap nav-in">
        <a href="#top" class="brand"><img src="/icon.png" alt="" width="38" height="38" class="app-icon" /><span>My Near Shops</span></a>
        <nav class="links" :class="{ open: menuOpen }" @click="menuOpen = false">
          <a href="#how">How it works</a>
          <a href="#why">Why us</a>
          <a href="#shops">For shops</a>
          <a href="#faq">FAQ</a>
          <a href="#inquiry" class="btn btn-accent sm">Send inquiry</a>
        </nav>
        <button class="burger" aria-label="Menu" @click="menuOpen = !menuOpen"><span /><span /><span /></button>
      </div>
    </header>

    <main id="top">
      <section class="hero">
        <div class="blob b1" /><div class="blob b2" />
        <div class="wrap hero-in">
          <div class="hero-copy">
            <div class="badge"><i class="dot" />Local shops. Better days.</div>
            <h1>Good things are <em>close by.</em></h1>
            <p class="lead">Discover trusted neighborhood shops, find what you need, and get it delivered all in one place. Support your community while saving time.</p>
            <div class="actions">
              <a href="#inquiry" class="btn btn-accent">Get in touch</a>
              <a href="#how" class="btn btn-ghost">See how it works</a>
            </div>
            <p class="micro">Secure · Private · Always free to browse</p>
          </div>
          <div class="hero-visual">
            <div class="pin-card">
              <span class="pin-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="#1e392b"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z" /></svg></span>
              <div><b>Search products</b><small>350 m away · Open now</small></div>
            </div>
            <div class="logo-orb"><img src="/icon.png" alt="My Near Shops app icon" width="220" height="220" class="app-icon big" /></div>
            <div class="float f1"><b>Order delivered</b><small>2 mins ago</small></div>
            <div class="float f2"><b>★ 4.9 / 5</b><small>Top rated</small></div>
          </div>
        </div>
      </section>

      <div class="wrap">
        <div class="stats">
          <div v-for="(s, i) in stats" :key="s[1]" class="stat" :class="{ div: i > 0 }"><b>{{ s[0] }}</b><span>{{ s[1] }}</span></div>
        </div>
      </div>

      <section id="how" class="sec wrap">
        <p class="eyebrow">How it works</p>
        <h2>From browse to doorstep</h2>
        <p class="sub">Three simple steps to get your essentials from the shop down the street.</p>
        <div class="steps">
          <article v-for="s in steps" :key="s.n" class="step">
            <span class="num">{{ s.n }}</span>
            <h3>{{ s.t }}</h3>
            <p>{{ s.d }}</p>
          </article>
        </div>
      </section>

      <section id="why" class="sec wrap">
        <p class="eyebrow">Why shop with us</p>
        <h2>Local feels better.</h2>
        <p class="sub">Everything you need to shop smarter while keeping money in your community.</p>
        <div class="grid">
          <article v-for="f in features" :key="f.t" class="tile">
            <span class="tile-ic" :style="{ background: f.bg, color: f.fg }">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="f.i" /></svg>
            </span>
            <h3>{{ f.t }}</h3>
            <p>{{ f.d }}</p>
          </article>
        </div>
      </section>

      <section id="shops" class="wrap">
        <div class="dark-card">
          <div class="blob b3" />
          <div class="dc-copy">
            <p class="eyebrow light">For shop owners</p>
            <h2>Grow your shop with the neighbors around you.</h2>
            <ul>
              <li v-for="m in merchant" :key="m"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10" /></svg>{{ m }}</li>
            </ul>
            <a href="#inquiry" class="btn btn-accent">List my shop</a>
          </div>
        </div>
      </section>

      <section id="faq" class="sec wrap narrow">
        <p class="eyebrow">FAQ</p>
        <h2>Good questions</h2>
        <div class="faq">
          <div v-for="(f, i) in faqs" :key="f.q" class="qa" :class="{ open: openFaq === i }">
            <button :aria-expanded="openFaq === i" @click="openFaq = openFaq === i ? null : i">{{ f.q }}<span>+</span></button>
            <p v-show="openFaq === i">{{ f.a }}</p>
          </div>
        </div>
      </section>

      <section id="inquiry" class="sec wrap">
        <div class="inq">
          <div class="inq-side">
            <p class="eyebrow light">Inquiry</p>
            <h2>Let’s talk.</h2>
            <p>Have a question, want to list your shop, or interested in partnering? Send us a message and we’ll reply by email, usually within one business day.</p>
            <ul>
              <li>✔ Free shop listing assistance</li>
              <li>✔ Reply within 1 business day</li>
              <li>✔ Your details stay private</li>
            </ul>
          </div>
          <form class="inq-form" @submit.prevent="submit">
            <div v-if="status === 'sent'" class="ok" role="status">
              <b>Thank you!</b> Your inquiry was sent. We’ll be in touch soon.
            </div>
            <template v-else>
              <div class="row">
                <label>Name *<input v-model="form.name" required minlength="2" maxlength="100" autocomplete="name" placeholder="Juan Dela Cruz" /></label>
                <label>Email *<input v-model="form.email" type="email" required maxlength="200" autocomplete="email" placeholder="you@example.com" /></label>
              </div>
              <div class="row">
                <label>Phone<input v-model="form.phone" type="tel" maxlength="40" autocomplete="tel" placeholder="Optional" /></label>
                <label>Topic
                  <select v-model="form.topic"><option v-for="t in topics" :key="t">{{ t }}</option></select>
                </label>
              </div>
              <label>Message *<textarea v-model="form.message" required minlength="10" maxlength="3000" rows="5" placeholder="How can we help?" /></label>
              <input v-model="form.website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
              <p v-if="status === 'error'" class="err" role="alert">{{ errorMsg }}</p>
              <button class="btn btn-accent full" :disabled="status === 'sending'">{{ status === 'sending' ? 'Sending…' : 'Send inquiry' }}</button>
            </template>
          </form>
        </div>
      </section>
    </main>

    <footer class="foot">
      <div class="wrap foot-in">
        <a href="#top" class="brand dark"><img src="/icon.png" alt="" width="30" height="30" class="app-icon" /><span>My Near Shops</span></a>
        <p>&copy; {{ year }} My Near Shops. Local shops. Better days. · <NuxtLink to="/privacy">Privacy Policy</NuxtLink> · <NuxtLink to="/terms">Terms of Service</NuxtLink></p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.lp {
  --g50: #f5f7f2; --g100: #e8eee3; --g200: #d5e1cd; --g300: #b9cda9; --g400: #91ae83;
  --g600: #4f7952; --g700: #3b6243; --g800: #2b4c36; --g900: #1e392b;
  --accent: #f5a623; --gray5: #6b7280; --gray6: #4b5563;
  --shadow: 0 4px 12px rgba(30, 57, 43, 0.08);
  background: var(--g50); color: var(--g900); font-family: Inter, system-ui, sans-serif; scroll-behavior: smooth;
}
.wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
.narrow { max-width: 760px; }
a { color: inherit; text-decoration: none; }

.nav { position: sticky; top: 0; z-index: 20; background: rgba(245, 247, 242, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid var(--g100); }
.nav-in { display: flex; align-items: center; justify-content: space-between; height: 66px; }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 900; font-size: 18px; letter-spacing: -0.3px; color: var(--g900); }
.links { display: flex; align-items: center; gap: 26px; font-weight: 600; font-size: 14px; color: var(--g700); }
.links a:not(.btn):hover { color: var(--accent); }
.burger { display: none; background: none; border: 0; padding: 8px; cursor: pointer; flex-direction: column; gap: 5px; }
.burger span { width: 22px; height: 2px; background: var(--g900); border-radius: 2px; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 26px; border-radius: 14px; font-weight: 800; font-size: 15px; border: 2px solid transparent; cursor: pointer; transition: transform .15s, box-shadow .15s, background .15s; font-family: inherit; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245, 166, 35, 0.35); }
.btn:disabled { opacity: .6; cursor: wait; transform: none; }
.btn-accent { background: var(--accent); color: var(--g900); }
.btn-ghost { border-color: var(--g400); color: #fff; }
.btn-ghost:hover { background: rgba(255, 255, 255, 0.08); box-shadow: none; }
.btn.sm { padding: 9px 18px; font-size: 13px; color: var(--g900); }
.btn.full { width: 100%; }

.hero { position: relative; overflow: hidden; background: var(--g900); color: #fff; margin: 14px 14px 0; border-radius: 32px; padding: 72px 0 110px; }
.blob { position: absolute; border-radius: 50%; background: var(--g800); }
.b1 { width: 480px; height: 480px; top: -170px; right: -140px; }
.b2 { width: 260px; height: 260px; bottom: -90px; left: -60px; opacity: .7; }
.b3 { width: 300px; height: 300px; bottom: -120px; right: -80px; opacity: .7; }
.hero-in { position: relative; display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; align-items: center; }
.badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, .12); color: var(--g100); font-weight: 700; font-size: 12px; padding: 8px 14px; border-radius: 999px; margin-bottom: 22px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
h1 { font-size: clamp(40px, 6vw, 68px); line-height: 1.04; font-weight: 900; letter-spacing: -2px; margin: 0; }
h1 em { color: var(--accent); font-style: normal; }
.lead { color: var(--g200); font-size: 18px; line-height: 1.65; margin: 20px 0 28px; max-width: 520px; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; }
.micro { color: var(--g300); font-size: 13px; margin-top: 22px; }

.hero-visual { position: relative; display: grid; place-items: center; min-height: 340px; }
.app-icon { border-radius: 22%; display: block; }
.app-icon.big { border-radius: 28%; box-shadow: 0 0 0 14px rgba(255, 255, 255, 0.06), 0 20px 40px rgba(0, 0, 0, 0.3); transform: rotate(-4deg); }
.logo-orb { display: grid; place-items: center; }
.pin-card { position: absolute; top: 6px; left: 0; z-index: 2; display: flex; gap: 12px; align-items: center; background: #fff; color: var(--g900); padding: 12px 16px; border-radius: 14px; transform: rotate(-3deg); box-shadow: var(--shadow); }
.pin-card small, .float small { display: block; color: var(--gray5); font-size: 12px; margin-top: 2px; }
.pin-ic { width: 40px; height: 40px; border-radius: 12px; background: var(--accent); display: grid; place-items: center; }
.float { position: absolute; background: #fff; color: var(--g900); padding: 10px 16px; border-radius: 14px; box-shadow: var(--shadow); animation: bob 4s ease-in-out infinite; }
.f1 { bottom: 20px; left: 10px; }
.f2 { bottom: 70px; right: 0; animation-delay: -2s; }
@keyframes bob { 50% { transform: translateY(-8px); } }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); background: #fff; border-radius: 20px; padding: 20px 0; margin: -48px 24px 0; position: relative; box-shadow: var(--shadow); }
.stat { text-align: center; }
.stat.div { border-left: 1px solid var(--g100); }
.stat b { display: block; font-size: 26px; font-weight: 900; color: var(--g700); }
.stat span { font-size: 13px; color: var(--gray5); }

.sec { padding-top: 88px; }
.eyebrow { color: #b7791f; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 1.4px; margin: 0; }
.eyebrow.light { color: var(--accent); }
h2 { font-size: clamp(28px, 4vw, 40px); font-weight: 900; letter-spacing: -1px; margin: 6px 0 10px; }
.sub { color: var(--gray6); margin: 0 0 32px; max-width: 560px; line-height: 1.6; }

.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.step, .tile { background: #fff; border-radius: 20px; padding: 24px; box-shadow: var(--shadow); transition: transform .2s; }
.step:hover, .tile:hover { transform: translateY(-4px); }
.num { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--g700); color: #fff; font-weight: 900; font-size: 14px; }
h3 { margin: 14px 0 6px; font-size: 18px; font-weight: 800; }
.step p, .tile p { margin: 0; color: var(--gray6); line-height: 1.6; font-size: 14px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.tile-ic { width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; }

#shops { margin-top: 88px; }
.dark-card { position: relative; overflow: hidden; background: var(--g900); color: #fff; border-radius: 32px; padding: 56px 48px; }
.dc-copy { position: relative; max-width: 620px; }
.dark-card h2 { font-size: clamp(28px, 4vw, 40px); line-height: 1.12; margin-bottom: 20px; }
.dark-card ul { list-style: none; padding: 0; margin: 0 0 28px; display: grid; gap: 14px; }
.dark-card li { display: flex; gap: 10px; align-items: flex-start; color: var(--g200); line-height: 1.5; }
.dark-card li svg { flex: none; margin-top: 2px; }

.faq { display: grid; gap: 12px; margin-top: 24px; }
.qa { background: #fff; border-radius: 14px; box-shadow: var(--shadow); overflow: hidden; }
.qa button { all: unset; box-sizing: border-box; width: 100%; padding: 18px 20px; font-weight: 800; display: flex; justify-content: space-between; cursor: pointer; }
.qa button span { color: var(--accent); font-size: 22px; line-height: 1; transition: transform .2s; }
.qa.open button span { transform: rotate(45deg); }
.qa p { margin: 0; padding: 0 20px 18px; color: var(--gray6); line-height: 1.6; font-size: 14px; }

.inq { display: grid; grid-template-columns: .85fr 1.15fr; border-radius: 32px; overflow: hidden; box-shadow: var(--shadow); background: #fff; }
.inq-side { background: var(--g900); color: #fff; padding: 48px 40px; }
.inq-side p { color: var(--g200); line-height: 1.65; }
.inq-side ul { list-style: none; padding: 0; margin: 24px 0 0; display: grid; gap: 10px; color: var(--g100); font-weight: 600; font-size: 14px; }
.inq-form { padding: 40px; display: grid; gap: 16px; align-content: start; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
label { display: grid; gap: 6px; font-weight: 700; font-size: 13px; color: var(--g800); }
input, select, textarea { font: inherit; font-weight: 500; padding: 12px 14px; border: 1.5px solid var(--g200); border-radius: 12px; background: var(--g50); color: var(--g900); outline: none; transition: border-color .15s, box-shadow .15s; resize: vertical; }
input:focus, select:focus, textarea:focus { border-color: var(--g600); box-shadow: 0 0 0 3px rgba(79, 121, 82, .18); background: #fff; }
.hp { position: absolute; left: -9999px; }
.err { color: #dc2626; background: #fee2e2; padding: 10px 14px; border-radius: 10px; margin: 0; font-size: 14px; }
.ok { background: #dcfce7; color: #166534; padding: 24px; border-radius: 14px; line-height: 1.6; }

.foot { margin-top: 88px; border-top: 1px solid var(--g200); padding: 28px 0; }
.foot-in { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; color: var(--gray5); font-size: 13px; }
.foot-in p { margin: 0; }

@media (max-width: 860px) {
  .burger { display: flex; }
  .links { display: none; position: absolute; top: 66px; left: 0; right: 0; flex-direction: column; align-items: stretch; gap: 0; background: var(--g50); border-bottom: 1px solid var(--g100); padding: 12px 20px 20px; }
  .links.open { display: flex; }
  .links a { padding: 12px 0; }
  .hero { padding: 48px 0 90px; border-radius: 24px; }
  .hero-in, .inq { grid-template-columns: 1fr; }
  .hero-visual { min-height: 300px; }
  .steps, .grid { grid-template-columns: 1fr; }
  .stats { grid-template-columns: repeat(2, 1fr); gap: 16px 0; margin: -40px 12px 0; }
  .stat:nth-child(3) { border-left: 0; }
  .dark-card { padding: 36px 24px; }
  .inq-side, .inq-form { padding: 32px 22px; }
  .row { grid-template-columns: 1fr; }
}
</style>
