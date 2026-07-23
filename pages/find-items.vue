<template>
  <div class="map-page">
    <div class="map-hero item-hero">
      <div class="map-hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="grid"></div>
      </div>
      <div class="container map-hero-inner">
        <div class="map-hero-left">
          <div class="map-hero-icon green-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#fff"/></svg>
          </div>
          <div>
            <div class="map-hero-label">Product Search</div>
            <h1 class="map-hero-title">Find Nearby Items</h1>
            <p class="map-hero-desc">Search products across local stores and get directions instantly.</p>
          </div>
        </div>
        <div class="map-hero-stats">
          <div class="stat-box"><div class="stat-box-value">{{ filteredItems.length }}</div><div class="stat-box-label">{{ filteredItems.length === 1 ? 'Item' : 'Items' }} Found</div></div>
          <div class="stat-divider"></div>
          <div class="stat-box"><div class="stat-box-value">{{ radius }}</div><div class="stat-box-label">Search Radius (km)</div></div>
        </div>
      </div>
      <div class="container action-bar">
        <button class="btn btn-ghost-action" @click="getLocation">My Location</button>
        <button class="btn btn-primary" :disabled="!searchText" @click="search">Find Items</button>
        <input v-model="searchText" type="text" class="input search-input" placeholder="Type a product name to search..." />
        <select v-model="radius" class="input radius-select">
          <option v-for="r in [5, 10, 15, 20]" :key="r" :value="r">{{ r }} km</option>
        </select>
      </div>
    </div>

    <div class="map-body">
      <div class="shops-list">
        <div class="list-header green-header">
          <div class="list-title">Nearby Items</div>
          <div class="list-count" v-if="filteredItems.length">{{ filteredItems.length }}</div>
        </div>
        <div v-if="!filteredItems.length" class="empty-state">
          <div class="empty-icon green-empty">I</div>
          <div class="empty-title">No items yet</div>
          <div class="empty-desc">Type a product name and click "Find Items" to search</div>
        </div>
        <div v-else class="shops-cards">
          <div v-for="(item, idx) in filteredItems" :key="item.id" class="shop-row" @click="focusItem(item)">
            <div class="shop-number">{{ Number(idx) + 1 }}</div>
            <div class="shop-info">
              <div class="shop-name">{{ item.name }}</div>
              <div class="shop-distance" v-if="item.distance !== null">{{ item.distance.toFixed(1) }} km away</div>
              <div class="shop-address">{{ item.shopName }} &middot; {{ item.category || 'General' }}</div>
            </div>
            <NuxtLink :to="`/dashboard`" class="shop-link" @click.stop>View</NuxtLink>
          </div>
        </div>
      </div>
      <div class="map-frame">
        <ClientOnly fallback="Loading map...">
          <GoogleMap v-if="apiKey" :api-key="apiKey" :center="center" :zoom="zoom" style="width: 100%; height: 100%" :map-id="mapId || undefined">
            <AdvancedMarker :options="{ position: { lat: lat, lng: lng }, title: 'Your Location' }">
              <InfoWindow :options="{ headerContent: 'You are here' }" v-model="showInfo"><div class="iw-content">Your current location</div></InfoWindow>
            </AdvancedMarker>
            <AdvancedMarker v-for="item in filteredItems" :key="item.id" :options="{ position: { lat: item.latitude, lng: item.longitude }, title: item.name }" @click="selectItem(item)">
              <InfoWindow v-if="selectedItem?.id === item.id" :options="{ headerContent: item.name }" @close="selectedItem = null"><div class="iw-content">{{ item.name }} at {{ item.shopName }}<br><small>{{ item.distance?.toFixed(1) }} km away</small></div></InfoWindow>
            </AdvancedMarker>
          </GoogleMap>
          <div v-else class="map-placeholder">Add a Google Maps API key in your environment to view the map.</div>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GoogleMap, AdvancedMarker, InfoWindow } from 'vue3-google-map';
import type { Product } from '~/types';

useHead({
  title: 'Find Nearby Items | My Near Shops',
  meta: [
    { name: 'description', content: 'Search products across local stores on a live map.' },
  ],
});

const config = useRuntimeConfig().public;
const apiKey = config.googleMapsApiKey;
const mapId = config.googleMapsId;
const lat = ref(14.609);
const lng = ref(120.994);
const zoom = ref(15);
const showInfo = ref(true);
const selectedItem = ref<(Product & { distance: number | null }) | null>(null);
const searchText = ref('');
const radius = ref(5);

const center = computed(() => ({ lat: lat.value, lng: lng.value }));

const allItems: (Product & { shopName: string; distance: number | null })[] = [
  { id: 'i1', shopId: '1', shopName: 'Fresh Mart', name: 'Fresh Milk', category: 'Groceries', price: 85, latitude: 14.61, longitude: 120.995, images: [], distance: null },
  { id: 'i2', shopId: '1', shopName: 'Fresh Mart', name: 'White Bread', category: 'Bakery', price: 55, latitude: 14.6105, longitude: 120.9952, images: [], distance: null },
  { id: 'i3', shopId: '2', shopName: 'Bakery Corner', name: 'Sourdough Loaf', category: 'Bakery', price: 120, latitude: 14.607, longitude: 120.99, images: [], distance: null },
  { id: 'i4', shopId: '2', shopName: 'Bakery Corner', name: 'Croissant', category: 'Bakery', price: 75, latitude: 14.6072, longitude: 120.9905, images: [], distance: null },
  { id: 'i5', shopId: '3', shopName: 'Green Grocers', name: 'Organic Eggs', category: 'Produce', price: 110, latitude: 14.615, longitude: 120.992, images: [], distance: null },
  { id: 'i6', shopId: '5', shopName: 'Pet Supplies Plus', name: 'Dog Food', category: 'Pets', price: 320, latitude: 14.605, longitude: 120.985, images: [], distance: null },
];

const items = ref([...allItems]);

const filteredItems = computed(() => {
  const q = searchText.value.toLowerCase();
  return items.value.filter((i) => {
    const within = i.distance !== null && i.distance <= radius.value;
    const matches = i.name.toLowerCase().includes(q) || i.shopName.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q);
    return within && matches;
  });
});

const getLocation = () => {
  if (process.client && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat.value = position.coords.latitude;
      lng.value = position.coords.longitude;
    }, () => {});
  }
};

const search = () => {
  if (!searchText.value.trim()) return;
  getLocation();
  items.value = allItems.map((i) => {
    const d = getDistance(lat.value, lng.value, i.latitude, i.longitude);
    return { ...i, distance: d };
  });
};

const focusItem = (item: Product & { distance: number | null; shopName: string }) => {
  lat.value = item.latitude;
  lng.value = item.longitude;
  selectedItem.value = item as any;
  zoom.value = 17;
};

const selectItem = (item: Product & { distance: number | null; shopName: string }) => {
  selectedItem.value = item as any;
};

onMounted(() => {
  getLocation();
});
</script>

<style scoped>
.map-page { background: #fff; }

.item-hero { background: linear-gradient(145deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%); }

.map-hero {
  position: relative;
  color: #fff;
  padding: 40px 0 28px;
  overflow: hidden;
}

.map-hero-bg { position: absolute; inset: 0; pointer-events: none; }

.orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.25; animation: floatOrb 12s ease-in-out infinite; }
.orb-1 { width: 400px; height: 400px; background: #99f6e4; top: -120px; right: -80px; }
.orb-2 { width: 300px; height: 300px; background: #5eead4; bottom: -60px; left: -60px; animation-delay: 5s; }
@keyframes floatOrb { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -30px); } }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 48px 48px; }

.map-hero-inner { position: relative; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; z-index: 1; }
.map-hero-left { display: flex; align-items: flex-start; gap: 18px; }
.map-hero-icon { width: 60px; height: 60px; border-radius: 16px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.green-icon { background: rgba(255,255,255,0.18); }
.map-hero-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.7); margin-bottom: 6px; }
.map-hero-title { font-size: 32px; font-weight: 900; margin: 0 0 8px; }
.map-hero-desc { font-size: 14px; color: rgba(255,255,255,0.85); margin: 0; }

.map-hero-stats { display: flex; align-items: center; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 16px 24px; backdrop-filter: blur(10px); }
.stat-box { text-align: center; padding: 0 20px; }
.stat-box-value { font-size: 28px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
.stat-box-label { font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.5px; }
.stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }

.action-bar { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
.search-input { flex: 1; min-width: 220px; background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2); }
.search-input::placeholder { color: rgba(255,255,255,0.6); }
.search-input:focus { border-color: rgba(255,255,255,0.5); box-shadow: 0 0 0 3px rgba(255,255,255,0.1); }
.radius-select { width: 100px; background: rgba(255,255,255,0.1); color: #fff; }
.btn-ghost-action { background: rgba(255,255,255,0.12); color: #fff; border: 1.5px solid rgba(255,255,255,0.25); }

.map-body { display: grid; grid-template-columns: 360px 1fr; min-height: 620px; }

.shops-list { background: #fff; border-right: 1px solid var(--gray-200); height: 620px; overflow-y: auto; }
.list-header { display: flex; align-items: center; justify-content: space-between; padding: 20px; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: #fff; position: sticky; top: 0; z-index: 1; }
.green-header { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); }
.list-title { font-weight: 800; font-size: 15px; }
.list-count { background: #fff; color: #0f766e; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; text-align: center; }
.empty-icon { width: 64px; height: 64px; border-radius: 16px; background: var(--pink-100); color: var(--pink-700); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; margin-bottom: 16px; }
.green-empty { background: #ccfbf1; color: #0f766e; }
.empty-title { font-weight: 700; margin-bottom: 4px; color: var(--gray-800); }
.empty-desc { font-size: 13px; color: var(--gray-500); }

.shops-cards { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.shop-row { display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--gray-100); border-radius: 14px; cursor: pointer; transition: all 0.2s; }
.shop-row:hover { border-color: var(--pink-300); box-shadow: 0 4px 14px rgba(219,39,119,0.08); }
.shop-number { width: 28px; height: 28px; border-radius: 50%; background: var(--pink-100); color: var(--pink-700); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.shop-info { flex: 1; min-width: 0; }
.shop-name { font-weight: 700; font-size: 14px; color: var(--gray-900); margin-bottom: 2px; }
.shop-distance { font-size: 12px; color: var(--pink-600); font-weight: 700; }
.shop-address { font-size: 12px; color: var(--gray-500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.shop-link { font-size: 12px; font-weight: 700; color: var(--pink-600); white-space: nowrap; }
.map-frame { position: relative; min-height: 620px; }
.map-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; color: var(--gray-500); padding: 24px; text-align: center; }
.iw-content { font-size: 13px; color: var(--gray-800); }

@media (max-width: 1024px) {
  .map-body { grid-template-columns: 1fr; }
  .shops-list { height: auto; max-height: 400px; border-right: none; border-bottom: 1px solid var(--gray-200); }
  .map-frame { min-height: 400px; }
}
</style>
