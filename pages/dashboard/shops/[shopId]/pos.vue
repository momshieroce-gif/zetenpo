<template>
	<div class="pos-page">
		<header class="pos-header">
			<div>
				<button class="back-link" type="button" @click="navigateTo('/dashboard/shops')">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
					Shops
				</button>
				<h1>Point of Sale</h1>
				<p>{{ shop?.name || 'Loading shop...' }}</p>
			</div>
			<div class="register-status">
				<span class="status-dot"></span>
				Register online
			</div>
		</header>

		<div v-if="loading" class="page-state">
			<span class="spinner"></span>
			Loading register...
		</div>
		<div v-else-if="pageError" class="page-state error-state">{{ pageError }}</div>

		<main v-else class="pos-grid">
			<section class="catalog-panel">
				<div class="catalog-toolbar">
					<label class="search-box">
						<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
						<input
							ref="searchInputRef"
							v-model="searchQuery"
							type="search"
							placeholder="Scan barcode, SKU, or search products"
							@keydown.enter.prevent="addExactMatch"
						/>
					</label>
					<button class="refresh-btn" type="button" title="Refresh inventory" :disabled="refreshing" @click="loadCatalog">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/></svg>
					</button>
				</div>

				<div class="category-strip">
					<button type="button" :class="{ active: selectedCategory === 'All' }" @click="selectedCategory = 'All'">All</button>
					<button
						v-for="category in categories"
						:key="category"
						type="button"
						:class="{ active: selectedCategory === category }"
						@click="selectedCategory = category">
						{{ category }}
					</button>
				</div>

				<div v-if="searchQuery.trim() && !filteredProducts.length" class="catalog-empty">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2h12l3 6-9 5-9-5 3-6Z"/><path d="M3 8v12h18V8M12 13v7"/></svg>
					<strong>No matching products found</strong>
					<span>Try a product name, SKU, or barcode.</span>
				</div>

				<div v-else-if="searchQuery.trim()" class="product-grid">
					<button
						v-for="item in filteredProducts"
						:key="item.product.id"
						type="button"
						class="product-tile"
						:class="{ unavailable: item.totalAvailable <= 0 }"
						:disabled="item.totalAvailable <= 0"
						@click="openVariantPicker(item)">
						<div class="product-tile-top">
							<span class="category-label">{{ item.product.category || 'General' }}</span>
							<em :class="{ low: item.totalAvailable <= item.totalReorderLevel }">{{ item.totalAvailable }} in stock</em>
						</div>
						<div class="product-copy">
							<strong>{{ item.product.name }}</strong>
							<span class="variant-name">{{ item.variants.length }} variant{{ item.variants.length === 1 ? '' : 's' }}</span>
							<span class="sku">Choose size, color, or option</span>
							<div class="product-price-row">
								<b>{{ formatPriceRange(item) }}</b>
								<span>Select →</span>
							</div>
						</div>
					</button>
				</div>
			</section>

			<aside class="cart-panel">
				<div class="cart-heading">
					<div>
						<span>Current sale</span>
						<strong>{{ cartItemCount }} item{{ cartItemCount === 1 ? '' : 's' }}</strong>
					</div>
					<button v-if="cart.length" type="button" class="clear-btn" @click="clearSale">Clear</button>
				</div>

				<div v-if="!cart.length" class="cart-empty">
					<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/></svg>
					<strong>Cart is empty</strong>
					<span>Select a product or scan an SKU.</span>
				</div>

				<div v-else class="cart-items">
					<article v-for="line in cart" :key="line.item.variant.id" class="cart-line">
						<div class="line-main">
							<div>
								<strong>{{ line.item.product.name }}</strong>
								<span>{{ line.item.variant.name }} · {{ line.item.variant.sku }}</span>
							</div>
							<button type="button" class="remove-btn" title="Remove item" @click="removeFromCart(line.item.variant.id)">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></svg>
							</button>
						</div>
						<div class="line-controls">
							<div class="quantity-control">
								<button type="button" @click="changeQuantity(line.item.variant.id, -1)">−</button>
								<span>{{ line.quantity }}</span>
								<button type="button" :disabled="line.quantity >= line.item.availableQuantity" @click="changeQuantity(line.item.variant.id, 1)">+</button>
							</div>
							<strong>{{ formatMoney(line.item.variant.price * line.quantity) }}</strong>
						</div>
					</article>
				</div>

				<div class="customer-fields">
					<input v-model="customerName" type="text" placeholder="Customer name (optional)" />
					<input v-model="customerMobile" type="tel" placeholder="Mobile number (optional)" />
				</div>

				<div class="totals">
					<label class="discount-row">
						<span>Discount</span>
						<span class="money-input"><b>₱</b><input v-model.number="discount" type="number" min="0" :max="subtotal" step="0.01" /></span>
					</label>
					<div><span>Subtotal</span><strong>{{ formatMoney(subtotal) }}</strong></div>
					<div><span>Discount</span><strong>-{{ formatMoney(normalizedDiscount) }}</strong></div>
					<div class="grand-total"><span>Total</span><strong>{{ formatMoney(total) }}</strong></div>
				</div>

				<div class="payment-section">
					<span class="field-label">Payment method</span>
					<div class="payment-options">
						<button v-for="method in paymentMethods" :key="method.value" type="button" :class="{ active: paymentMethod === method.value }" @click="paymentMethod = method.value">
							{{ method.label }}
						</button>
					</div>
					<label v-if="paymentMethod === 'cash'" class="cash-field">
						<span>Cash received</span>
						<span class="money-input large"><b>₱</b><input v-model.number="amountTendered" type="number" min="0" step="0.01" /></span>
					</label>
					<div v-if="paymentMethod === 'cash'" class="change-row" :class="{ insufficient: change < 0 }">
						<span>{{ change < 0 ? 'Amount due' : 'Change' }}</span>
						<strong>{{ formatMoney(Math.abs(change)) }}</strong>
					</div>
				</div>

				<p v-if="checkoutError" class="checkout-error">{{ checkoutError }}</p>
				<button class="checkout-btn" type="button" :disabled="!canCheckout || processing" @click="completeSale">
					<span>{{ processing ? 'Processing sale...' : 'Complete sale' }}</span>
					<strong v-if="!processing">{{ formatMoney(total) }}</strong>
				</button>
			</aside>
		</main>

		<div v-if="selectedProduct" class="modal-overlay" @click.self="closeVariantPicker">
			<section class="variant-card">
				<header class="variant-card-header">
					<div>
						<span>Select a variant</span>
						<h2>{{ selectedProduct.product.name }}</h2>
					</div>
					<button type="button" title="Close" aria-label="Close variant selection" @click="closeVariantPicker">×</button>
				</header>
				<div class="variant-list">
					<button
						v-for="variantItem in selectedProduct.variants"
						:key="variantItem.variant.id"
						type="button"
						class="variant-row"
						:disabled="variantItem.availableQuantity <= 0"
						@click="handleAddToCart(variantItem)">
						<div class="variant-row-main">
							<strong>{{ variantItem.variant.name }}</strong>
							<span>{{ formatVariantAttributes(variantItem.variant) }}</span>
							<small>SKU {{ variantItem.variant.sku }} · Barcode {{ variantItem.variant.barcode || 'Not set' }}</small>
						</div>
						<div class="variant-row-meta">
							<strong>{{ formatMoney(variantItem.variant.price) }}</strong>
							<span :class="{ low: variantItem.availableQuantity <= variantItem.reorderLevel }">
								{{ variantItem.availableQuantity > 0 ? `${variantItem.availableQuantity} available` : 'Out of stock' }}
							</span>
						</div>
					</button>
				</div>
			</section>
		</div>

		<div v-if="receipt" class="modal-overlay" @click.self="closeReceipt">
			<section class="receipt-card">
				<div class="receipt-paper">
					<header class="receipt-shop">
						<h2>{{ receipt.shopName }}</h2>
						<p>{{ receipt.shopAddress || 'Address not available' }}</p>
						<p>Contact: {{ receipt.shopPhone || 'Not available' }}</p>
					</header>
					<div class="receipt-meta">
						<div><span>Receipt</span><strong>{{ receipt.orderNumber }}</strong></div>
						<div><span>Date</span><strong>{{ formatReceiptDate(receipt.createdAt) }}</strong></div>
						<div><span>Cashier</span><strong>{{ receipt.cashierName }}</strong></div>
					</div>
					<div class="receipt-products">
						<div class="receipt-product-heading">
							<span>Item</span><span>Amount</span>
						</div>
						<div v-for="item in receipt.items" :key="item.variantId" class="receipt-product">
							<div>
								<strong>{{ item.productName }}</strong>
								<small>{{ item.variantName }} · {{ item.quantity }} × {{ formatMoney(item.unitPrice) }}</small>
							</div>
							<strong>{{ formatMoney(item.lineTotal) }}</strong>
						</div>
					</div>
					<div class="receipt-totals">
						<div><span>Subtotal</span><strong>{{ formatMoney(receipt.subtotal) }}</strong></div>
						<div v-if="receipt.discount > 0"><span>Discount</span><strong>-{{ formatMoney(receipt.discount) }}</strong></div>
						<div class="receipt-total"><span>Total</span><strong>{{ formatMoney(receipt.total) }}</strong></div>
						<div><span>Received</span><strong>{{ formatMoney(receipt.amountReceived) }}</strong></div>
						<div><span>Change</span><strong>{{ formatMoney(receipt.change) }}</strong></div>
						<div><span>Payment</span><strong>{{ receipt.paymentMethod }}</strong></div>
					</div>
					<footer class="receipt-thanks">
						<strong>Thank you for your purchase!</strong>
						<span>Please come again.</span>
					</footer>
				</div>
				<div class="receipt-actions">
					<button type="button" class="print-receipt-btn" @click="printReceipt">Print receipt</button>
					<button type="button" class="new-sale-btn" @click="closeReceipt">New sale</button>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { collection, doc, getDoc, getDocs, query, runLoggedTransaction, serverTimestamp, where } from '~/utils/firestoreLogger';
import type { Inventory, Product, ProductVariant, Shop } from '~/types';

type CatalogItem = {
	product: Product;
	variant: ProductVariant;
	availableQuantity: number;
	reorderLevel: number;
};

type CartLine = {
	item: CatalogItem;
	quantity: number;
};

type ProductCatalogItem = {
	product: Product;
	variants: CatalogItem[];
	totalAvailable: number;
	totalReorderLevel: number;
	minimumPrice: number;
	maximumPrice: number;
};

type SaleReceipt = {
	orderNumber: string;
	shopName: string;
	shopAddress: string;
	shopPhone: string;
	cashierName: string;
	createdAt: Date;
	items: Array<{
		variantId: string;
		productName: string;
		variantName: string;
		quantity: number;
		unitPrice: number;
		lineTotal: number;
	}>;
	subtotal: number;
	discount: number;
	total: number;
	amountReceived: number;
	paymentMethod: string;
	change: number;
};

definePageMeta({ layout: 'dashboard', middleware: 'auth', ssr: false });

const route = useRoute();
const authStore = useAuthStore();
const nuxtApp = useNuxtApp() as any;
const db = nuxtApp.$firebase?.db;
const shopId = computed(() => String(route.params.shopId || ''));

const shop = ref<Shop | null>(null);
const catalog = ref<CatalogItem[]>([]);
const cart = ref<CartLine[]>([]);
const loading = ref(true);
const refreshing = ref(false);
const processing = ref(false);
const pageError = ref('');
const checkoutError = ref('');
const searchQuery = ref('');
const selectedCategory = ref('All');
const customerName = ref('');
const customerMobile = ref('');
const discount = ref(0);
const amountTendered = ref(0);
const paymentMethod = ref('cash');
const searchInputRef = ref<HTMLInputElement | null>(null);
const selectedProduct = ref<ProductCatalogItem | null>(null);
const receipt = ref<SaleReceipt | null>(null);

const paymentMethods = [
	{ value: 'cash', label: 'Cash' },
	{ value: 'card', label: 'Card' },
	{ value: 'e-wallet', label: 'E-wallet' },
];

useHead(() => ({ title: `POS${shop.value?.name ? ` · ${shop.value.name}` : ''} | My Near Shops` }));

const categories = computed(() => [...new Set(catalog.value.map((item: CatalogItem) => item.product.category?.trim()).filter(Boolean) as string[])].sort());
const productCatalog = computed<ProductCatalogItem[]>(() => {
	const grouped = new Map<string, CatalogItem[]>();
	catalog.value.forEach((item: CatalogItem) => {
		const variants = grouped.get(item.product.id) || [];
		variants.push(item);
		grouped.set(item.product.id, variants);
	});
	return [...grouped.values()].map((variants: CatalogItem[]) => {
		const prices = variants.map((item: CatalogItem) => Number(item.variant.price) || 0);
		return {
			product: variants[0].product,
			variants,
			totalAvailable: variants.reduce((sum: number, item: CatalogItem) => sum + item.availableQuantity, 0),
			totalReorderLevel: variants.reduce((sum: number, item: CatalogItem) => sum + item.reorderLevel, 0),
			minimumPrice: Math.min(...prices),
			maximumPrice: Math.max(...prices),
		};
	}).sort((left: ProductCatalogItem, right: ProductCatalogItem) => left.product.name.localeCompare(right.product.name));
});
const filteredProducts = computed(() => {
	const term = searchQuery.value.trim().toLowerCase();
	if (!term) return [];
	return productCatalog.value.filter((item: ProductCatalogItem) => {
		const matchesCategory = selectedCategory.value === 'All' || item.product.category === selectedCategory.value;
		const variantSearch = item.variants.map((variantItem: CatalogItem) => `${variantItem.variant.name} ${variantItem.variant.sku} ${variantItem.variant.barcode || ''}`).join(' ');
		const haystack = `${item.product.name} ${item.product.category || ''} ${variantSearch}`.toLowerCase();
		return matchesCategory && haystack.includes(term);
	});
});
const cartItemCount = computed(() => cart.value.reduce((sum: number, line: CartLine) => sum + line.quantity, 0));
const subtotal = computed(() => roundMoney(cart.value.reduce((sum: number, line: CartLine) => sum + line.item.variant.price * line.quantity, 0)));
const normalizedDiscount = computed(() => Math.min(subtotal.value, Math.max(0, Number(discount.value) || 0)));
const total = computed(() => roundMoney(subtotal.value - normalizedDiscount.value));
const change = computed(() => roundMoney((Number(amountTendered.value) || 0) - total.value));
const canCheckout = computed(() => cart.value.length > 0 && total.value >= 0 && (paymentMethod.value !== 'cash' || change.value >= 0));

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const formatMoney = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0);
const formatReceiptDate = (value: Date) => new Intl.DateTimeFormat('en-PH', {
	year: 'numeric',
	month: 'short',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
}).format(value);
const formatPriceRange = (item: ProductCatalogItem) => item.minimumPrice === item.maximumPrice
	? formatMoney(item.minimumPrice)
	: `${formatMoney(item.minimumPrice)} – ${formatMoney(item.maximumPrice)}`;
const formatVariantAttributes = (variant: ProductVariant) => {
	const attributes = [variant.attributes?.size, variant.attributes?.color].filter(Boolean);
	return attributes.length ? attributes.join(' · ') : 'Standard option';
};

const ensureShopAccess = async () => {
	const shopSnapshot = await getDoc(doc(db, 'shops', shopId.value));
	if (!shopSnapshot.exists()) throw new Error('Shop not found.');
	const shopData = shopSnapshot.data() as Record<string, any>;
	const loadedShop = { id: shopSnapshot.id, ...shopData } as Shop;
	const uid = authStore.user?.uid || '';
	const roleId = String(authStore.user?.roleId || '').toLowerCase();
	const isPlatformAdmin = roleId === 'super-admin';
	const isOwner = loadedShop.ownerId === uid;
	const membershipSnapshot = uid ? await getDoc(doc(db, 'shopMembers', `${shopId.value}_${uid}`)) : null;
	if (!isPlatformAdmin && !isOwner && !membershipSnapshot?.exists()) throw new Error('You do not have access to this shop register.');
	if (loadedShop.isActive === false) throw new Error('This shop is inactive.');
	shop.value = loadedShop;
};

const loadCatalog = async () => {
	if (!db) {
		pageError.value = 'Firebase is not available.';
		loading.value = false;
		return;
	}
	refreshing.value = true;
	pageError.value = '';
	try {
		if (!shop.value) await ensureShopAccess();
		const productsSnapshot = await getDocs(query(collection(db, 'products'), where('shopId', '==', shopId.value)));
		const products = productsSnapshot.docs
			.map((entry: any) => ({ id: entry.id, ...entry.data() } as Product))
			.filter((product: Product) => product.isActive !== false && !product.deletedAt);
		const productMap = new Map(products.map((product) => [product.id, product]));
		const productIds = products.map((product) => product.id);
		const chunks: string[][] = [];
		for (let index = 0; index < productIds.length; index += 30) chunks.push(productIds.slice(index, index + 30));
		const variantSnapshots = await Promise.all(chunks.map((ids) => getDocs(query(collection(db, 'productVariants'), where('productId', 'in', ids)))));
		const variants = variantSnapshots.flatMap((snapshot: any) => snapshot.docs.map((entry: any) => ({ id: entry.id, ...entry.data() } as ProductVariant)));
		const inventoryEntries = await Promise.all(variants.map(async (variant) => {
			const inventorySnapshot = await getDoc(doc(db, 'inventory', variant.id));
			if (!inventorySnapshot.exists()) return null;
			const inventoryData = inventorySnapshot.data() as Omit<Inventory, 'id'>;
			return { variant, inventory: { id: inventorySnapshot.id, ...inventoryData } as Inventory };
		}));
		catalog.value = inventoryEntries.flatMap((entry) => {
			if (!entry) return [];
			const product = productMap.get(entry.variant.productId);
			if (!product || (entry.variant as any).isActive === false) return [];
			return [{
				product,
				variant: entry.variant,
				availableQuantity: Number(entry.inventory.availableQuantity ?? entry.inventory.quantity ?? 0),
				reorderLevel: Number(entry.inventory.reorderLevel || 0),
			}];
		}).sort((a, b) => a.product.name.localeCompare(b.product.name));
		cart.value = cart.value.flatMap((line: CartLine) => {
			const freshItem = catalog.value.find((item: CatalogItem) => item.variant.id === line.item.variant.id);
			if (!freshItem || freshItem.availableQuantity <= 0) return [];
			return [{ item: freshItem, quantity: Math.min(line.quantity, freshItem.availableQuantity) }];
		});
	} catch (error: any) {
		pageError.value = error?.message || 'Failed to load the register.';
	} finally {
		loading.value = false;
		refreshing.value = false;
	}
};

const addToCart = (item: CatalogItem) => {
	checkoutError.value = '';
	const existing = cart.value.find((line: CartLine) => line.item.variant.id === item.variant.id);
	if (existing) {
		if (existing.quantity < item.availableQuantity) existing.quantity += 1;
	} else if (item.availableQuantity > 0) {
		cart.value.push({ item, quantity: 1 });
	}
	searchQuery.value = '';
	searchInputRef.value?.focus();
};

const openVariantPicker = (item: ProductCatalogItem) => {
	selectedProduct.value = item;
};

const closeVariantPicker = () => {
	selectedProduct.value = null;
};

const handleAddToCart = (item: CatalogItem) => {
	if (item.availableQuantity <= 0) return;
	addToCart(item);
	closeVariantPicker();
};

const addExactMatch = () => {
	const term = searchQuery.value.trim().toLowerCase();
	const exact = catalog.value.find((item: CatalogItem) => {
		return item.variant.sku.toLowerCase() === term || item.variant.barcode === term;
	});
	if (exact) addToCart(exact);
	else if (filteredProducts.value.length === 1) openVariantPicker(filteredProducts.value[0]);
};

const changeQuantity = (variantId: string, amount: number) => {
	const line = cart.value.find((entry: CartLine) => entry.item.variant.id === variantId);
	if (!line) return;
	const nextQuantity = line.quantity + amount;
	if (nextQuantity <= 0) removeFromCart(variantId);
	else if (nextQuantity <= line.item.availableQuantity) line.quantity = nextQuantity;
};

const removeFromCart = (variantId: string) => {
	cart.value = cart.value.filter((line: CartLine) => line.item.variant.id !== variantId);
};

const clearSale = () => {
	cart.value = [];
	customerName.value = '';
	customerMobile.value = '';
	discount.value = 0;
	amountTendered.value = 0;
	checkoutError.value = '';
};

const completeSale = async () => {
	if (!db || !shop.value || !canCheckout.value || processing.value) return;
	checkoutError.value = '';
	processing.value = true;
	const saleLines: CartLine[] = cart.value.map((line: CartLine) => ({ ...line, quantity: Number(line.quantity) }));
	const transactionRef = doc(collection(db, 'transactions'));
	const orderNumber = `POS-${Date.now().toString().slice(-8)}`;
	const cashierId = authStore.user?.uid || '';
	try {
		await runLoggedTransaction(db, async (firestoreTransaction: any) => {
			const inventorySnapshots = await Promise.all(saleLines.map((line: CartLine) => firestoreTransaction.get(doc(db, 'inventory', line.item.variant.id))));
			inventorySnapshots.forEach((snapshot: any, index: number) => {
				const line = saleLines[index];
				if (!snapshot.exists()) throw new Error(`Inventory was not found for ${line.item.product.name} (${line.item.variant.name}).`);
				const data = snapshot.data() as Inventory;
				const available = Number(data.availableQuantity ?? data.quantity ?? 0);
				const quantity = Number(data.quantity ?? available);
				if (available < line.quantity || quantity < line.quantity) throw new Error(`Only ${Math.min(available, quantity)} item(s) of ${line.item.product.name} (${line.item.variant.name}) are available.`);
			});

			const items = saleLines.map((line: CartLine) => ({
				product_id: line.item.product.id,
				variant_id: line.item.variant.id,
				variant_sku: line.item.variant.sku,
				variant_barcode: line.item.variant.barcode || null,
				variant_name: line.item.variant.name,
				variant_attributes: line.item.variant.attributes || null,
				shop_id: shopId.value,
				name: line.item.product.name,
				price: Number(line.item.variant.price),
				qty: line.quantity,
				subtotal: roundMoney(line.item.variant.price * line.quantity),
			}));

			firestoreTransaction.set(transactionRef, {
				order_number: orderNumber,
				user_id: '',
				store_id: shopId.value,
				store_location: { latitude: shop.value?.latitude || 0, longitude: shop.value?.longitude || 0 },
				delivery_method: 'pickup',
				payment_method: paymentMethod.value,
				items,
				subtotal: subtotal.value,
				discount: normalizedDiscount.value,
				delivery_charge: 0,
				total: total.value,
				currency: 'PHP',
				amount_tendered: paymentMethod.value === 'cash' ? Number(amountTendered.value) : total.value,
				change: paymentMethod.value === 'cash' ? Math.max(0, change.value) : 0,
				customer_name: customerName.value.trim() || null,
				customer_mobile: customerMobile.value.trim() || null,
				cashier_id: cashierId,
				cashier_name: authStore.displayName,
				sales_channel: 'pos',
				status: 'completed',
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			saleLines.forEach((line: CartLine, index: number) => {
				const inventorySnapshot = inventorySnapshots[index];
				const inventoryData = inventorySnapshot.data() as Inventory;
				const available = Number(inventoryData.availableQuantity ?? inventoryData.quantity ?? 0);
				const quantity = Number(inventoryData.quantity ?? available);
				firestoreTransaction.update(inventorySnapshot.ref, {
					quantity: quantity - line.quantity,
					availableQuantity: available - line.quantity,
					updatedAt: serverTimestamp(),
				});
				firestoreTransaction.set(doc(collection(db, 'inventoryTransactions')), {
					variantId: line.item.variant.id,
					type: 'OUT',
					quantity: line.quantity,
					referenceType: 'SALE',
					referenceId: transactionRef.id,
					createdAt: serverTimestamp(),
					createdBy: cashierId,
				});
			});
		}, {
			orderNumber,
			shopId: shopId.value,
			total: total.value,
			itemCount: cartItemCount.value,
		}, { affectedCollections: ['transactions', 'inventory', 'inventoryTransactions'] });

		receipt.value = {
			orderNumber,
			shopName: shop.value.name,
			shopAddress: shop.value.address || '',
			shopPhone: shop.value.phone || '',
			cashierName: authStore.displayName || 'Cashier',
			createdAt: new Date(),
			items: saleLines.map((line: CartLine) => ({
				variantId: line.item.variant.id,
				productName: line.item.product.name,
				variantName: line.item.variant.name,
				quantity: line.quantity,
				unitPrice: Number(line.item.variant.price),
				lineTotal: roundMoney(line.item.variant.price * line.quantity),
			})),
			subtotal: subtotal.value,
			discount: normalizedDiscount.value,
			total: total.value,
			amountReceived: paymentMethod.value === 'cash' ? Number(amountTendered.value) : total.value,
			paymentMethod: paymentMethods.find((method) => method.value === paymentMethod.value)?.label || paymentMethod.value,
			change: paymentMethod.value === 'cash' ? Math.max(0, change.value) : 0,
		};
		clearSale();
		await loadCatalog();
	} catch (error: any) {
		checkoutError.value = error?.message || 'The sale could not be completed.';
	} finally {
		processing.value = false;
	}
};

const printReceipt = () => {
	document.body.classList.add('printing-pos-receipt');
	window.print();
	document.body.classList.remove('printing-pos-receipt');
};

const closeReceipt = async () => {
	receipt.value = null;
	await nextTick();
	searchInputRef.value?.focus();
};

onMounted(loadCatalog);
</script>

<style scoped>
.pos-page { max-width: 1500px; margin: 0 auto; color: #172033; }
.pos-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
.pos-header h1 { margin: 5px 0 2px; font-size: 28px; letter-spacing: 0; }
.pos-header p { margin: 0; color: #687386; font-size: 14px; }
.back-link { border: 0; padding: 0; background: transparent; color: #526071; display: inline-flex; align-items: center; gap: 5px; font-weight: 700; cursor: pointer; }
.register-status { display: inline-flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid #cce8d3; border-radius: 8px; background: #f0faf2; color: #25743a; font-size: 12px; font-weight: 800; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #2f9e44; box-shadow: 0 0 0 3px #d7f3dd; }
.page-state { min-height: 420px; display: flex; align-items: center; justify-content: center; gap: 12px; color: #687386; background: #fff; border: 1px solid #dfe4ea; border-radius: 8px; }
.error-state { color: #b42318; background: #fff7f6; border-color: #ffd2cc; }
.spinner { width: 24px; height: 24px; border: 3px solid #e8ebef; border-top-color: #18794e; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.pos-grid { min-height: calc(100vh - 150px); display: grid; grid-template-columns: minmax(0, 1fr) 390px; gap: 16px; align-items: start; }
.catalog-panel, .cart-panel { background: #fff; border: 1px solid #dfe4ea; border-radius: 8px; box-shadow: 0 4px 16px rgba(30,41,59,.05); }
.catalog-panel { min-height: 650px; padding: 18px; }
.catalog-toolbar { display: flex; gap: 10px; }
.search-box { min-height: 44px; flex: 1; display: flex; align-items: center; gap: 10px; padding: 0 13px; border: 1px solid #cfd6df; border-radius: 7px; color: #687386; }
.search-box:focus-within { border-color: #18794e; box-shadow: 0 0 0 3px rgba(24,121,78,.12); }
.search-box input { width: 100%; border: 0; outline: 0; font: inherit; color: #172033; }
.refresh-btn { width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid #cfd6df; border-radius: 7px; background: #fff; color: #526071; cursor: pointer; }
.refresh-btn:hover { background: #f6f8fa; }
.category-strip { display: flex; gap: 7px; margin: 14px 0 18px; padding-bottom: 4px; overflow-x: auto; }
.category-strip button { min-height: 34px; padding: 0 13px; border: 1px solid #dfe4ea; border-radius: 7px; background: #fff; color: #526071; font-size: 12px; font-weight: 750; white-space: nowrap; cursor: pointer; }
.category-strip button.active { border-color: #18794e; background: #eaf6ef; color: #14643f; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); gap: 12px; }
.product-tile { min-height: 156px; padding: 13px; overflow: hidden; border: 1px solid #dfe4ea; border-radius: 7px; background: #fff; display: flex; flex-direction: column; text-align: left; cursor: pointer; transition: border-color .16s, box-shadow .16s, transform .16s; }
.product-tile:hover { border-color: #75b798; box-shadow: 0 7px 18px rgba(30,41,59,.09); transform: translateY(-1px); }
.product-tile.unavailable { opacity: .55; cursor: not-allowed; }
.product-tile-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 13px; }
.category-label { min-width: 0; overflow: hidden; color: #687386; font-size: 10px; font-weight: 800; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.product-tile-top em { flex: 0 0 auto; padding: 4px 6px; border-radius: 5px; background: #eaf6ef; color: #25743a; font-size: 9px; font-style: normal; font-weight: 850; }
.product-tile-top em.low { color: #b54708; background: #fff3dc; }
.product-copy { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.product-copy strong { color: #172033; font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
.product-copy .variant-name { margin-top: 4px; color: #526071; font-size: 11px; font-weight: 650; overflow-wrap: anywhere; }
.product-copy .sku { margin-top: 3px; color: #8a95a4; font-size: 10px; overflow-wrap: anywhere; }
.product-price-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 13px; border-top: 1px solid #edf0f3; }
.product-price-row b { min-width: 0; color: #14643f; font-size: 14px; line-height: 1.3; overflow-wrap: anywhere; }
.product-price-row span { flex: 0 0 auto; color: #18794e; font-size: 11px; font-weight: 850; }
.catalog-empty, .cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #8a95a4; }
.catalog-empty { min-height: 400px; gap: 8px; }
.catalog-empty strong, .cart-empty strong { color: #526071; }
.catalog-empty span, .cart-empty span { font-size: 12px; }
.cart-panel { position: sticky; top: 82px; display: flex; flex-direction: column; }
.cart-heading { min-height: 66px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; border-bottom: 1px solid #e8ebef; }
.cart-heading > div { display: grid; gap: 3px; }
.cart-heading span { color: #7b8797; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.cart-heading strong { font-size: 16px; }
.clear-btn, .remove-btn { border: 0; background: transparent; color: #c03a2b; font-weight: 750; cursor: pointer; }
.cart-empty { min-height: 220px; gap: 7px; padding: 24px; }
.cart-items { padding: 4px 18px; }
.cart-line { padding: 13px 0; border-bottom: 1px solid #edf0f3; }
.line-main, .line-controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.line-main > div { min-width: 0; display: grid; gap: 3px; }
.line-main strong { font-size: 13px; overflow-wrap: anywhere; }
.line-main span { color: #7b8797; font-size: 10px; overflow-wrap: anywhere; }
.remove-btn { width: 30px; height: 30px; display: grid; place-items: center; flex: 0 0 auto; }
.line-controls { margin-top: 10px; }
.quantity-control { height: 30px; display: grid; grid-template-columns: 30px 35px 30px; border: 1px solid #d8dee6; border-radius: 6px; overflow: hidden; }
.quantity-control button { border: 0; background: #f6f8fa; color: #344054; font-size: 17px; cursor: pointer; }
.quantity-control button:disabled { opacity: .4; cursor: not-allowed; }
.quantity-control span { display: grid; place-items: center; border-inline: 1px solid #d8dee6; font-size: 12px; font-weight: 800; }
.customer-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 14px 18px; border-top: 1px solid #e8ebef; }
.customer-fields input { width: 100%; min-width: 0; box-sizing: border-box; padding: 9px 10px; border: 1px solid #d8dee6; border-radius: 6px; outline: none; font-size: 12px; }
.customer-fields input:focus { border-color: #18794e; }
.totals { display: grid; gap: 9px; padding: 14px 18px; border-top: 1px solid #e8ebef; background: #fafbfc; }
.totals > div, .discount-row, .change-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; color: #526071; font-size: 12px; }
.money-input { display: inline-flex; align-items: center; width: 105px; height: 30px; border: 1px solid #d8dee6; border-radius: 6px; background: #fff; }
.money-input b { padding-left: 8px; color: #687386; }
.money-input input { width: 100%; min-width: 0; border: 0; outline: 0; padding: 0 7px; background: transparent; text-align: right; }
.grand-total { padding-top: 9px; border-top: 1px dashed #cfd6df; color: #172033 !important; font-size: 16px !important; }
.grand-total strong { font-size: 22px; color: #14643f; }
.payment-section { display: grid; gap: 9px; padding: 13px 18px; border-top: 1px solid #e8ebef; }
.field-label { color: #687386; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.payment-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.payment-options button { min-height: 36px; border: 1px solid #d8dee6; border-radius: 6px; background: #fff; color: #526071; font-size: 11px; font-weight: 800; cursor: pointer; }
.payment-options button.active { border-color: #18794e; background: #eaf6ef; color: #14643f; }
.cash-field { display: flex; align-items: center; justify-content: space-between; color: #526071; font-size: 12px; }
.money-input.large { width: 145px; height: 36px; }
.change-row { padding-top: 8px; border-top: 1px dashed #d8dee6; color: #14643f; }
.change-row.insufficient { color: #b42318; }
.checkout-error { margin: 0 18px 10px; padding: 9px 10px; border-radius: 6px; background: #fff1f0; color: #b42318; font-size: 11px; }
.checkout-btn { min-height: 52px; margin: 0 18px 18px; padding: 0 16px; border: 0; border-radius: 7px; display: flex; align-items: center; justify-content: space-between; background: #18794e; color: #fff; font-size: 14px; font-weight: 850; cursor: pointer; }
.checkout-btn:hover { background: #14643f; }
.checkout-btn:disabled { background: #aab4bf; cursor: not-allowed; }
.modal-overlay { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; padding: 20px; background: rgba(17,24,39,.56); }
.variant-card { width: min(520px, 100%); max-height: calc(100vh - 40px); overflow: hidden; border-radius: 8px; background: #fff; box-shadow: 0 24px 70px rgba(0,0,0,.24); }
.variant-card-header { min-height: 72px; padding: 0 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid #e8ebef; }
.variant-card-header > div { min-width: 0; }
.variant-card-header span { color: #687386; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.variant-card-header h2 { margin: 3px 0 0; color: #172033; font-size: 18px; overflow-wrap: anywhere; }
.variant-card-header > button { width: 34px; height: 34px; flex: 0 0 auto; border: 0; border-radius: 6px; background: #f3f5f7; color: #526071; font-size: 23px; cursor: pointer; }
.variant-list { max-height: calc(100vh - 150px); overflow-y: auto; display: grid; gap: 8px; padding: 14px; }
.variant-row { width: 100%; min-height: 76px; padding: 12px; border: 1px solid #dfe4ea; border-radius: 7px; background: #fff; display: flex; align-items: center; justify-content: space-between; gap: 16px; text-align: left; cursor: pointer; transition: border-color .16s, background .16s; }
.variant-row:hover { border-color: #75b798; background: #f7fbf8; }
.variant-row:disabled { opacity: .58; background: #f6f8fa; cursor: not-allowed; }
.variant-row-main { min-width: 0; display: grid; gap: 3px; }
.variant-row-main strong { color: #172033; font-size: 13px; overflow-wrap: anywhere; }
.variant-row-main span { color: #526071; font-size: 11px; overflow-wrap: anywhere; }
.variant-row-main small { color: #8a95a4; font-size: 10px; overflow-wrap: anywhere; }
.variant-row-meta { flex: 0 0 auto; display: grid; justify-items: end; gap: 5px; }
.variant-row-meta strong { color: #14643f; font-size: 14px; }
.variant-row-meta span { padding: 4px 6px; border-radius: 5px; background: #eaf6ef; color: #25743a; font-size: 9px; font-weight: 850; }
.variant-row-meta span.low { color: #b54708; background: #fff3dc; }
.receipt-card { width: min(390px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; padding: 22px; border-radius: 8px; background: #fff; box-shadow: 0 24px 70px rgba(0,0,0,.24); }
.receipt-paper { color: #111; font-family: Consolas, 'Courier New', monospace; font-size: 11px; }
.receipt-shop { padding-bottom: 13px; border-bottom: 1px dashed #777; text-align: center; }
.receipt-shop h2 { margin: 0 0 5px; font-size: 19px; text-transform: uppercase; }
.receipt-shop p { margin: 2px 0; line-height: 1.35; overflow-wrap: anywhere; }
.receipt-meta { display: grid; gap: 4px; padding: 12px 0; border-bottom: 1px dashed #777; }
.receipt-meta div, .receipt-totals div { display: flex; justify-content: space-between; gap: 12px; }
.receipt-meta strong { text-align: right; }
.receipt-product-heading, .receipt-product { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; }
.receipt-product-heading { padding: 8px 0 5px; border-bottom: 1px solid #bbb; font-weight: 800; text-transform: uppercase; }
.receipt-product-heading span:last-child { text-align: right; }
.receipt-product { align-items: start; padding: 8px 0; border-bottom: 1px dotted #bbb; }
.receipt-product > div { min-width: 0; display: grid; gap: 2px; }
.receipt-product strong { overflow-wrap: anywhere; }
.receipt-product > strong { white-space: nowrap; }
.receipt-product small { color: #333; line-height: 1.35; }
.receipt-totals { display: grid; gap: 5px; padding: 12px 0; border-bottom: 1px dashed #777; }
.receipt-total { margin: 3px 0; padding: 7px 0; border-block: 1px solid #111; font-size: 15px; }
.receipt-thanks { display: grid; gap: 4px; padding: 16px 0 5px; text-align: center; }
.receipt-thanks strong { font-size: 13px; }
.receipt-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 18px; }
.receipt-actions button { min-height: 43px; border: 0; border-radius: 7px; font-weight: 800; cursor: pointer; }
.print-receipt-btn { background: #18794e; color: #fff; }
.new-sale-btn { background: #172033; color: #fff; }
@media (max-width: 1050px) {
	.pos-grid { grid-template-columns: minmax(0, 1fr) 340px; }
	.product-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
}
@media (max-width: 800px) {
	.pos-grid { grid-template-columns: 1fr; }
	.cart-panel { position: static; max-height: none; }
	.catalog-panel { min-height: 0; }
	.cart-items { max-height: none; }
}
@media (max-width: 520px) {
	.pos-header { align-items: flex-start; }
	.register-status { display: none; }
	.catalog-panel { padding: 12px; }
	.product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
	.product-tile { min-height: 150px; padding: 11px; }
	.customer-fields { grid-template-columns: 1fr; }
	.variant-row { align-items: flex-start; }
	.variant-row-meta { max-width: 42%; }
}
</style>

<style>
@media print {
	@page { size: 80mm auto; margin: 0; }
	body.printing-pos-receipt { margin: 0; background: #fff; }
	body.printing-pos-receipt * { visibility: hidden !important; }
	body.printing-pos-receipt .receipt-card,
	body.printing-pos-receipt .receipt-card * { visibility: visible !important; }
	body.printing-pos-receipt .modal-overlay { position: static !important; display: block !important; padding: 0 !important; background: transparent !important; }
	body.printing-pos-receipt .receipt-card {
		position: absolute !important;
		inset: 0 auto auto 0 !important;
		width: 80mm !important;
		max-height: none !important;
		box-sizing: border-box !important;
		overflow: visible !important;
		padding: 4mm !important;
		border-radius: 0 !important;
		box-shadow: none !important;
	}
	body.printing-pos-receipt .receipt-actions { display: none !important; }
	body.printing-pos-receipt .receipt-paper { font-size: 10px !important; }
}
</style>
