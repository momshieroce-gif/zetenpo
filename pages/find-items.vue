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
            <NuxtLink :to="`/items/${item.id}`" class="shop-link" @click.stop>View</NuxtLink>
          </div>
        </div>
      </div>
      <div class="map-frame">
        <ClientOnly fallback="Loading map...">
          <GoogleMap ref="mapRef" v-if="apiKey" :api-key="apiKey" :center="center" :zoom="zoom" style="width: 100%; height: 100%" :map-id="mapId || undefined" :libraries="['marker', 'routes']">
            <AdvancedMarker :options="getLocationMarkerOptions()">
              <InfoWindow :options="{ headerContent: 'You are here', disableAutoPan: false }" v-model="showInfo"><div class="iw-content">Your current location</div></InfoWindow>
            </AdvancedMarker>
            <AdvancedMarker v-for="item in filteredItems" :key="item.id" :options="getStoreMarkerOptions(item)" @click="focusItem(item)">
              <InfoWindow v-if="selectedItem?.id === item.id" :options="{ headerContent: '&nbsp;&nbsp;&nbsp;' + item.shopName, disableAutoPan: false, closeButton: true }" @close="selectedItem = null">
                <div class="iw-content">
                  <div class="iw-header"><strong>{{ item.shopName }}</strong></div>
                  <div class="iw-name">{{ item.name }}</div>
                  <div class="iw-dist"><small>{{ item.distance.toFixed(1) }} km away</small></div>
                  <NuxtLink :to="`/items/${item.id}`" class="shop-link" @click.stop>View Product</NuxtLink>
                </div>
              </InfoWindow>
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
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Product, Shop } from '~/types';

useHead({
  title: 'Find Nearby Items | My Near Shops',
  meta: [
    { name: 'description', content: 'Search products across local stores on a live map.' },
  ],
});

const config = useRuntimeConfig().public;
const apiKey = config.googleMapsApiKey;
const mapId = config.googleMapsId;
const nuxtApp = useNuxtApp() as any;

type ResultItem = Product & { distance: number; shopName: string; storeLatitude: number; storeLongitude: number };

const lat = ref(14.609);
const lng = ref(120.994);
const userLat = ref(14.609);
const userLng = ref(120.994);
const zoom = ref(15);
const showInfo = ref(true);
const selectedItem = ref<ResultItem | null>(null);
const searchText = ref('');
const radius = ref(5);

const mapRef = ref<{ $mapObject?: any; map?: any; $map?: any } | null>(null);
const directions = ref<any>(null);
const directionsRenderer = ref<any>(null);

const center = computed(() => ({ lat: lat.value, lng: lng.value }));

const items = ref<ResultItem[]>([]);

const filteredItems = computed(() => {
  const q = searchText.value.toLowerCase().trim();
  return items.value
    .filter((i: ResultItem) => i.distance <= radius.value)
    .filter((i: ResultItem) => i.name.toLowerCase().includes(q) || i.shopName.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q))
    .sort((a: ResultItem, b: ResultItem) => a.distance - b.distance);
});

const getLocation = () => {
  if (process.client && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLat.value = position.coords.latitude;
      userLng.value = position.coords.longitude;
      lat.value = position.coords.latitude;
      lng.value = position.coords.longitude;
    }, () => {});
  }
};

const search = async () => {
  if (!process.client || !nuxtApp.$firebase?.db || !searchText.value.trim()) return;
  getLocation();
  const db = nuxtApp.$firebase.db;
  const q = searchText.value.toLowerCase().trim();
  const shopsSnap = await getDocs(collection(db, 'shops'));
  const results: ResultItem[] = [];
  for (const shopDoc of shopsSnap.docs) {
    const shop = { id: shopDoc.id, ...shopDoc.data() } as Shop;
    if (shop.deletedAt) continue;
    const d = getDistance(userLat.value, userLng.value, shop.latitude, shop.longitude);
    if (d > radius.value) continue;
    const productsQuery = query(collection(db, 'products'), where('shopId', '==', shop.id));
    const productsSnap = await getDocs(productsQuery);
    const matchedDoc = productsSnap.docs.find((p) => {
      const data = p.data() as Product;
      if (data.deletedAt) return false;
      return data.name?.toLowerCase().includes(q) || (data.category || '').toLowerCase().includes(q);
    });
    if (matchedDoc) {
      const product = { id: matchedDoc.id, ...matchedDoc.data() } as Product;
      results.push({ ...product, distance: d, shopName: shop.name, storeLatitude: shop.latitude, storeLongitude: shop.longitude });
    }
  }
  results.sort((a, b) => a.distance - b.distance);
  items.value = results;
};

const focusItem = (item: ResultItem) => {
  lat.value = item.storeLatitude;
  lng.value = item.storeLongitude;
  selectedItem.value = item;
  zoom.value = 17;
  requestDirections(item);
};

const selectItem = (item: ResultItem) => {
  selectedItem.value = item;
};

const setupDirectionsRenderer = (map: any) => {
  if (typeof window === 'undefined' || !(window as any).google?.maps?.DirectionsRenderer) {
    return;
  }
  if (directionsRenderer.value) {
    directionsRenderer.value.setMap(null);
  }
  directionsRenderer.value = new (window as any).google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: { strokeColor: '#4285F4', strokeWeight: 5 },
  });
  directionsRenderer.value.setMap(map);
  if (directions.value) {
    directionsRenderer.value.setDirections(directions.value);
  }
};

const requestDirections = (item: ResultItem) => {
  if (typeof window === 'undefined' || !(window as any).google?.maps?.DirectionsService) {
    return;
  }
  const directionsService = new (window as any).google.maps.DirectionsService();
  directionsService.route(
    {
      origin: { lat: userLat.value, lng: userLng.value },
      destination: { lat: item.storeLatitude, lng: item.storeLongitude },
      travelMode: 'DRIVING',
    },
    (result: any, status: any) => {
      if (status === 'OK' && result) {
        directions.value = result;
      } else {
        console.error('Error fetching directions:', status);
      }
    }
  );
};

watch(() => directions.value, (newDirections: any) => {
  if (newDirections) {
    const map = mapRef.value?.$mapObject || mapRef.value?.map || mapRef.value?.$map;
    if (map) {
      setupDirectionsRenderer(map);
    }
  }
});

const createLocationMarkerElement = (): HTMLElement => {
  if (typeof document === 'undefined') {
    return {} as HTMLElement;
  }
  const markerDiv = document.createElement('div');
  markerDiv.className = 'custom-marker location-marker';
  markerDiv.innerHTML = `
    <div class="marker-pulse"></div>
    <div class="marker-icon">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FFFFFF"/>
      </svg>
    </div>
  `;
  return markerDiv;
};

const createStoreMarkerElement = (): HTMLElement => {
  if (typeof document === 'undefined') {
    return {} as HTMLElement;
  }
  const markerDiv = document.createElement('div');
  markerDiv.className = 'custom-marker store-marker';
  markerDiv.innerHTML = `
    <div class="marker-pulse"></div>
    <div class="marker-icon">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="#FFFFFF"/>
      </svg>
    </div>
  `;
  return markerDiv;
};

const getLocationMarkerOptions = () => {
  return {
    position: { lat: userLat.value, lng: userLng.value },
    gmpDraggable: false,
    title: 'Your Location',
    content: createLocationMarkerElement(),
  };
};

const getStoreMarkerOptions = (item: ResultItem) => {
  return {
    position: { lat: item.storeLatitude, lng: item.storeLongitude },
    gmpDraggable: false,
    title: item.shopName,
    content: createStoreMarkerElement(),
  };
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

:deep(.custom-marker) { position: relative; width: 25px; height: 25px; cursor: pointer; transform-origin: center bottom; animation: markerBounce 2s ease-in-out infinite; }
:deep(.marker-icon) { position: relative; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 2; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); transition: transform 0.3s ease; }
:deep(.marker-icon svg) { width: 15px; height: 15px; }
:deep(.location-marker .marker-icon) { background: linear-gradient(135deg, #FBBC04 0%, #F57F17 100%); border: 3px solid #FFFFFF; }
:deep(.store-marker .marker-icon) { background: linear-gradient(135deg, #34A853 0%, #2E7D32 100%); border: 3px solid #FFFFFF; }
:deep(.marker-pulse) { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 48px; height: 48px; border-radius: 50%; z-index: 1; animation: markerPulse 2s ease-out infinite; }
:deep(.location-marker .marker-pulse) { background: rgba(251, 188, 4, 0.4); border: 2px solid rgba(251, 188, 4, 0.6); }
:deep(.store-marker .marker-pulse) { background: rgba(52, 168, 83, 0.4); border: 2px solid rgba(52, 168, 83, 0.6); }
:deep(.custom-marker:hover .marker-icon) { transform: scale(1.15); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4); }
@keyframes markerBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes markerPulse { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }

.iw-header { font-size: 14px; margin-bottom: 2px; }
.iw-name { font-weight: 700; color: var(--gray-900); margin-bottom: 4px; }
.iw-dist { font-size: 12px; color: var(--gray-500); margin-bottom: 6px; }
</style>
