<template>
	<div class="customer-inquiries-page">
		<div class="page-header">
			<div>
				<h1>Customer Service Inquiries</h1>
				<p>{{ isSuperAdmin ? 'View all customer inquiries' : 'Send and track your inquiries' }}</p>
			</div>
			<button class="btn btn-primary" type="button" @click="openCreateModal">New Inquiry</button>
		</div>

		<section class="inquiries-panel">
			<div v-if="loading" class="state">Loading inquiries...</div>
			<div v-else-if="fetchError" class="state error-state">{{ fetchError }}</div>
			<div v-else-if="!inquiries.length" class="state">
				<strong>No customer inquiries yet</strong>
				<span>Create an inquiry to contact the support team.</span>
			</div>
			<template v-else>
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Title</th>
								<th>Description</th>
								<th v-if="isSuperAdmin">User ID</th>
								<th>Created</th>
								<th class="actions-column">Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="inquiry in paginatedInquiries" :key="inquiry.id">
								<td data-label="Title"><strong>{{ inquiry.title }}</strong></td>
								<td data-label="Description">
									<span class="description">{{ inquiry.description }}</span>
									<div v-if="inquiry.reply" class="reply-preview">
										<strong>Support reply</strong>
										<span>{{ inquiry.reply }}</span>
										<small v-if="inquiry.repliedAt">{{ formatDate(inquiry.repliedAt) }}</small>
									</div>
								</td>
								<td v-if="isSuperAdmin" data-label="User ID"><span class="user-id">{{ inquiry.userId }}</span></td>
								<td data-label="Created">{{ formatDate(inquiry.createdAt) }}</td>
								<td data-label="Actions" class="actions-column">
									<button v-if="isSuperAdmin" class="reply-btn" type="button" @click="openReplyModal(inquiry)">
										{{ inquiry.reply ? 'Edit Reply' : 'Reply' }}
									</button>
									<button  v-if="isSuperAdmin" class="delete-btn" type="button" title="Delete inquiry" :disabled="deletingId === inquiry.id" @click="removeInquiry(inquiry)">
										{{ deletingId === inquiry.id ? 'Deleting...' : 'Delete' }}
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div v-if="totalPages > 1" class="pagination">
					<button class="btn btn-secondary" type="button" :disabled="currentPage === 1" @click="currentPage--">Previous</button>
					<span>Page {{ currentPage }} of {{ totalPages }}</span>
					<button class="btn btn-secondary" type="button" :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
				</div>
			</template>
		</section>

		<div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
			<section class="modal-card">
				<header>
					<div>
						<h2>New Customer Inquiry</h2>
						<p>Send a question or concern to support.</p>
					</div>
					<button class="close-btn" type="button" aria-label="Close" @click="closeCreateModal">&times;</button>
				</header>
				<div class="modal-body">
					<label class="field">
						<span>Title</span>
						<input v-model="form.title" type="text" maxlength="120" placeholder="Inquiry title" />
					</label>
					<label class="field">
						<span>Description</span>
						<textarea v-model="form.description" rows="6" maxlength="2000" placeholder="Describe your inquiry"></textarea>
					</label>
					<div v-if="formError" class="form-error">{{ formError }}</div>
				</div>
				<footer>
					<button class="btn btn-secondary" type="button" :disabled="saving" @click="closeCreateModal">Cancel</button>
					<button class="btn btn-primary" type="button" :disabled="saving" @click="createInquiry">
						{{ saving ? 'Submitting...' : 'Submit Inquiry' }}
					</button>
				</footer>
			</section>
		</div>

		<div v-if="showReplyModal && replyTarget" class="modal-overlay" @click.self="closeReplyModal">
			<section class="modal-card">
				<header>
					<div>
						<h2>Reply to Inquiry</h2>
						<p>{{ replyTarget.title }}</p>
					</div>
					<button class="close-btn" type="button" aria-label="Close" @click="closeReplyModal">&times;</button>
				</header>
				<div class="modal-body">
					<div class="inquiry-context">{{ replyTarget.description }}</div>
					<label class="field">
						<span>Response</span>
						<textarea v-model="replyText" rows="6" maxlength="2000" placeholder="Write a response to the customer"></textarea>
					</label>
					<div v-if="replyError" class="form-error">{{ replyError }}</div>
				</div>
				<footer>
					<button class="btn btn-secondary" type="button" :disabled="replySaving" @click="closeReplyModal">Cancel</button>
					<button class="btn btn-primary" type="button" :disabled="replySaving" @click="saveReply">
						{{ replySaving ? 'Saving...' : 'Send Reply' }}
					</button>
				</footer>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from '~/utils/firestoreLogger';

type CustomerInquiry = {
	id: string;
	title: string;
	description: string;
	userId: string;
	reply?: string;
	repliedAt?: any;
	repliedBy?: string;
	createdAt?: any;
};

definePageMeta({ layout: 'dashboard', middleware: 'auth', ssr: false });
useHead({ title: 'Customer Inquiries | My Near Shops' });

const authStore = useAuthStore();
const nuxtApp = useNuxtApp() as any;
const db = nuxtApp.$firebase?.db;

const inquiries = ref<CustomerInquiry[]>([]);
const loading = ref(true);
const fetchError = ref('');
const showCreateModal = ref(false);
const saving = ref(false);
const formError = ref('');
const deletingId = ref('');
const showReplyModal = ref(false);
const replyTarget = ref<CustomerInquiry | null>(null);
const replyText = ref('');
const replyError = ref('');
const replySaving = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

const form = reactive({ title: '', description: '' });

const normalizedRoleId = computed(() => String(authStore.user?.roleId || '').toLowerCase().replace(/[_\s]+/g, '-'));
const isSuperAdmin = computed(() => normalizedRoleId.value === 'super-admin');
const totalPages = computed(() => Math.max(1, Math.ceil(inquiries.value.length / itemsPerPage)));
const paginatedInquiries = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage;
	return inquiries.value.slice(start, start + itemsPerPage);
});

const timestampToMillis = (value: any) => {
	if (!value) return 0;
	if (typeof value.toMillis === 'function') return value.toMillis();
	if (typeof value.toDate === 'function') return value.toDate().getTime();
	return new Date(value).getTime() || 0;
};

const formatDate = (value: any) => {
	const milliseconds = timestampToMillis(value);
	return milliseconds ? new Date(milliseconds).toLocaleString() : '-';
};

const fetchInquiries = async () => {
	loading.value = true;
	fetchError.value = '';
	try {
		if (!db) throw new Error('Firebase is not available.');
		const userId = authStore.user?.uid || '';
		if (!userId) throw new Error('Authenticated user ID not found.');

		const inquiriesQuery = isSuperAdmin.value
			? collection(db, 'customerInquiries')
			: query(collection(db, 'customerInquiries'), where('userId', '==', userId));
		const snapshot = await getDocs(inquiriesQuery);
		inquiries.value = snapshot.docs
			.map((entry: any) => ({ id: entry.id, ...entry.data() } as CustomerInquiry))
			.sort((left: CustomerInquiry, right: CustomerInquiry) => timestampToMillis(right.createdAt) - timestampToMillis(left.createdAt));
		currentPage.value = 1;
	} catch (error: any) {
		fetchError.value = error?.message || 'Failed to load customer inquiries.';
	} finally {
		loading.value = false;
	}
};

const openCreateModal = () => {
	form.title = '';
	form.description = '';
	formError.value = '';
	showCreateModal.value = true;
};

const closeCreateModal = () => {
	if (saving.value) return;
	showCreateModal.value = false;
	formError.value = '';
};

const createInquiry = async () => {
	formError.value = '';
	const title = form.title.trim();
	const description = form.description.trim();
	const userId = authStore.user?.uid || '';
	if (!title || !description) {
		formError.value = 'Title and description are required.';
		return;
	}
	if (!db || !userId) {
		formError.value = 'Unable to identify the authenticated user.';
		return;
	}

	saving.value = true;
	try {
		await addDoc(collection(db, 'customerInquiries'), {
			title,
			description,
			userId,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
		showCreateModal.value = false;
		await fetchInquiries();
	} catch (error: any) {
		formError.value = error?.message || 'Failed to submit the inquiry.';
	} finally {
		saving.value = false;
	}
};

const openReplyModal = (inquiry: CustomerInquiry) => {
	if (!isSuperAdmin.value) return;
	replyTarget.value = inquiry;
	replyText.value = inquiry.reply || '';
	replyError.value = '';
	showReplyModal.value = true;
};

const closeReplyModal = () => {
	if (replySaving.value) return;
	showReplyModal.value = false;
	replyTarget.value = null;
	replyText.value = '';
	replyError.value = '';
};

const saveReply = async () => {
	if (!db || !isSuperAdmin.value || !replyTarget.value) return;
	const reply = replyText.value.trim();
	if (!reply) {
		replyError.value = 'A response is required.';
		return;
	}

	replySaving.value = true;
	replyError.value = '';
	try {
		await updateDoc(doc(db, 'customerInquiries', replyTarget.value.id), {
			reply,
			repliedAt: serverTimestamp(),
			repliedBy: authStore.user?.uid || '',
			updatedAt: serverTimestamp(),
		});
		replySaving.value = false;
		closeReplyModal();
		await fetchInquiries();
	} catch (error: any) {
		replyError.value = error?.message || 'Failed to save the reply.';
	} finally {
		replySaving.value = false;
	}
};

const removeInquiry = async (inquiry: CustomerInquiry) => {
	const currentUserId = authStore.user?.uid || '';
	if (!isSuperAdmin.value && inquiry.userId !== currentUserId) return;
	if (!confirm(`Delete "${inquiry.title}"?`)) return;

	deletingId.value = inquiry.id;
	try {
		await deleteDoc(doc(db, 'customerInquiries', inquiry.id));
		inquiries.value = inquiries.value.filter((entry: CustomerInquiry) => entry.id !== inquiry.id);
		if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
	} catch (error: any) {
		fetchError.value = error?.message || 'Failed to delete the inquiry.';
	} finally {
		deletingId.value = '';
	}
};

onMounted(fetchInquiries);
</script>

<style scoped>
.customer-inquiries-page { max-width: 1180px; margin: 0 auto; color: #0f172a; }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
.page-header h1 { margin: 0 0 5px; font-size: 28px; font-weight: 900; letter-spacing: 0; }
.page-header p { margin: 0; color: #64748b; font-size: 14px; }
.btn { min-height: 40px; padding: 0 16px; border: 0; border-radius: 8px; font-size: 13px; font-weight: 800; cursor: pointer; }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn-primary { background: #f59e0b; color: #172033; }
.btn-primary:hover:not(:disabled) { background: #d97706; }
.btn-secondary { border: 1px solid #cbd5e1; background: #fff; color: #475569; }
.inquiries-panel { overflow: hidden; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(15,23,42,.05); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 15px 18px; border-bottom: 1px solid #f1f5f9; text-align: left; vertical-align: top; font-size: 13px; }
th { background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; }
tbody tr:last-child td { border-bottom: 0; }
.description { display: block; max-width: 440px; color: #475569; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
.user-id { color: #475569; font-family: Consolas, monospace; font-size: 11px; overflow-wrap: anywhere; }
.actions-column { text-align: right; white-space: nowrap; }
.reply-btn { min-height: 32px; margin-right: 6px; padding: 0 10px; border: 1px solid #99f6e4; border-radius: 6px; background: #f0fdfa; color: #0f766e; font-size: 11px; font-weight: 800; cursor: pointer; }
.delete-btn { min-height: 32px; padding: 0 10px; border: 1px solid #fecaca; border-radius: 6px; background: #fff; color: #dc2626; font-size: 11px; font-weight: 800; cursor: pointer; }
.delete-btn:disabled { opacity: .55; }
.reply-preview { display: grid; gap: 3px; max-width: 440px; margin-top: 9px; padding: 9px 10px; border-left: 3px solid #14b8a6; background: #f0fdfa; color: #134e4a; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.reply-preview strong { font-size: 10px; text-transform: uppercase; }
.reply-preview small { color: #64748b; font-size: 10px; }
.state { min-height: 260px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; color: #64748b; text-align: center; }
.state strong { color: #334155; font-size: 16px; }
.state span { font-size: 13px; }
.error-state, .form-error { color: #b42318; }
.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 14px 18px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; }
.modal-overlay { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 20px; background: rgba(15,23,42,.58); }
.modal-card { width: min(560px, 100%); overflow: hidden; border-radius: 8px; background: #fff; box-shadow: 0 24px 70px rgba(15,23,42,.3); }
.modal-card header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 22px; border-bottom: 1px solid #e2e8f0; }
.modal-card h2 { margin: 0 0 3px; font-size: 18px; }
.modal-card header p { margin: 0; color: #64748b; font-size: 12px; }
.close-btn { width: 34px; height: 34px; border: 0; border-radius: 6px; background: #f1f5f9; color: #64748b; font-size: 24px; cursor: pointer; }
.modal-body { display: grid; gap: 16px; padding: 22px; }
.inquiry-context { padding: 11px 12px; border: 1px solid #e2e8f0; border-radius: 7px; background: #f8fafc; color: #475569; font-size: 12px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
.field { display: grid; gap: 6px; }
.field span { color: #475569; font-size: 12px; font-weight: 800; }
.field input, .field textarea { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 1px solid #cbd5e1; border-radius: 7px; outline: 0; color: #172033; font: inherit; }
.field textarea { resize: vertical; }
.field input:focus, .field textarea:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.14); }
.form-error { padding: 10px 12px; border: 1px solid #fecaca; border-radius: 7px; background: #fef2f2; font-size: 12px; }
.modal-card footer { display: flex; justify-content: flex-end; gap: 9px; padding: 15px 22px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
@media (max-width: 680px) {
	.page-header { align-items: flex-start; }
	.page-header h1 { font-size: 24px; }
	.table-wrap { overflow: visible; }
	table, tbody, tr, td { display: block; width: 100%; box-sizing: border-box; }
	thead { display: none; }
	tbody { display: grid; gap: 10px; padding: 12px; }
	tr { border: 1px solid #e2e8f0; border-radius: 8px; }
	td { display: grid; gap: 4px; padding: 11px 12px; }
	td::before { content: attr(data-label); color: #94a3b8; font-size: 9px; font-weight: 900; text-transform: uppercase; }
	.actions-column { text-align: left; }
	.description { max-width: none; }
	.pagination { justify-content: center; }
}
</style>
