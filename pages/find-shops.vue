<template>
  <div class="map-page">
    <div class="map-hero">
      <div class="map-hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="grid"></div>
      </div>
      <div class="container map-hero-inner">
        <div class="map-hero-left">
          <div class="map-hero-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff"/></svg>
          </div>
          <div>
            <div class="map-hero-label">Live Map</div>
            <h1 class="map-hero-title">Find Nearby Shops</h1>
            <p class="map-hero-desc">Discover verified local stores around you and get directions in seconds.</p>
          </div>
        </div>
        <div class="map-hero-stats">
          <div class="stat-box"><div class="stat-box-value">{{ filteredShops.length }}</div><div class="stat-box-label">{{ filteredShops.length === 1 ? 'Shop' : 'Shops' }} Found</div></div>
          <div class="stat-divider"></div>
          <div class="stat-box"><div class="stat-box-value">{{ radius }}</div><div class="stat-box-label">Search Radius (km)</div></div>
        </div>
      </div>
      <div class="container action-bar">
        <button class="btn btn-ghost-action" @click="getLocation">My Location</button>
        <button class="btn btn-primary" :disabled="isSearching" @click="search">
          <span v-if="isSearching">Searching...</span>
          <span v-else>Find Shops</span>
        </button>
        <input v-model="searchText" type="text" class="input search-input" placeholder="Search shops by name..." />
        <select v-model="radius" class="input radius-select">
          <option v-for="r in [5, 10, 15, 20]" :key="r" :value="r">{{ r }} km</option>
        </select>
      </div>
    </div>

    <div class="map-body">
      <div class="shops-list">
        <div class="list-header">
          <div class="list-title">Nearby Shops</div>
          <div class="list-count" v-if="filteredShops.length">{{ filteredShops.length }}</div>
        </div>
        <div v-if="!filteredShops.length" class="empty-state">
          <div class="empty-icon">S</div>
          <div class="empty-title">No shops found</div>
          <div class="empty-desc">Click "Find Shops" to discover nearby stores</div>
        </div>
        <div v-else class="shops-cards">
          <div v-for="(shop, idx) in filteredShops" :key="shop.id" class="shop-row" @click="focusShop(shop)">
            <div class="shop-number">{{ Number(idx) + 1 }}</div>
            <div class="shop-info">
              <div class="shop-name">{{ shop.name }}</div>
              <div class="shop-distance" v-if="shop.distance !== null">{{ shop.distance.toFixed(1) }} km away</div>
              <div class="shop-address" v-if="shop.address">{{ shop.address }}</div>
            </div>
            <NuxtLink :to="`/shops/${shop.id}`" class="shop-link" @click.stop>View</NuxtLink>
          </div>
        </div>
      </div>
      <div class="map-frame">
        <ClientOnly fallback="Loading map...">
          <GoogleMap ref="mapRef" v-if="apiKey" :api-key="apiKey" :center="center" :zoom="zoom" style="width: 100%; height: 100%" :map-id="mapId || undefined" :disable-default-ui="false" :draggable="true" :clickable-icons="false" :libraries="['places', 'marker', 'routes']">
            <AdvancedMarker :options="getLocationMarkerOptions()">
              <InfoWindow :options="{ headerContent: 'You are here', disableAutoPan: false }" v-model="showInfo">
              </InfoWindow>
            </AdvancedMarker>
            <AdvancedMarker v-for="shop in filteredShops" :key="shop.id" :options="getStoreMarkerOptions(shop)" @click="selectShop(shop)">
              <InfoWindow v-if="selectedShop?.id === shop.id" :options="{ headerContent: shop.name, disableAutoPan: false, closeButton: true }" @close="selectedShop = null">
                <div class="iw-content"><small>{{ shop.distance?.toFixed(1) }} km away</small><br><NuxtLink :to="`/shops/${shop.id}`" class="iw-view-link" style="color: darkblue; font-weight: bold;" @click.stop>View Store</NuxtLink></div>
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
import { collection, getDocs } from '~/utils/firestoreLogger';
import type { Shop } from '~/types';

useHead({
  title: 'Find Nearby Shops | My Near Shops',
  meta: [
    { name: 'description', content: 'Locate local shops on a live map with My Near Shops.' },
  ],
});

const config = useRuntimeConfig().public;
const apiKey = config.googleMapsApiKey;
const mapId = config.googleMapsId;
const userLat = ref(14.609);
const userLng = ref(120.994);
const lat = ref(14.609);
const lng = ref(120.994);
const zoom = ref(15);
const showInfo = ref(true);
const selectedShop = ref<ShopWithDistance | null>(null);
const searchText = ref('');
const radius = ref(5);
const isSearching = ref(false);

const center = computed(() => ({ lat: lat.value, lng: lng.value }));

type ShopWithDistance = Shop & { distance: number };

const nuxtApp = useNuxtApp() as any;

interface GoogleMapRef {
  $mapObject?: any;
  map?: any;
  $map?: any;
}
const mapRef = ref<GoogleMapRef | null>(null);
const directions = ref<any>(null);
const directionsRenderer = ref<any>(null);

const shops = ref<ShopWithDistance[]>([]);

const filteredShops = computed(() => {
  const q = searchText.value.toLowerCase();
  return shops.value.filter((s: ShopWithDistance) => s.name.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q));
});

const getLocation = () => {
  if (process.client && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLat.value = position.coords.latitude;
      userLng.value = position.coords.longitude;
      lat.value = position.coords.latitude;
      lng.value = position.coords.longitude;
    }, () => {
      // fallback
    });
  }
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const search = async () => {
  if (isSearching.value) return;
  isSearching.value = true;
  getLocation();

  try {
    if (process.client && nuxtApp.$firebase?.db) {
      const db = nuxtApp.$firebase.db;
      const snapshot = await getDocs(collection(db, 'shops'));
      const fetched: ShopWithDistance[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as Shop;
        if (data.deletedAt) return;
        const d = getDistance(userLat.value, userLng.value, data.latitude, data.longitude);
        const { id: _, ...shopData } = data;
        fetched.push({ ...shopData, id: doc.id, distance: d });
      });

      // Sort by distance
      fetched.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      shops.value = fetched.filter((s) => s.distance <= radius.value);
    }
  } finally {
    isSearching.value = false;
  }
};

const focusShop = (shop: ShopWithDistance) => {
  lat.value = shop.latitude;
  lng.value = shop.longitude;
  selectedShop.value = shop;
  zoom.value = 17;
  requestDirections(shop);
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

const requestDirections = (shop: ShopWithDistance) => {
  if (typeof window === 'undefined' || !(window as any).google?.maps?.DirectionsService) {
    return;
  }
  const directionsService = new (window as any).google.maps.DirectionsService();
  directionsService.route(
    {
      origin: { lat: userLat.value, lng: userLng.value },
      destination: { lat: shop.latitude, lng: shop.longitude },
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

const selectShop = (shop: ShopWithDistance) => {
  selectedShop.value = shop;
  requestDirections(shop);
};

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
    gmpDraggable: true,
    title: 'Your Location',
    content: createLocationMarkerElement(),
  };
};

const getStoreMarkerOptions = (shop: ShopWithDistance) => {
  return {
    position: { lat: shop.latitude, lng: shop.longitude },
    gmpDraggable: false,
    title: shop.name,
    content: createStoreMarkerElement(),
  };
};

const zoomIn = () => {
  const map = mapRef.value?.$mapObject || mapRef.value?.map || mapRef.value?.$map;
  if (map) {
    const currentZoomLevel = map.getZoom() || zoom.value;
    if (currentZoomLevel < 21) {
      const newZoom = currentZoomLevel + 1;
      map.setZoom(newZoom);
      zoom.value = newZoom;
    }
  }
};

const zoomOut = () => {
  const map = mapRef.value?.$mapObject || mapRef.value?.map || mapRef.value?.$map;
  if (map) {
    const currentZoomLevel = map.getZoom() || zoom.value;
    if (currentZoomLevel > 1) {
      const newZoom = currentZoomLevel - 1;
      map.setZoom(newZoom);
      zoom.value = newZoom;
    }
  }
};

const addZoomControls = (map: any) => {
  const zoomControlDiv = document.createElement('div');
  zoomControlDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      pointer-events: auto;
    `;

  const zoomInButton = document.createElement('button');
  zoomInButton.style.cssText = `
      width: 40px;
      height: 40px;
      border: none;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      padding: 0;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      user-select: none;
      border-bottom: 1px solid #e0e0e0;
    `;
  zoomInButton.innerHTML = '<span style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; line-height: 1;">+</span>';
  zoomInButton.title = 'Zoom in';
  zoomInButton.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomIn();
  });
  zoomInButton.addEventListener('mouseenter', () => {
    zoomInButton.style.background = '#f5f5f5';
  });
  zoomInButton.addEventListener('mouseleave', () => {
    zoomInButton.style.background = 'white';
  });
  zoomInButton.addEventListener('mousedown', () => {
    zoomInButton.style.background = '#e0e0e0';
    zoomInButton.style.transform = 'scale(0.95)';
  });
  zoomInButton.addEventListener('mouseup', () => {
    zoomInButton.style.background = '#f5f5f5';
    zoomInButton.style.transform = 'scale(1)';
  });

  const zoomOutButton = document.createElement('button');
  zoomOutButton.style.cssText = `
      width: 40px;
      height: 40px;
      border: none;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      padding: 0;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      user-select: none;
    `;
  zoomOutButton.innerHTML = '<span style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; line-height: 1;">−</span>';
  zoomOutButton.title = 'Zoom out';
  zoomOutButton.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomOut();
  });
  zoomOutButton.addEventListener('mouseenter', () => {
    zoomOutButton.style.background = '#f5f5f5';
  });
  zoomOutButton.addEventListener('mouseleave', () => {
    zoomOutButton.style.background = 'white';
  });
  zoomOutButton.addEventListener('mousedown', () => {
    zoomOutButton.style.background = '#e0e0e0';
    zoomOutButton.style.transform = 'scale(0.95)';
  });
  zoomOutButton.addEventListener('mouseup', () => {
    zoomOutButton.style.background = '#f5f5f5';
    zoomOutButton.style.transform = 'scale(1)';
  });

  zoomControlDiv.appendChild(zoomInButton);
  zoomControlDiv.appendChild(zoomOutButton);

  setTimeout(() => {
    const mapContainer = map.getDiv();
    if (mapContainer) {
      mapContainer.appendChild(zoomControlDiv);
    }
  }, 200);
};

const waitForMapReady = () => {
  if (!process.client) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const checkMapReady = () => {
      const map = mapRef.value?.$mapObject || mapRef.value?.map || mapRef.value?.$map;
      if (map) {
        addZoomControls(map);
        resolve(void 0);
      } else {
        setTimeout(checkMapReady, 200);
      }
    };
    checkMapReady();
  });
};

onMounted(() => {
  getLocation();
  search();
  waitForMapReady();
});
</script>

<style scoped>
.map-page {
  background: #fff;
}

.map-hero {
  position: relative;
  background: linear-gradient(145deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%);
  color: #fff;
  padding: 40px 0 28px;
  overflow: hidden;
}

.map-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  animation: floatOrb 12s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: rgba(139, 92, 246, 0.3);
  top: -200px;
  right: -100px;
  opacity: 1;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: rgba(99, 102, 241, 0.25);
  bottom: 40px;
  left: -60px;
  animation-delay: 5s;
  opacity: 1;
}

@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -30px); }
}

.grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}

.map-hero-inner {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  z-index: 1;
}

.map-hero-left {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.map-hero-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-hero-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 6px;
}

.map-hero-title {
  font-size: 32px;
  font-weight: 900;
  margin: 0 0 8px;
}

.map-hero-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  margin: 0;
}

.map-hero-stats {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 16px 24px;
  backdrop-filter: blur(10px);
}

.stat-box {
  text-align: center;
  padding: 0 20px;
}

.stat-box-value {
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-box-label {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255,255,255,0.15);
}

.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.search-input {
  flex: 1;
  min-width: 220px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  border-color: rgba(255,255,255,0.2);
}

.search-input::placeholder {
  color: rgba(255,255,255,0.6);
}

.search-input:focus {
  border-color: rgba(255,255,255,0.5);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.1);
}

.radius-select {
  width: 100px;
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.radius-select option {
  background: #fff;
  color: #1e1b4b;
}

.btn-ghost-action {
  background: rgba(255,255,255,0.12);
  color: #fff;
  border: 1.5px solid rgba(255,255,255,0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1a1a1a;
  box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.45);
}

.map-body {
  display: grid;
  grid-template-columns: 360px 1fr;
  min-height: 620px;
}

.shops-list {
  background: #fff;
  border-right: 1px solid var(--gray-200);
  height: 620px;
  overflow-y: auto;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}

.list-title {
  font-weight: 800;
  font-size: 15px;
}

.list-count {
  background: #fbbf24;
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 14px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 16px;
}

.empty-title {
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--gray-800);
}

.empty-desc {
  font-size: 13px;
  color: var(--gray-500);
}

.shops-cards {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shop-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
}

.shop-row:hover {
  background: #ede9fe;
  border-color: #c4b5fd;
  transform: translateX(3px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.shop-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #312e81 0%, #6d28d9 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.shop-info {
  flex: 1;
  min-width: 0;
}

.shop-name {
  font-weight: 700;
  font-size: 14px;
  color: var(--gray-900);
  margin-bottom: 2px;
}

.shop-distance {
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

.shop-address {
  font-size: 12px;
  color: var(--gray-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shop-link {
  font-size: 12px;
  font-weight: 700;
  color: #4c1d95;
  white-space: nowrap;
}

.map-frame {
  position: relative;
  min-height: 620px;
}

.map-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  padding: 24px;
  text-align: center;
}

.iw-content {
  font-size: 13px;
  color: var(--gray-800);
}

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
</style>
