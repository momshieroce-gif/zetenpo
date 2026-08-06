<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-icon">404</div>
      <h1>Page not found</h1>
      <p>We couldn't find the page you're looking for. It may have been moved or deleted.</p>
      <NuxtLink to="/" class="return-link">Go back to homepage.</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.16), transparent 32%),
    radial-gradient(circle at bottom right, rgba(79, 70, 229, 0.12), transparent 28%),
    #0f172a;
  color: #e2e8f0;
}
.error-card {
  width: min(100%, 520px);
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.35);
  padding: 48px 36px;
  text-align: center;
}
.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 108px;
  margin: 0 auto 24px;
  border-radius: 24px;
  background: linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%);
  color: white;
  font-size: 3rem;
  font-weight: 900;
  box-shadow: 0 20px 50px rgba(79, 70, 229, 0.28);
}
h1 {
  margin: 0 0 16px;
  font-size: 2.2rem;
  letter-spacing: -0.04em;
  color: #f8fafc;
}
p {
  margin: 0 0 28px;
  color: #cbd5e1;
  line-height: 1.75;
}
.return-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 999px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.return-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(99, 102, 241, 0.25);
}
@media (max-width: 640px) {
  .error-card {
    padding: 32px 24px;
  }
  .error-icon {
    width: 90px;
    height: 90px;
    font-size: 2.4rem;
  }
  h1 {
    font-size: 1.9rem;
  }
}
</style>
