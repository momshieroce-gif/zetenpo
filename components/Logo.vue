<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
}>(), {
  size: 40
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="mynearshops-logo">
    <!-- Storefronts -->
    <rect x="4" y="20" width="8" height="16" rx="1" fill="url(#gradient1)" />
    <rect x="6" y="24" width="4" height="4" rx="0.5" fill="white" opacity="0.85" />
    <rect x="6" y="30" width="4" height="4" rx="0.5" fill="white" opacity="0.85" />

    <rect x="14" y="18" width="8" height="18" rx="1" fill="url(#gradient2)" />
    <rect x="16" y="22" width="4" height="4" rx="0.5" fill="white" opacity="0.85" />
    <rect x="16" y="28" width="4" height="4" rx="0.5" fill="white" opacity="0.85" />

    <rect x="24" y="22" width="8" height="14" rx="1" fill="url(#gradient3)" />
    <rect x="26" y="26" width="4" height="4" rx="0.5" fill="white" opacity="0.85" />
    <rect x="26" y="32" width="4" height="4" rx="0.5" fill="white" opacity="0.85" />

    <rect x="34" y="20" width="8" height="16" rx="1" fill="url(#gradient4)" />
    <rect x="36" y="24" width="4" height="4" rx="0.5" fill="white" opacity="0.85" />
    <rect x="36" y="30" width="4" height="4" rx="0.5" fill="white" opacity="0.85" />

    <!-- Shopping bag overlay -->
    <path d="M24 8C22.9 8 22 8.9 22 10V12H18C16.9 12 16 12.9 16 14V38C16 39.1 16.9 40 18 40H30C31.1 40 32 39.1 32 38V14C32 12.9 31.1 12 30 12H26V10C26 8.9 25.1 8 24 8Z" fill="url(#gradient5)" />
    <path d="M20 16H28M20 20H28M20 24H24" stroke="white" stroke-width="1.5" stroke-linecap="round" />

    <defs>
      <linearGradient id="gradient1" x1="4" y1="20" x2="12" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#667eea" />
        <stop offset="100%" stop-color="#764ba2" />
      </linearGradient>
      <linearGradient id="gradient2" x1="14" y1="18" x2="22" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f093fb" />
        <stop offset="100%" stop-color="#f5576c" />
      </linearGradient>
      <linearGradient id="gradient3" x1="24" y1="22" x2="32" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#4facfe" />
        <stop offset="100%" stop-color="#00f2fe" />
      </linearGradient>
      <linearGradient id="gradient4" x1="34" y1="20" x2="42" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#43e97b" />
        <stop offset="100%" stop-color="#38f9d7" />
      </linearGradient>
      <linearGradient id="gradient5" x1="16" y1="8" x2="32" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#db2777" />
        <stop offset="100%" stop-color="#be185d" />
      </linearGradient>
    </defs>
  </svg>
</template>
