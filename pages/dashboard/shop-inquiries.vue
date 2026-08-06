<template>
  <div class="inquiries-page">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5V21h18V9.5L12 3 3 9.5z"/><path d="M9 22V12h6v10"/></svg>
        </div>
        <div>
          <h1 class="page-title">Shop Inquiries</h1>
          <p class="page-subtitle">Chats for shops you manage or belong to</p>
        </div>
      </div>
      <div></div>
    </div>

    <div class="card">
      <div v-if="loading" class="state loading">
        <div class="spinner"></div>
        <p>Loading shop inquiries...</p>
      </div>
      <div v-else-if="fetchError" class="state error">{{ fetchError }}</div>

      <template v-else-if="chats.length">
        <table class="data-table">
          <thead>
            <tr>
              <th>Created</th>
              <th>Products</th>
              <th>Shops</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in paginatedChats" :key="c.id" @click="openChat(c)" style="cursor: pointer;">
              <td>{{ formatDate(c.createdAt) }}</td>
              <td>
                <NuxtLink v-if="c.productId" :to="`/items/${c.productId}`" class="entity-link">{{ productMap[c.productId] || c.title || 'Inquiry' }}</NuxtLink>
                <span v-else>{{ productMap[c.productId] || c.title || 'Inquiry' }}</span>
              </td>
              <td>
                <NuxtLink v-if="c.shopId" :to="`/shops/${c.shopId}`" class="entity-link">{{ shopMap[c.shopId] || '-' }}</NuxtLink>
                <span v-else>-</span>
              </td>
              <td class="actions">
                <button class="btn-icon view" title="Open" @click.stop="openChat(c)">🔍</button>
                <button class="btn-icon cancel" title="Delete" @click.stop="deleteChat(c)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="totalPages > 1" class="pagination">
          <button class="btn btn-ghost" :disabled="currentPage === 1" @click="prevPage">Previous</button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn btn-ghost" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
        </div>
      </template>

      <div v-else class="state empty">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5V21h18V9.5L12 3 3 9.5z"/><path d="M9 22V12h6v10"/></svg>
        </div>
        <p class="empty-title">No shop inquiries yet</p>
        <p class="empty-desc">Shop chats from your owned or assigned shops will appear here.</p>
      </div>
    </div>

    <!-- Chat Modal -->
    <div v-if="showChatModal" class="modal-overlay" @click.self="closeChatModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>
            <NuxtLink v-if="selectedChat?.productId" :to="`/items/${selectedChat?.productId}`" class="entity-link modal-link">{{ productMap[selectedChat?.productId] || selectedChat?.title || 'Inquiry' }}</NuxtLink>
            <span v-else>{{ productMap[selectedChat?.productId] || selectedChat?.title || 'Inquiry' }}</span>
            <small v-if="selectedChat?.shopId" class="modal-sub"> — <NuxtLink :to="`/shops/${selectedChat?.shopId}`" class="entity-link modal-link">{{ shopMap[selectedChat?.shopId] || selectedChat?.shopId }}</NuxtLink></small>
          </h3>
          <button class="close-btn" @click="closeChatModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="messages-list">
            <div v-if="messagesLoading" class="state loading small">Loading messages...</div>
            <div v-else-if="messages.length === 0" class="state empty small">No messages yet</div>
            <div v-else>
              <div v-for="m in messages" :key="m.id" class="message-row">
                <div class="message-meta">
                  <strong>{{ m.senderName || (m.senderId === authStore.user?.uid ? 'You' : 'Shop') }}</strong>
                  <small>{{ formatDate(m.createdAt) }}</small>
                </div>
                <div class="message-text">{{ m.text }}</div>
                <div v-if="m.imageUrl" class="message-attachment"><img :src="m.imageUrl" alt="photo" /></div>
                <div v-if="m.videoUrl" class="message-attachment"><video :src="m.videoUrl" controls /></div>
                <div class="message-actions" v-if="m.senderId === authStore.user?.uid">
                  <button class="btn-icon" @click="startEditMessage(m)">✏️</button>
                  <button class="btn-icon cancel" @click="deleteMessage(m)">🗑️</button>
                </div>
              </div>
            </div>
          </div>

          <div class="message-form">
            <input v-model="messageText" placeholder="Type a message" @keyup.enter="sendMessage" />
            <div class="attachments" style="display:flex;align-items:center;gap:8px;margin-left:8px;">
              <label class="file-label">
                <input type="file" accept="image/*" @change="onPhotoChange" :disabled="!!photoFile || sendingMessage" />
                <span title="Attach photo">📷</span>
              </label>
              <label class="file-label">
                <input type="file" accept="video/*" @change="onVideoChange" :disabled="!!videoFile || sendingMessage" />
                <span title="Attach video">🎥</span>
              </label>
              <div class="attachment-previews">
                <div v-if="photoPreview" class="preview small">
                  <img :src="photoPreview" alt="photo" />
                  <button class="btn-icon cancel" type="button" @click="removePhoto">✖</button>
                </div>
                <div v-if="videoPreview" class="preview small">
                  <video :src="videoPreview" controls style="height:48px;border-radius:8px;" />
                  <button class="btn-icon cancel" type="button" @click="removeVideo">✖</button>
                </div>
              </div>
            </div>
            <button class="btn btn-action view" :disabled="sendingMessage || (!messageText.trim() && !photoFile && !videoFile)" @click="sendMessage">
              <span v-if="sendingMessage" class="button-spinner"></span>
              <span>{{ sendingMessage ? 'Sending…' : 'Send' }}</span>
            </button>
            <button v-if="editingMessage" class="btn btn-action cancel" :disabled="sendingMessage" @click="cancelEdit">Cancel</button>
          </div>
          <div v-if="attachmentError" class="message-error" style="margin-top:8px"><span class="error-badge">!</span>{{ attachmentError }}</div>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDeleteChat">
      <div class="modal-card confirm-card">
        <div class="modal-header">
          <h3>Delete inquiry</h3>
          <button class="close-btn" @click="cancelDeleteChat">&times;</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">Are you sure you want to delete this inquiry? This action cannot be undone.</p>
        </div>
        <div class="modal-footer confirm-actions">
          <button class="btn btn-ghost" @click="cancelDeleteChat">Cancel</button>
          <button class="btn btn-action cancel" @click="confirmDeleteChat">Delete</button>
        </div>
      </div>
    </div>
    <!-- Chat creation/editing removed per request -->

  </div>
</template>

<script setup lang="ts">
import { collection, query, where, getDocs, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, documentId } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

definePageMeta({ layout: 'dashboard', middleware: 'auth', ssr: false });
useHead({ title: 'Shop Inquiries | My Near Shops' });

const nuxtApp = useNuxtApp() as any;
const db = nuxtApp.$firebase?.db;
const storage = nuxtApp.$firebase?.storage;
const authStore = useAuthStore();

interface Chat { id: string; title?: string; userId?: string; productId?: string; shopId?: string; lastMessage?: any; createdAt?: any; updatedAt?: any }
interface Message { id: string; text?: string; senderId?: string; senderName?: string; createdAt?: any; imageUrl?: string; imagePath?: string; imageName?: string; videoUrl?: string; videoPath?: string; videoName?: string }

const chats = ref<Chat[]>([]);
const productMap = ref<Record<string,string>>({});
const shopMap = ref<Record<string,string>>({});
const loading = ref(true);
const fetchError = ref('');

const perPage = 20;
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(chats.value.length / perPage) || 1);
const paginatedChats = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return chats.value.slice(start, start + perPage);
});
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

const toDate = (v: any) => { if (!v) return null; if (v.toDate) return v.toDate(); if (v instanceof Date) return v; if (typeof v === 'number') return new Date(v); return new Date(v); };
const formatDate = (v: any) => { const d = toDate(v); if (!d) return '-'; return d.toLocaleString(); };

const handleFirestoreError = (err: any, path?: string) => {
  const msg = err?.message || err?.code || String(err);
  if ((msg && msg.toString().includes('Missing or insufficient permissions')) || err?.code === 'permission-denied') {
    console.error('Firestore permission error on collection/path:', path || 'unknown', err);
  } else {
    console.error('Firestore error on', path || 'unknown', err);
  }
};

const fetchChats = async () => {
  loading.value = true; fetchError.value = '';
  try {
    if (!db) throw new Error('Firebase not available');
    const uid = authStore.user?.uid;
    if (!uid) throw new Error('Authenticated user ID not found');

    const [memberSnap, ownedShopSnap] = await Promise.all([
      getDocs(query(collection(db, 'shopMembers'), where('uid', '==', uid))),
      getDocs(query(collection(db, 'shops'), where('ownerId', '==', uid))),
    ]);

    const memberShopIds = memberSnap.docs.map((d: any) => d.data().shopId).filter(Boolean) as string[];
    const ownedShopIds = ownedShopSnap.docs.map((d: any) => d.id).filter(Boolean) as string[];
    const shopIds = [...new Set([...memberShopIds, ...ownedShopIds])] as string[];

    if (!shopIds.length) {
      chats.value = [];
      currentPage.value = 1;
      return;
    }

    const chunks: string[][] = [];
    for (let i = 0; i < shopIds.length; i += 10) chunks.push(shopIds.slice(i, i + 10));
    const snapshots = await Promise.all(chunks.map(ids => getDocs(query(collection(db, 'chats'), where('shopId', 'in', ids)))));
    const fetched = snapshots.flatMap((snap: any) => snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Chat)));
    chats.value = fetched.sort((a, b) => {
      const da = toDate(a.createdAt)?.getTime() || 0;
      const dbb = toDate(b.createdAt)?.getTime() || 0;
      return dbb - da;
    });
    currentPage.value = 1;

    try {
      const productIds = [...new Set(chats.value.map((f: Chat) => f.productId).filter(Boolean))] as string[];
      if (productIds.length && db) {
        const prodChunks: string[][] = [];
        for (let i = 0; i < productIds.length; i += 30) prodChunks.push(productIds.slice(i, i + 30));
        const prodSnaps = await Promise.all(prodChunks.map(ids => getDocs(query(collection(db, 'products'), where(documentId(), 'in', ids)))));
        productMap.value = Object.fromEntries(prodSnaps.flatMap((s: any) => s.docs.map((d: any) => [d.id, d.data().name || d.id])));
      }
    } catch (e: any) {
      handleFirestoreError(e, 'products');
    }

    try {
      const shopIdsForMap = [...new Set(chats.value.map((f: Chat) => f.shopId).filter(Boolean))] as string[];
      if (shopIdsForMap.length && db) {
        const shopChunks: string[][] = [];
        for (let i = 0; i < shopIdsForMap.length; i += 30) shopChunks.push(shopIdsForMap.slice(i, i + 30));
        const shopSnaps = await Promise.all(shopChunks.map(ids => getDocs(query(collection(db, 'shops'), where(documentId(), 'in', ids)))));
        shopMap.value = Object.fromEntries(shopSnaps.flatMap((s: any) => s.docs.map((d: any) => [d.id, d.data().name || d.id])));
      }
    } catch (e: any) {
      handleFirestoreError(e, 'shops');
    }
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load shop inquiries.';
    handleFirestoreError(e, 'chats');
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchChats());

const showChatModal = ref(false);
const selectedChat = ref<Chat | null>(null);
const messages = ref<Message[]>([]);
const messagesLoading = ref(false);
const messageText = ref('');
const editingMessage = ref<Message | null>(null);
const photoFile = ref<File | null>(null);
const photoPreview = ref<string | null>(null);
const videoFile = ref<File | null>(null);
const videoPreview = ref<string | null>(null);
const attachmentError = ref('');
const sendingMessage = ref(false);

const openChat = async (c: Chat) => {
  selectedChat.value = c;
  showChatModal.value = true;
  await fetchMessages(c.id);
};
const closeChatModal = () => {
  showChatModal.value = false;
  selectedChat.value = null;
  messages.value = [];
  messageText.value = '';
  editingMessage.value = null;
};
const showDeleteModal = ref(false);
const deleteTargetChat = ref<Chat | null>(null);
const deleteChat = (chat: Chat) => {
  deleteTargetChat.value = chat;
  showDeleteModal.value = true;
};
const cancelDeleteChat = () => { showDeleteModal.value = false; deleteTargetChat.value = null; };
const confirmDeleteChat = async () => {
  if (!deleteTargetChat.value) return;
  try {
    const targetId = deleteTargetChat.value.id;
    await deleteDoc(doc(db, 'chats', targetId));
    chats.value = chats.value.filter((x: Chat) => x.id !== targetId);
    if (selectedChat.value?.id === targetId) closeChatModal();
  } catch (e: any) {
    handleFirestoreError(e, `chats/${deleteTargetChat.value.id}`);
  } finally {
    cancelDeleteChat();
  }
};

const fetchMessages = async (chatId: string) => {
  messagesLoading.value = true;
  try {
    if (!db) throw new Error('Firebase not available');
    const msgsSnap = await getDocs(query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc')));
    messages.value = msgsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Message));
  } catch (e: any) {
    handleFirestoreError(e, `chats/${chatId}/messages`);
  } finally {
    messagesLoading.value = false;
  }
};

const sendMessage = async () => {
  const text = messageText.value.trim();
  if (!selectedChat.value) return;
  if (!text && !photoFile.value && !videoFile.value) return;
  sendingMessage.value = true;
  try {
    if (!db) throw new Error('Firebase not available');
    const chatId = selectedChat.value.id;
    if (editingMessage.value) {
      const mRef = doc(db, 'chats', chatId, 'messages', editingMessage.value.id);
      await updateDoc(mRef, { text, updatedAt: serverTimestamp() });
      const idx = messages.value.findIndex((m: Message) => m.id === editingMessage.value!.id);
      if (idx !== -1) messages.value[idx].text = text;
      editingMessage.value = null;
    } else {
      const newMsg: any = {
        text,
        senderId: authStore.user?.uid || null,
        senderName: authStore.displayName || null,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'chats', selectedChat.value.id, 'messages'), newMsg);
      const messageId = docRef.id;
      const attachmentUpdates: Record<string, any> = {};
      try {
        if (storage) {
          if (photoFile.value) {
            const file = photoFile.value;
            const imagePath = `messages/${chatId}/${messageId}/photo_${file.name}`;
            const fileRef = storageRef(storage, imagePath);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            attachmentUpdates.imageUrl = url;
            attachmentUpdates.imagePath = imagePath;
            attachmentUpdates.imageName = file.name;
          }
          if (videoFile.value) {
            const file = videoFile.value;
            const videoPath = `messages/${chatId}/${messageId}/video_${file.name}`;
            const fileRef = storageRef(storage, videoPath);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            attachmentUpdates.videoUrl = url;
            attachmentUpdates.videoPath = videoPath;
            attachmentUpdates.videoName = file.name;
          }
          if (Object.keys(attachmentUpdates).length) {
            await updateDoc(doc(db, 'chats', selectedChat.value.id, 'messages', messageId), attachmentUpdates);
          }
        }
      } catch (e: any) {
        console.error('Attachment upload failed', e);
      }
      messages.value.push({ id: messageId, ...newMsg, ...attachmentUpdates } as Message);
      await updateDoc(doc(db, 'chats', selectedChat.value.id), { lastMessage: { text, createdAt: serverTimestamp(), senderId: authStore.user?.uid }, updatedAt: serverTimestamp() });
      selectedChat.value.lastMessage = { text };
    }
    messageText.value = '';
    if (photoPreview.value) { URL.revokeObjectURL(photoPreview.value); }
    if (videoPreview.value) { URL.revokeObjectURL(videoPreview.value); }
    photoFile.value = null; photoPreview.value = null; videoFile.value = null; videoPreview.value = null; attachmentError.value = '';
  } catch (e: any) {
    handleFirestoreError(e, `chats/${selectedChat.value?.id || 'unknown'}/messages`);
  } finally {
    sendingMessage.value = false;
  }
};

const startEditMessage = (m: Message) => {
  editingMessage.value = m;
  messageText.value = m.text || '';
};
const cancelEdit = () => { editingMessage.value = null; messageText.value = ''; };

const MAX_PHOTO_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10 MB

const onPhotoChange = (event: Event) => {
  attachmentError.value = '';
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;
  const file = target.files[0];
  if (!file.type.startsWith('image/')) { attachmentError.value = 'Please select an image file.'; target.value = ''; return; }
  if (file.size > MAX_PHOTO_SIZE) { attachmentError.value = 'Photo must be 1 MB or smaller.'; target.value = ''; return; }
  if (photoFile.value) { attachmentError.value = 'Only one photo allowed.'; target.value = ''; return; }
  photoFile.value = file;
  photoPreview.value = URL.createObjectURL(file);
  target.value = '';
};

const onVideoChange = (event: Event) => {
  attachmentError.value = '';
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;
  const file = target.files[0];
  if (!file.type.startsWith('video/')) { attachmentError.value = 'Please select a video file.'; target.value = ''; return; }
  if (file.size > MAX_VIDEO_SIZE) { attachmentError.value = 'Video must be 10 MB or smaller.'; target.value = ''; return; }
  if (videoFile.value) { attachmentError.value = 'Only one video allowed.'; target.value = ''; return; }
  videoFile.value = file;
  videoPreview.value = URL.createObjectURL(file);
  target.value = '';
};

const removePhoto = () => {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  photoFile.value = null; photoPreview.value = null; attachmentError.value = '';
};
const removeVideo = () => {
  if (videoPreview.value) URL.revokeObjectURL(videoPreview.value);
  videoFile.value = null; videoPreview.value = null; attachmentError.value = '';
};

const deleteMessage = async (m: Message) => {
  if (!selectedChat.value) return;
  try {
    if (storage) {
      const deletes = [] as Promise<any>[];
      const folderRef = storageRef(storage, `messages/${selectedChat.value.id}/${m.id}`);
      const list = await listAll(folderRef).catch(() => ({ items: [] } as { items: any[] }));
      deletes.push(...list.items.map(item => deleteObject(item).catch(() => null)));
      if (m.imagePath) deletes.push(deleteObject(storageRef(storage, m.imagePath)).catch(() => null));
      if (m.videoPath) deletes.push(deleteObject(storageRef(storage, m.videoPath)).catch(() => null));
      if (deletes.length) await Promise.all(deletes);
    }
    await deleteDoc(doc(db, 'chats', selectedChat.value.id, 'messages', m.id));
    messages.value = messages.value.filter((x: Message) => x.id !== m.id);
  } catch (e) {
    // ignore
  }
};
</script>

<style scoped>
/* Reuse transactions styles where appropriate */
.inquiries-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 28px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 24px rgba(79,70,229,0.25); }
.page-title { font-size: 28px; font-weight: 900; margin: 0 0 4px; color: #0f172a; }
.page-subtitle { font-size: 14px; color: #64748b; margin: 0; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 0; box-shadow: 0 10px 40px rgba(15,23,42,0.05); overflow: hidden; }
.state { padding: 48px; text-align: center; color: #64748b; }
.state.small { padding: 12px; }
.state p { margin: 8px 0 0; }
.spinner { width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { width: 72px; height: 72px; border-radius: 50%; background: #f8fafc; color: #94a3b8; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.empty-desc { font-size: 14px; color: #64748b; margin: 0 0 20px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 14px 16px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
.data-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 14px; color: #0f172a; }
.data-table tbody tr:hover { background: #f8fafc; }
.data-table tr:last-child td { border-bottom: none; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
.btn-ghost { padding: 10px 18px; background: #f1f5f9; color: #475569; }
.btn-action { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; margin-left: 6px; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-action.view { color: #4f46e5; background: #eef2ff; border-color: #c7d2fe; }
.btn-action.view:hover { background: #e0e7ff; }
.btn-icon { width: 34px; height: 34px; border-radius: 10px; background: none; border: 1px solid transparent; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; margin-left: 6px; }
.btn-icon:hover { transform: translateY(-1px); }
.btn-icon:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-icon.view { color: #4f46e5; }
.btn-icon.cancel { color: #ef4444; }
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #fff; }
.page-info { font-size: 14px; color: #64748b; font-weight: 600; }

/* Modal and messages */
.modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { width: 100%; max-width: 720px; max-height: 90vh; overflow-y: auto; background: #fff; border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.2); }
.confirm-card { max-width: 420px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
.modal-sub { font-size: 13px; color: #64748b; font-weight: 700; margin-left: 8px; }
.close-btn { background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; }
.entity-link { display: inline-flex; align-items: center; gap: 8px; color: #fff; background: linear-gradient(90deg,#6366f1,#8b5cf6); padding: 6px 12px; border-radius: 999px; font-weight: 700; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease, opacity .12s ease; cursor: pointer; box-shadow: 0 6px 18px rgba(99,102,241,0.12); }
.entity-link::after { content: '↗'; font-size: 12px; opacity: 0.95; margin-left: 6px; transform: translateY(-1px); }
.entity-link:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(99,102,241,0.18); opacity: 0.98; text-decoration: none; }
.entity-link:active { transform: translateY(0); }
.entity-link:focus { outline: none; box-shadow: 0 0 0 4px rgba(99,102,241,0.12); }
.modal-link { font-size: 16px; padding: 4px 8px; font-weight: 800; }
.modal-body { padding: 24px; }
.messages-list { max-height: 50vh; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
.message-row { padding: 10px 12px; border-radius: 12px; background: #f8fafc; display: flex; flex-direction: column; gap: 6px; position: relative; }
.message-meta { display: flex; gap: 8px; align-items: baseline; color: #475569; }
.message-text { font-size: 14px; color: #0f172a; }
.message-actions { position: absolute; right: 8px; top: 8px; display: flex; gap: 6px; }
.message-form { display: flex; gap: 8px; align-items: center; }
.message-form input { flex: 1; padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; }
.message-form textarea { width: 100%; padding: 8px; border-radius: 10px; border: 1px solid #e2e8f0; }
.attachments { display: flex; align-items: center; gap: 8px; }
.file-label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }
.file-label input { display: none; }
.attachment-previews { display: flex; gap: 8px; align-items: center; }
.attachment-previews .preview { display:flex; align-items:center; gap:6px; }
.attachment-previews .preview img { width:48px; height:48px; object-fit:cover; border-radius:8px; }
.attachment-previews .preview video { width:96px; height:48px; object-fit:cover; border-radius:8px; }
.message-attachment { margin-top: 8px; }
.message-attachment img { max-width: 320px; border-radius: 10px; display: block; }
.message-attachment video { max-width: 100%; border-radius: 10px; display: block; }
.message-error {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(254, 226, 226, 0.85);
  color: #b91c1c;
  border: 1px solid #fecaca;
  font-size: 13px;
  letter-spacing: 0.02em;
}
.error-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #f8d7da;
  color: #b91c1c;
  font-weight: 800;
  font-size: 14px;
}
.button-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.confirm-text { margin: 0; font-size: 15px; color: #475569; line-height: 1.6; }
.confirm-actions { padding: 16px 24px 24px; justify-content: flex-end; }
.btn-action.cancel { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.btn-action.cancel:hover { background: #fecaca; }
.btn-ghost { background: #fff; }
.form-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.form-row label { font-weight: 700; color: #64748b; font-size: 12px; }

@media (max-width: 640px) {
  .data-table { display: block; overflow-x: auto; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
