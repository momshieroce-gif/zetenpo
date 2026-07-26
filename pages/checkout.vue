<template>
  <div class="checkout-page">
    <div class="checkout-hero">
      <div class="hero-bg">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
        <div class="hero-grid"></div>
      </div>
      <div class="hero-inner container">
        <NuxtLink to="/cart" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>
          <span>Back</span>
        </NuxtLink>
        <div class="hero-content">
          <div class="hero-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#fff"/></svg>
          </div>
          <div>
            <div class="hero-title">Checkout</div>
            <div class="hero-sub">Review your order and confirm delivery details</div>
          </div>
        </div>
      </div>
    </div>

    <div class="checkout-body">
      <div class="container">
        <div v-if="!cart.length" class="empty-state">
          <div class="empty-title">Your cart is empty</div>
          <NuxtLink to="/cart" class="btn btn-primary">Back to Cart</NuxtLink>
        </div>
        <div v-else-if="hasMultipleShops" class="error-state">
          <div class="error-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg>
          </div>
          <div class="error-title">Multiple stores detected</div>
          <div class="error-desc">All items must come from the same store. Please return to your cart and remove items from other stores.</div>
          <NuxtLink to="/cart" class="btn btn-primary">Back to Cart</NuxtLink>
        </div>
        <div v-else class="checkout-layout">
          <div class="checkout-main">
            <div class="panel-card">
              <div class="panel-header">
                <div class="panel-header-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff"/></svg>
                </div>
                <div class="panel-header-text">
                  <div class="panel-title">Delivery Location</div>
                  <div class="panel-subtitle">Set where you want your order delivered</div>
                </div>
              </div>
              <div class="map-search-wrap">
                <div class="map-search-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>
                </div>
                <input ref="searchInputRef" v-model="searchLocation" type="text" class="input map-search-input" placeholder="Search for a delivery location..." />
                <button v-if="searchLocation" class="map-search-clear" type="button" @click="clearSearch">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/></svg>
                </button>
              </div>
              <div class="map-wrap">
                <ClientOnly fallback="Loading map...">
                  <GoogleMap v-if="apiKey" ref="mapRef" :api-key="apiKey" :map-id="mapId || undefined" class="checkout-map" :center="mapCenter" :zoom="currentZoom" :disable-default-ui="false" :draggable="true" :clickable-icons="false" :libraries="['places', 'marker', 'routes']">
                    <AdvancedMarker :options="userMarkerOptions">
                      <InfoWindow v-model="showUserInfo" :options="{ headerContent: 'You are here', disableAutoPan: false }">
                      </InfoWindow>
                    </AdvancedMarker>
                    <AdvancedMarker v-if="shop" :options="storeMarkerOptions">
                      <InfoWindow v-model="showStoreInfo" :options="{ headerContent: shop.name, disableAutoPan: false }">
                      </InfoWindow>
                    </AdvancedMarker>
                  </GoogleMap>
                  <div v-else class="map-placeholder">Add a Google Maps API key in your environment to view the map.</div>
                  <div class="map-controls">
                    <button type="button" class="map-zoom-btn" @click="zoomIn">+</button>
                    <button type="button" class="map-zoom-btn" @click="zoomOut">−</button>
                  </div>
                </ClientOnly>
              </div>
              <div class="map-footer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 7h2v6h-2V7zm1 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" fill="currentColor"/></svg>
                <span>Allow location access so we can deliver to your exact address.</span>
              </div>
            </div>
          </div>

          <div class="checkout-sidebar">
            <div class="panel-card summary-panel">
              <div class="panel-header">
                <div class="panel-header-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.82 14l-.76-3.18H3c-1.1 0-2-.9-2-2 0-.56.23-1.06.59-1.42L5.29 5.71l.71-2.12h13l-.65 1.93c.47.28.82.8.82 1.41 0 .94-.76 1.7-1.7 1.7h-.55l-.62 2.62H7.82zM6.16 8h11.15l-1.09-2.5H7.41L6.16 8z" fill="#fff"/></svg>
                </div>
                <div class="panel-header-text">
                  <div class="panel-title">Order Summary</div>
                  <div class="panel-subtitle">{{ cartCount }} {{ cartCount === 1 ? 'item' : 'items' }}</div>
                </div>
              </div>
              <div class="summary-body">
                <div class="summary-line">
                  <span>Subtotal</span>
                  <span>₱{{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="summary-line">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/></svg>
                    {{ deliveryChargeLabel }}
                  </span>
                  <span>₱{{ deliveryCharge.toFixed(2) }}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-total-row">
                  <span>Total</span>
                  <span class="summary-total-value">₱{{ (subtotal + deliveryCharge).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="panel-card contact-panel">
              <div class="panel-header">
                <div class="panel-header-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#fff"/></svg>
                </div>
                <div class="panel-header-text">
                  <div class="panel-title">Contact Information</div>
                  <div class="panel-subtitle">We'll send order updates here</div>
                </div>
              </div>
              <form class="contact-form" @submit.prevent="processOrder">
                <div class="form-field-label">Receiver's Mobile Number</div>
                <div class="phone-input-wrap">
                  <span class="phone-prefix">+63</span>
                  <input v-model="mobile" type="tel" class="input" placeholder="9XX XXX XXXX" maxlength="12" />
                </div>
                <div v-if="mobileError" class="field-error">{{ mobileError }}</div>
                <div class="form-field-label">Order Note <span class="form-field-optional">(Optional)</span></div>
                <textarea v-model="note" class="input" rows="4" placeholder="Add any special instructions for your order..."></textarea>
                <button type="submit" class="complete-btn" :disabled="isSubmitting">
                  <svg v-if="!isSubmitting" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>
                  <span v-if="!isSubmitting">Complete Order</span>
                  <span v-else>Processing...</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GoogleMap, AdvancedMarker, InfoWindow } from 'vue3-google-map';
import { ref, computed, watch, onMounted } from 'vue';
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import type { Shop } from '~/types';

definePageMeta({ middleware: 'auth' });

useHead({
  title: 'Checkout | My Near Shops',
});

const { cart, cartCount, clearCart, deliveryMethod, paymentMethod } = useCart();
const nuxtApp = useNuxtApp() as any;
const config = useRuntimeConfig().public;
const apiKey = config.googleMapsApiKey;
const mapId = config.googleMapsId;

const shopId = computed(() => cart.value[0]?.product?.shopId || '');
const hasMultipleShops = computed(() => new Set(cart.value.map((i) => i.product.shopId)).size > 1);
const shop = ref<Shop | null>(null);
const userLat = ref(14.609);
const userLng = ref(120.994);
const searchedLat = ref<number | null>(null);
const searchedLng = ref<number | null>(null);
const currentZoom = ref(15);
const mobile = ref('');
const note = ref('');
const mobileError = ref('');
const isSubmitting = ref(false);
const showUserInfo = ref(true);
const showStoreInfo = ref(true);
const mapRef = ref<any>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const searchLocation = ref('');
const deliveryChargeSettings = ref<{ standard_delivery_charge: number; amount_per_km: number }>({ standard_delivery_charge: 50, amount_per_km: 10 });
let autocomplete: any = null;
let directionsRenderer: any = null;
let directionsService: any = null;

const subtotal = computed(() => cart.value.reduce((sum, item) => sum + Number(item.product.price || 0) * item.qty, 0));

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const distance = computed(() => (shop.value ? getDistance(userLat.value, userLng.value, shop.value.latitude, shop.value.longitude) : 0));
const deliveryCharge = computed(() => {
  if (deliveryMethod.value === 'pickup') return 0;
  return Math.round((deliveryChargeSettings.value.standard_delivery_charge + distance.value * deliveryChargeSettings.value.amount_per_km) * 100) / 100;
});
const deliveryChargeLabel = computed(() => deliveryMethod.value === 'pickup' ? 'Pick up from store' : 'Delivery Charge');

const mapCenter = computed(() => {
  if (searchedLat.value !== null && searchedLng.value !== null) {
    return { lat: searchedLat.value, lng: searchedLng.value };
  }
  if (shop.value) {
    return { lat: (userLat.value + shop.value.latitude) / 2, lng: (userLng.value + shop.value.longitude) / 2 };
  }
  return { lat: userLat.value, lng: userLng.value };
});

const fetchShop = async () => {
  if (!process.client || !nuxtApp.$firebase?.db || !shopId.value) return;
  const snap = await getDoc(doc(nuxtApp.$firebase.db, 'shops', shopId.value));
  if (snap.exists()) {
    shop.value = { id: snap.id, ...(snap.data() as Omit<Shop, 'id'>) };
  }
};

const fetchDeliveryCharge = async () => {
  if (!process.client || !nuxtApp.$firebase?.db || !shopId.value) return;
  const q = query(collection(nuxtApp.$firebase.db, 'delivery_charge'), where('store_id', '==', shopId.value));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const data = snap.docs[0].data() as any;
    deliveryChargeSettings.value = {
      standard_delivery_charge: Number(data.standard_delivery_charge) || 0,
      amount_per_km: Number(data.amount_per_km) || 0,
    };
  }
};

const getUserLocation = () => {
  if (process.client && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLat.value = position.coords.latitude;
        userLng.value = position.coords.longitude;
      },
      () => {}
    );
  }
};

const waitForMapReady = () => {
  if (!process.client) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const check = () => {
      const map = mapRef.value?.$mapObject || mapRef.value?.map || mapRef.value?.$map;
      if (map) {
        resolve();
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  });
};

const initAutocomplete = () => {
  if (!process.client || !searchInputRef.value) return;
  const win = window as any;
  if (win.google?.maps?.places) {
    autocomplete = new win.google.maps.places.Autocomplete(searchInputRef.value, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['geocode', 'establishment'],
      componentRestrictions: { country: 'PH' },
    });
    autocomplete.addListener('place_changed', onPlaceChanged);
  }
};

const onPlaceChanged = () => {
  if (!autocomplete) return;
  const place = autocomplete.getPlace();
  if (!place?.geometry?.location) return;
  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();
  userLat.value = lat;
  userLng.value = lng;
  searchedLat.value = lat;
  searchedLng.value = lng;
  searchLocation.value = place.formatted_address || place.name || '';
  currentZoom.value = 16;
  showUserInfo.value = true;
  drawRoute();
};

const clearSearch = () => {
  searchLocation.value = '';
  searchedLat.value = null;
  searchedLng.value = null;
  if (directionsRenderer) {
    directionsRenderer.setDirections({ routes: [] });
  }
};

const drawRoute = () => {
  if (!process.client || !shop.value) return;
  const win = window as any;
  const map = mapRef.value?.$mapObject || mapRef.value?.map || mapRef.value?.$map;
  if (!win.google?.maps?.DirectionsService || !map) return;
  if (!directionsRenderer) {
    directionsRenderer = new win.google.maps.DirectionsRenderer({ map, suppressMarkers: true, preserveViewport: true });
  }
  if (!directionsService) {
    directionsService = new win.google.maps.DirectionsService();
  }
  directionsService.route(
    {
      origin: { lat: shop.value.latitude, lng: shop.value.longitude },
      destination: { lat: userLat.value, lng: userLng.value },
      travelMode: 'DRIVING',
    },
    (result: any, status: string) => {
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result);
        const bounds = result.routes?.[0]?.bounds;
        if (bounds) {
          map.fitBounds(bounds, 60);
        }
      } else {
        console.error('Error fetching directions:', status);
      }
    }
  );
};

const createUserMarkerElement = (): HTMLElement => {
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

const userMarkerOptions = computed(() => ({
  position: { lat: userLat.value, lng: userLng.value },
  title: 'Your Location',
  gmpDraggable: false,
  content: createUserMarkerElement(),
}));

const storeMarkerOptions = computed(() => ({
  position: { lat: shop.value!.latitude, lng: shop.value!.longitude },
  title: shop.value!.name,
  gmpDraggable: false,
  content: createStoreMarkerElement(),
}));

const zoomIn = () => {
  const map = mapRef.value?.$mapObject || mapRef.value?.map || mapRef.value?.$map;
  if (map) {
    const currentZoomLevel = map.getZoom() || currentZoom.value;
    if (currentZoomLevel < 21) {
      const newZoom = currentZoomLevel + 1;
      map.setZoom(newZoom);
      currentZoom.value = newZoom;
    }
  }
};

const zoomOut = () => {
  const map = mapRef.value?.$mapObject || mapRef.value?.map || mapRef.value?.$map;
  if (map) {
    const currentZoomLevel = map.getZoom() || currentZoom.value;
    if (currentZoomLevel > 1) {
      const newZoom = currentZoomLevel - 1;
      map.setZoom(newZoom);
      currentZoom.value = newZoom;
    }
  }
};

const isValidMobile = (val: string) => {
  const cleaned = val.replace(/\s/g, '');
  return /^9\d{9}$/.test(cleaned);
};

watch(mobile, (val) => {
  if (mobileError.value && isValidMobile(val)) {
    mobileError.value = '';
  }
});

const processOrder = async () => {
  mobileError.value = '';
  if (!isValidMobile(mobile.value)) {
    mobileError.value = 'Please enter a valid mobile number.';
    return;
  }
  const db = nuxtApp.$firebase?.db;
  const auth = nuxtApp.$firebase?.auth;
  if (!db || !shop.value || !cart.value.length) {
    mobileError.value = 'Order information is incomplete. Please try again.';
    return;
  }
  isSubmitting.value = true;
  try {
    const userId = auth?.currentUser?.uid || '';
    const orderItems = cart.value.map((item) => {
      const price = Number(item.product.price || 0);
      const qty = item.qty;
      return {
        product_id: item.product.id,
        shop_id: item.product.shopId,
        name: item.product.name,
        price,
        qty,
        subtotal: parseFloat((price * qty).toFixed(2)),
      };
    });
    const subtotalValue = parseFloat(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    const deliveryChargeValue = deliveryCharge.value;
    const totalValue = parseFloat((subtotalValue + deliveryChargeValue).toFixed(2));
    const orderNumber = `TRX-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    await addDoc(collection(db, 'transactions'), {
      order_number: orderNumber,
      user_id: userId,
      store_id: shop.value.id,
      user_location: { latitude: userLat.value, longitude: userLng.value },
      store_location: { latitude: shop.value.latitude, longitude: shop.value.longitude },
      delivery_location: { latitude: userLat.value, longitude: userLng.value, address: searchLocation.value || '' },
      delivery_method: deliveryMethod.value || 'delivery',
      payment_method: paymentMethod.value || 'cash',
      items: orderItems,
      subtotal: subtotalValue,
      delivery_charge: deliveryChargeValue,
      total: totalValue,
      customer_mobile: mobile.value.replace(/\s/g, ''),
      customer_note: note.value,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    clearCart();
    navigateTo('/cart');
  } catch (e: any) {
    mobileError.value = e?.message || 'Order failed. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  getUserLocation();
  fetchShop();
  fetchDeliveryCharge();
  waitForMapReady().then(() => { initAutocomplete(); drawRoute(); });
});

watch([shop, userLat, userLng], () => drawRoute());
</script>

<style scoped>
.checkout-page {
  background: #f4f5f7;
  min-height: 100vh;
}

.checkout-hero {
  position: relative;
  background: linear-gradient(145deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%);
  overflow: hidden;
  padding: 40px 0 28px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  animation: heroFloat 12s ease-in-out infinite;
}

.orb-1 {
  width: 420px;
  height: 420px;
  background: rgba(139, 92, 246, 0.28);
  top: -180px;
  right: -60px;
}

.orb-2 {
  width: 220px;
  height: 220px;
  background: rgba(99, 102, 241, 0.2);
  bottom: -60px;
  left: -40px;
  animation-delay: 6s;
}

@keyframes heroFloat {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(14px, -18px); }
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}

.hero-inner {
  position: relative;
  z-index: 1;
}

.back-link {
  color: #fbbf24;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 0.85;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-title {
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.hero-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
  margin-top: 3px;
}

.checkout-body {
  padding: 32px 0;
}

.empty-state,
.error-state {
  text-align: center;
  padding: 80px 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.empty-title,
.error-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--gray-900);
}

.error-state {
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.error-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #fee2e2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.error-desc {
  color: #6b7280;
  margin-bottom: 24px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 390px;
  gap: 28px;
  align-items: start;
}

.checkout-main,
.checkout-sidebar {
  min-width: 0;
}

.panel-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  margin-bottom: 24px;
}

.panel-card:last-child {
  margin-bottom: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.panel-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.panel-header-text {
  flex: 1;
  min-width: 0;
}

.panel-title {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.2px;
}

.panel-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.map-search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 0;
  position: relative;
}

.map-search-icon {
  position: absolute;
  left: 28px;
  color: #9ca3af;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.map-search-input {
  flex: 1;
  padding: 12px 44px 12px 40px;
  border: 1.5px solid var(--gray-200);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background: #fff;
}

.map-search-input:focus {
  border-color: var(--pink-400);
  box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.15);
}

.map-search-clear {
  position: absolute;
  right: 28px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-search-clear:hover {
  color: #6b7280;
}

.map-wrap {
  padding: 16px;
  position: relative;
}

.map-controls {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 10;
}

.map-zoom-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  transition: background 0.2s ease;
}

.map-zoom-btn:first-child {
  border-bottom: 1px solid #e5e7eb;
}

.map-zoom-btn:hover {
  background: #f3f4f6;
}

.checkout-map {
  height: 480px;
  width: 100%;
  display: block;
  border-radius: 14px;
  overflow: hidden;
}

.map-placeholder {
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  background: #f9fafb;
  border-radius: 14px;
}

.map-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f9fafb;
  border-top: 1px solid #f0f1f3;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.summary-body,
.contact-form {
  padding: 20px 24px 24px;
}

.summary-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #f3f4f6;
  font-size: 14px;
  color: #6b7280;
}

.summary-line span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.summary-line:last-of-type {
  border-bottom: none;
}

.summary-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
  margin: 10px 0 14px;
}

.summary-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.summary-total-value {
  font-size: 24px;
  font-weight: 900;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.contact-form .form-field-label {
  font-size: 11px;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.contact-form .form-field-label:not(:first-child) {
  margin-top: 20px;
}

.form-field-optional {
  font-weight: 500;
  color: #c4c9d4;
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
}

.phone-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-sm);
  background: #fff;
  transition: all 0.2s ease;
}

.phone-input-wrap:focus-within {
  border-color: var(--pink-400);
  box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.15);
}

.phone-prefix {
  padding: 12px 0 12px 14px;
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-700);
}

.phone-input-wrap input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 14px;
  font-size: 15px;
  outline: none;
}

.field-error {
  color: #ef4444;
  font-size: 13px;
  font-weight: 600;
  margin-top: 8px;
}

textarea.input {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.complete-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
  transition: all 0.25s ease;
  letter-spacing: 0.3px;
  margin-top: 24px;
}

.complete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(99, 102, 241, 0.45);
}

.complete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

:deep(.custom-marker) {
  position: relative;
  width: 25px;
  height: 25px;
  cursor: pointer;
  transform-origin: center bottom;
  animation: markerBounce 2s ease-in-out infinite;
}

:deep(.marker-icon) {
  position: relative;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

:deep(.marker-icon svg) {
  width: 15px;
  height: 15px;
}

:deep(.location-marker .marker-icon) {
  background: linear-gradient(135deg, #FBBC04 0%, #F57F17 100%);
  border: 3px solid #fff;
}

:deep(.store-marker .marker-icon) {
  background: linear-gradient(135deg, #34A853 0%, #2E7D32 100%);
  border: 3px solid #fff;
}

:deep(.marker-pulse) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  z-index: 1;
  animation: markerPulse 2s ease-out infinite;
}

:deep(.location-marker .marker-pulse) {
  background: rgba(251, 188, 4, 0.4);
  border: 2px solid rgba(251, 188, 4, 0.6);
}

:deep(.store-marker .marker-pulse) {
  background: rgba(52, 168, 83, 0.4);
  border: 2px solid rgba(52, 168, 83, 0.6);
}

:deep(.custom-marker:hover .marker-icon) {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

@keyframes markerBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes markerPulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

@media (max-width: 1100px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .checkout-sidebar {
    order: -1;
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .checkout-hero {
    padding: 24px 0 20px;
  }
  .hero-title {
    font-size: 22px;
  }
  .checkout-body {
    padding: 20px 0;
  }
  .checkout-map,
  .map-placeholder {
    height: 360px;
  }
  .summary-total-value {
    font-size: 22px;
  }
  .complete-btn {
    height: 48px;
    font-size: 14px;
  }
}
</style>
