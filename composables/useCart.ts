import { computed, watch, onMounted } from 'vue';
import type { Product } from '~/types';

const CART_KEY = 'mns-cart';
const DELIVERY_METHOD_KEY = 'mns-delivery-method';
const PAYMENT_METHOD_KEY = 'mns-payment-method';

export interface CartItem {
  product: Product;
  qty: number;
}

export const useCart = () => {
  const cart = useState<CartItem[]>('cart', () => []);

  const deliveryMethod = ref<string>('');
  const paymentMethod = ref<string>('');

  const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0));

  const saveCart = () => {
    if (process.client) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart.value));
    }
  };

  onMounted(() => {
    if (process.client) {
      try {
        const saved = localStorage.getItem(CART_KEY);
        if (saved) {
          const parsed: CartItem[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((i) => i.product && typeof i.qty === 'number')) {
            cart.value = parsed;
          }
        }
      } catch {
        // ignore
      }
      try {
        deliveryMethod.value = localStorage.getItem(DELIVERY_METHOD_KEY) || '';
      } catch {}
      try {
        paymentMethod.value = localStorage.getItem(PAYMENT_METHOD_KEY) || '';
      } catch {}
    }
  });

  watch(cart, saveCart, { deep: true });

  watch(deliveryMethod, (val) => {
    if (process.client) {
      localStorage.setItem(DELIVERY_METHOD_KEY, val || '');
    }
  });

  watch(paymentMethod, (val) => {
    if (process.client) {
      localStorage.setItem(PAYMENT_METHOD_KEY, val || '');
    }
  });

  const addToCart = (product: Product) => {
    const existing = cart.value.find((item) => item.product.id === product.id);
    if (existing) {
      existing.qty += 1;
      cart.value = [...cart.value];
    } else {
      cart.value = [...cart.value, { product, qty: 1 }];
    }
  };

  const removeFromCart = (index: number) => {
    const item = cart.value[index];
    if (!item) return;
    if (item.qty > 1) {
      item.qty -= 1;
      cart.value = [...cart.value];
    } else {
      cart.value = cart.value.filter((_, i) => i !== index);
    }
  };

  const clearCart = () => {
    cart.value = [];
  };

  return { cart, cartCount, addToCart, removeFromCart, clearCart, deliveryMethod, paymentMethod };
};
