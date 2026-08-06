<template>
  <div class="chat-page">
    <div class="chat-header">
      <NuxtLink :to="product?.id ? `/items/${product.id}` : '/dashboard'" class="back-link">← Back to item</NuxtLink>
      <NuxtLink to="/dashboard/inquiries" class="chat-title">My Product Inquiries</NuxtLink>
    </div>
    <div v-if="loading" class="loading">Loading chat...</div>
    <div v-else-if="loadError" class="error-state">
      <div class="empty-icon">!</div>
      <div class="empty-title">Permission error</div>
      <p class="error-text">{{ loadError }}</p>
    </div>
    <div v-else-if="!chat" class="empty-state">
      <div class="empty-icon">?</div>
      <div class="empty-title">Chat not found</div>
    </div>
    <div v-else class="chat-content">
      <div class="chat-meta">
        <div>Product: {{ product?.name || 'Unknown' }}</div>
        <div>Shop: {{ shop?.name || 'Unknown' }}</div>
      </div>
      <div class="messages">
        <div v-for="message in messages" :key="message.id" :class="['message', message.senderType]">
          <div class="message-bubble">
            <p>{{ message.text }}</p>
            <span class="message-time">{{ formatTimestamp(message.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import type { Chat, ChatMessage, Product, Shop } from '~/types';

const route = useRoute();
const chatId = route.params.chatId as string;
const nuxtApp = useNuxtApp() as any;
const authStore = useAuthStore();
const chat = ref<Chat | null>(null);
const product = ref<Product | null>(null);
const shop = ref<Shop | null>(null);
const messages = ref<ChatMessage[]>([]);
const loading = ref(true);
const loadError = ref('');

const formatTimestamp = (value: any) => {
  if (!value) return '';
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString();
};

const handleFirestoreError = (error: any, path: string) => {
  if (error?.code === 'permission-denied') {
    loadError.value = `Firestore permission denied for path: ${path}`;
  } else {
    loadError.value = `Failed to load ${path}: ${error?.message || 'Unknown error'}`;
  }
};

const loadChat = async () => {
  if (!process.client || !nuxtApp.$firebase?.db) return;
  const db = nuxtApp.$firebase.db;
  loading.value = true;
  loadError.value = '';

  let chatDoc;
  try {
    chatDoc = await getDoc(doc(db, 'chats', chatId));
  } catch (error: any) {
    handleFirestoreError(error, `chats/${chatId}`);
    loading.value = false;
    return;
  }

  if (!chatDoc.exists()) {
    loading.value = false;
    return;
  }

  const fetchedChat = { id: chatDoc.id, ...chatDoc.data() } as Chat;
  if (fetchedChat.userId !== authStore.user?.uid) {
    loadError.value = 'You do not have permission to view this chat.';
    loading.value = false;
    return;
  }

  chat.value = fetchedChat;

  if (chat.value.productId) {
    try {
      const productDoc = await getDoc(doc(db, 'products', chat.value.productId));
      if (productDoc.exists()) {
        product.value = { id: productDoc.id, ...productDoc.data() } as Product;
      }
    } catch (error: any) {
      handleFirestoreError(error, `products/${chat.value.productId}`);
      loading.value = false;
      return;
    }
  }

  if (chat.value.shopId) {
    try {
      const shopDoc = await getDoc(doc(db, 'shops', chat.value.shopId));
      if (shopDoc.exists()) {
        shop.value = { id: shopDoc.id, ...shopDoc.data() } as Shop;
      }
    } catch (error: any) {
      handleFirestoreError(error, `shops/${chat.value.shopId}`);
      loading.value = false;
      return;
    }
  }

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(messagesQuery);
    messages.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ChatMessage));
  } catch (error: any) {
    handleFirestoreError(error, `chats/${chatId}/messages`);
    loading.value = false;
    return;
  }

  loading.value = false;
};

onMounted(loadChat);
</script>

<style scoped>
.chat-page { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
.chat-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
.back-link { color: #4c1d95; text-decoration: none; font-weight: 700; }
.chat-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  background: linear-gradient(90deg,#6366f1,#8b5cf6);
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform .18s ease, box-shadow .18s ease, opacity .12s ease;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(99,102,241,0.12);
}
.chat-title:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgba(99,102,241,0.18);
  opacity: 0.98;
}
.chat-meta { display: flex; gap: 24px; margin-bottom: 24px; color: #4b5563; }
.messages { display: flex; flex-direction: column; gap: 16px; }
.message { display: flex; }
.message.customer { justify-content: flex-end; }
.message.shop { justify-content: flex-start; }
.message-bubble { max-width: 70%; padding: 16px 18px; border-radius: 22px; background: #f3f4f6; position: relative; }
.message.customer .message-bubble { background: #c7d2fe; }
.message-time { display: block; margin-top: 8px; color: #6b7280; font-size: 12px; }
  .loading, .empty-state, .error-state { text-align: center; color: #6b7280; padding: 64px 0; }
  .empty-icon { width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 16px; background: #eef2ff; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #6366f1; }
  .empty-title { font-weight: 700; font-size: 18px; }
  .error-text { max-width: 560px; margin: 16px auto 0; color: #b91c1c; font-size: 14px; line-height: 1.6; }
</style>
