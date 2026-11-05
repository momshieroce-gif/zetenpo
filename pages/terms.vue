<script setup lang="ts">
definePageMeta({ layout: false });
useHead({
  title: 'Terms of Service — My Near Shops',
  meta: [{ name: 'description', content: 'The terms that govern your use of the My Near Shops app and website.' }],
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
      <h1>Terms of Service</h1>
      <p class="meta">Last updated: {{ updated }}</p>

      <p>
        These Terms of Service (“Terms”) govern your use of the My Near Shops mobile app (package
        <code>com.mynearshops.app</code>) and website (together, the “Service”). By creating an account or using the
        Service, you agree to these Terms and to our <NuxtLink to="/privacy">Privacy Policy</NuxtLink>. If you do not
        agree, please do not use the Service.
      </p>

      <h2>1. About the Service</h2>
      <p>
        My Near Shops is an online marketplace that helps you discover local shops and products near you and place
        orders with them. We provide the platform; the products are sold and delivered by independent shops. Unless
        stated otherwise, we are not the seller of the products listed.
      </p>

      <h2>2. Eligibility and accounts</h2>
      <ul>
        <li>You must be at least 18 years old, or have the consent of a parent or guardian, to place orders.</li>
        <li>You agree to provide accurate information and keep it up to date.</li>
        <li>You are responsible for your account and for all activity under it. Keep your sign-in details confidential and tell us promptly of any unauthorized use.</li>
        <li>One person may not maintain multiple accounts to abuse promotions or evade a suspension.</li>
      </ul>

      <h2>3. Ordering and payment</h2>
      <ul>
        <li>When you place an order, you make an offer to buy from the shop. The order is confirmed when the shop accepts it.</li>
        <li>Prices, stock and availability are set by each shop and may change without notice. Prices are shown in Philippine pesos unless stated otherwise.</li>
        <li>Payment options (for example cash on delivery or GCash) depend on the shop. If you pay by e-wallet, you are also bound by that provider’s terms.</li>
        <li>Delivery fees, estimated times and pickup options are shown at checkout. Estimates are not guaranteed.</li>
        <li>Please provide a correct delivery address and contact number and be available to receive your order.</li>
      </ul>

      <h2>4. Cancellations, returns and refunds</h2>
      <p>
        Because orders are fulfilled by independent shops, cancellation, return and refund eligibility is governed by
        the shop’s own policy and applicable consumer protection law. Orders may generally be cancelled before the shop
        begins preparing them. If an item is wrong, damaged, missing or of unsatisfactory quality, contact the shop or
        us promptly, and we will help resolve the issue where we can. Perishable goods may not be eligible for return.
      </p>

      <h2>5. Shop owners</h2>
      <p>If you register a shop on the Service, you also agree that:</p>
      <ul>
        <li>You are authorized to operate the shop and your listings, prices, photos and descriptions are accurate and not misleading.</li>
        <li>You will only sell lawful products, and you hold all licenses, permits and registrations required to sell them.</li>
        <li>You are responsible for fulfilling orders, product quality, taxes, and handling customer complaints, returns and refunds.</li>
        <li>You grant us a non-exclusive, worldwide, royalty-free license to display your shop name, logo and product content within the Service for the purpose of operating and promoting it.</li>
        <li>We may verify, suspend or remove shops or listings that do not meet our standards.</li>
      </ul>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful, fraudulent, harassing or abusive purpose.</li>
        <li>List or buy prohibited items, including illegal goods, weapons, counterfeit goods or stolen property.</li>
        <li>Post false reviews or information, or impersonate another person or shop.</li>
        <li>Interfere with or disrupt the Service, attempt unauthorized access, probe for vulnerabilities, or introduce malware.</li>
        <li>Scrape, copy or reverse engineer the Service except as permitted by law.</li>
        <li>Submit spam or misuse the inquiry form.</li>
      </ul>

      <h2>7. Location and permissions</h2>
      <p>
        With your permission, the app uses your device location to show nearby shops and distances. Features that
        depend on location may not work if you deny it. You can change permissions at any time in your device settings.
      </p>

      <h2>8. Content you provide</h2>
      <p>
        You keep ownership of the content you submit (such as photos and listings). You grant us a limited license to
        host, display and process that content to operate the Service. You are responsible for your content and
        confirm you have the rights to share it.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        The Service, including its name, logo, design, software and content created by us, is owned by My Near Shops
        and protected by intellectual property laws. We grant you a limited, revocable, non-transferable license to use
        the app for personal, non-commercial purposes in accordance with these Terms.
      </p>

      <h2>10. Third-party services</h2>
      <p>
        The Service relies on third-party services such as Google Firebase, Google Sign-In and Google Maps, and is
        distributed through Google Play. Your use of those services is subject to their terms. We are not responsible
        for third-party services or for the products and conduct of independent shops.
      </p>

      <h2>11. Suspension and termination</h2>
      <p>
        You may stop using the Service and request account deletion at any time through our
        <a href="/#inquiry">inquiry form</a>. We may suspend or terminate your access if you breach these Terms, put
        others or the Service at risk, or if required by law. Sections that by their nature should survive
        termination will continue to apply.
      </p>

      <h2>12. Disclaimers</h2>
      <p>
        The Service is provided “as is” and “as available”, without warranties of any kind to the extent permitted by
        law. We do not guarantee that the Service will be uninterrupted or error-free, or that listings, prices,
        availability, delivery times or shop information are accurate or complete.
      </p>

      <h2>13. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, My Near Shops will not be liable for indirect, incidental, special or
        consequential damages, or for loss of profits or data, arising from your use of the Service or from products
        purchased from shops. Our total liability for any claim relating to the Service is limited to the amount you
        paid for the order giving rise to the claim. Nothing in these Terms limits liability that cannot be limited by
        law, including your rights as a consumer.
      </p>

      <h2>14. Indemnity</h2>
      <p>You agree to indemnify and hold us harmless from claims and expenses arising from your breach of these Terms, your content, or your misuse of the Service.</p>

      <h2>15. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the Republic of the Philippines. We encourage you to contact us first
        to resolve any dispute informally. Any dispute not resolved informally will be brought before the competent
        courts of the Philippines, without prejudice to any mandatory consumer rights you have in your place of
        residence.
      </p>

      <h2>16. Changes to these Terms</h2>
      <p>We may update these Terms from time to time. We will post the new version here and update the “Last updated” date. Continued use of the Service after changes take effect means you accept the updated Terms.</p>

      <h2>17. Contact us</h2>
      <p>Questions about these Terms? Reach us through the <a href="/#inquiry">inquiry form</a> on our website and we will reply by email.</p>
    </main>

    <footer class="foot">
      <div class="wrap">
        &copy; {{ year }} My Near Shops. Local shops. Better days. ·
        <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
      </div>
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
ul { padding-left: 22px; margin: 8px 0; }
li { margin: 6px 0; }
code { background: var(--g100); padding: 2px 6px; border-radius: 6px; font-size: 13px; }
.foot { border-top: 1px solid var(--g200); padding: 24px 0; text-align: center; color: #6b7280; font-size: 13px; }
</style>
