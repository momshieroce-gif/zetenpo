<script setup lang="ts">
definePageMeta({ layout: false });
useHead({
  title: 'Privacy Policy — My Near Shops',
  meta: [{ name: 'description', content: 'How My Near Shops collects, uses and protects your information.' }],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  ],
});
const updated = 'November 5, 2026';
const year = new Date().getFullYear();
</script>

<template>
  <div class="pp">
    <header class="bar">
      <div class="wrap bar-in">
        <NuxtLink to="/" class="brand"><img src="/icon.png" alt="" width="34" height="34" /><span>My Near Shops</span></NuxtLink>
        <NuxtLink to="/" class="back">&larr; Back to home</NuxtLink>
      </div>
    </header>

    <main class="wrap doc">
      <p class="eyebrow">Legal</p>
      <h1>Privacy Policy</h1>
      <p class="meta">Last updated: {{ updated }}</p>

      <p>
        This Privacy Policy explains how My Near Shops (“we”, “us”, “our”) collects, uses, shares and protects
        information when you use the My Near Shops mobile app (package <code>com.mynearshops.app</code>) and our
        website (together, the “Service”). By using the Service you agree to this policy.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li><b>Account details:</b> name, email address, phone number and delivery address when you register or check out.</li>
        <li><b>Sign-in data:</b> if you choose “Sign in with Google”, we receive your name, email address and profile identifier from Google. We never see your Google password.</li>
        <li><b>Orders:</b> items in your cart, delivery or pickup choice, payment method selected (for example cash on delivery or GCash) and order history.</li>
        <li><b>Shop owners:</b> shop name, address, contact number, logo, product photos and product details you upload.</li>
        <li><b>Photos:</b> images you pick from your device for shop logos or product listings. We only access photos you select.</li>
        <li><b>Inquiries:</b> name, email, phone, topic and message sent through our contact form.</li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li><b>Location:</b> with your permission, your approximate or precise device location, used only while the app is open to show shops and distances near you. We do not track your location in the background.</li>
        <li><b>Device and usage data:</b> basic technical information such as device type, operating system and app version, used for security and to keep the Service working.</li>
        <li><b>Local storage:</b> your cart and checkout preferences are saved on your device so they persist between visits.</li>
      </ul>
      <p>We do not collect payment card numbers. We do not knowingly collect sensitive information such as health or biometric data.</p>

      <h2>2. How we use information</h2>
      <ul>
        <li>To create and manage your account and authenticate you.</li>
        <li>To show nearby shops and products and calculate distances.</li>
        <li>To process, fulfil and track orders, and share necessary details with the shop you order from.</li>
        <li>To respond to inquiries and provide customer support.</li>
        <li>To keep the Service secure, prevent fraud and abuse, and fix problems.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <p>We do not sell your personal information and do not use it for third-party advertising.</p>

      <h2>3. How information is shared</h2>
      <ul>
        <li><b>Shops:</b> when you place an order, the shop receives your name, contact number, delivery address and order details so it can fulfil the order.</li>
        <li><b>Service providers:</b> we use Google Firebase (authentication, database and file storage), Google Sign-In, and Google Maps to operate the Service. These providers process data on our behalf under their own privacy terms.</li>
        <li><b>Legal reasons:</b> we may disclose information if required by law or to protect the rights, safety and security of users or the Service.</li>
        <li><b>Business transfers:</b> if we are involved in a merger or sale, information may be transferred, and we will notify you of any change in how it is handled.</li>
      </ul>

      <h2>4. Permissions the app requests</h2>
      <ul>
        <li><b>Location (precise and approximate):</b> to find shops near you.</li>
        <li><b>Photos and media:</b> to let you choose images for shop and product listings.</li>
        <li><b>Internet access:</b> to load shops, products and orders.</li>
      </ul>
      <p>You can change or withdraw any permission at any time in your device settings. The core features that depend on it, such as nearby search, may then be limited.</p>

      <h2>5. Data retention</h2>
      <p>
        We keep your information for as long as your account is active or as needed to provide the Service, resolve
        disputes and meet legal obligations. Order records may be retained longer where required for accounting or
        legal reasons. Inquiries are kept only as long as needed to respond to you.
      </p>

      <h2>6. Your rights and choices</h2>
      <ul>
        <li>Access, correct or update your account information in the app.</li>
        <li>Request deletion of your account and associated personal data (see below).</li>
        <li>Withdraw location or photo permissions in your device settings.</li>
        <li>Clear locally stored cart data by clearing app or browser data.</li>
      </ul>
      <p>Depending on where you live, including under the Philippine Data Privacy Act of 2012, you may also have the right to object to processing, request a copy of your data, and lodge a complaint with your local data protection authority.</p>

      <h2>7. Account and data deletion</h2>
      <p>
        To delete your account and personal data, send a deletion request through our
        <a href="/#inquiry">inquiry form</a> using the email address registered to your account, and select the topic
        “Support”. We will verify your request and delete your data within 30 days, except information we must keep
        by law (such as transaction records).
      </p>

      <h2>8. Security</h2>
      <p>
        We use industry-standard safeguards, including encrypted connections (HTTPS) and access controls on our
        database. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.
        Please keep your sign-in credentials confidential.
      </p>

      <h2>9. Children’s privacy</h2>
      <p>The Service is not directed to children under 13, and we do not knowingly collect their personal information. If you believe a child has provided us data, contact us and we will delete it.</p>

      <h2>10. International transfers</h2>
      <p>Our service providers may process data on servers outside your country. Where this happens, we rely on the safeguards offered by those providers to protect your information.</p>

      <h2>11. Changes to this policy</h2>
      <p>We may update this policy from time to time. We will post the updated version here and change the “Last updated” date. Continued use of the Service after changes means you accept the updated policy.</p>

      <h2>12. Contact us</h2>
      <p>Questions about this policy? Reach us through the <a href="/#inquiry">inquiry form</a> on our website and we will reply by email.</p>
    </main>

    <footer class="foot">
      <div class="wrap">&copy; {{ year }} My Near Shops. Local shops. Better days. · <NuxtLink to="/terms">Terms of Service</NuxtLink></div>
    </footer>
  </div>
</template>

<style scoped>
.pp { --g50: #f5f7f2; --g100: #e8eee3; --g200: #d5e1cd; --g700: #3b6243; --g900: #1e392b; --accent: #f5a623; background: var(--g50); color: var(--g900); font-family: Inter, system-ui, sans-serif; min-height: 100vh; }
.wrap { max-width: 800px; margin: 0 auto; padding: 0 20px; }
a { color: var(--g700); }
.bar { background: var(--g900); }
.bar-in { display: flex; justify-content: space-between; align-items: center; height: 64px; max-width: 1120px; }
.brand { display: flex; align-items: center; gap: 10px; color: #fff; font-weight: 900; text-decoration: none; }
.brand img { border-radius: 22%; }
.back { color: var(--g200); font-weight: 600; font-size: 14px; text-decoration: none; }
.back:hover { color: var(--accent); }
.doc { padding-top: 48px; padding-bottom: 64px; line-height: 1.7; color: #374151; }
.eyebrow { color: #b7791f; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 1.4px; margin: 0; }
h1 { color: var(--g900); font-size: clamp(34px, 5vw, 48px); font-weight: 900; letter-spacing: -1px; margin: 6px 0 4px; }
.meta { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
h2 { color: var(--g900); font-size: 22px; font-weight: 800; margin: 36px 0 8px; padding-top: 20px; border-top: 1px solid var(--g200); }
h3 { color: var(--g700); font-size: 16px; margin: 16px 0 4px; }
ul { padding-left: 22px; margin: 8px 0; }
li { margin: 6px 0; }
b { color: var(--g900); }
code { background: var(--g100); padding: 2px 6px; border-radius: 6px; font-size: 13px; }
.foot { border-top: 1px solid var(--g200); padding: 24px 0; text-align: center; color: #6b7280; font-size: 13px; }
</style>
