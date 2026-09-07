import {
  addDoc as fbAddDoc,
  collection as fbCollection,
  deleteDoc as fbDeleteDoc,
  doc,
  documentId,
  getDoc as fbGetDoc,
  getDocs as fbGetDocs,
  onSnapshot as fbOnSnapshot,
  runTransaction as fbRunTransaction,
  serverTimestamp,
  setDoc as fbSetDoc,
  Timestamp,
  updateDoc as fbUpdateDoc,
} from 'firebase/firestore';

export { collection, doc, documentId, limit, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';

type LogOperation = 'create' | 'update' | 'delete';

type LogPayload = {
  operation: LogOperation;
  collectionPath?: string;
  documentPath?: string;
  status: 'success' | 'error';
  payload: unknown;
  details?: Record<string, unknown>;
};

function getPath(value: any): string {
  if (!value) return '';
  if (typeof value.path === 'string') return value.path;

  const internalPath = value?._query?.path;
  if (!internalPath) return '';
  if (typeof internalPath.canonicalString === 'function') return internalPath.canonicalString();
  if (Array.isArray(internalPath.segments)) return internalPath.segments.join('/');

  return '';
}

async function writeUserLog(payload: LogPayload): Promise<void> {
  try {
    const nuxtApp = useNuxtApp() as any;
    const db = nuxtApp?.$firebase?.db;
    const auth = nuxtApp?.$firebase?.auth;
    if (!db) return;

    const authStore = useAuthStore();
    const route = useRoute();
    const uid = authStore.user?.uid || auth?.currentUser?.uid || null;
    const email = authStore.user?.email || auth?.currentUser?.email || null;
    const routePath = route?.fullPath || null;
    const clientCreatedAt = Date.now();

    await fbAddDoc(fbCollection(db, 'userLogs'), {
      uid,
      email,
      operation: payload.operation,
      collectionPath: payload.collectionPath || null,
      documentPath: payload.documentPath || null,
      status: payload.status,
      payload: payload.payload ?? null,
      details: payload.details || null,
      routePath,
      userAgent: process.client ? navigator.userAgent : null,
      createdAt: serverTimestamp(),
      clientCreatedAt,
    });
  } catch {
    // Logging must never block user actions.
  }
}

async function logFirestore(
  operation: LogOperation,
  reference: any,
  status: 'success' | 'error',
  payload: unknown,
  details?: Record<string, unknown>
): Promise<void> {
  const path = getPath(reference);
  const segments = path ? path.split('/') : [];
  const collectionPath = segments.length > 0
    ? (segments.length % 2 === 0 ? segments.slice(0, -1).join('/') : segments.join('/'))
    : undefined;
  const documentPath = segments.length % 2 === 0 ? path : undefined;

  if (status === 'error') {
    console.error('[Firestore operation failed]', {
      operation,
      collection: collectionPath || 'unknown',
      document: documentPath || null,
      code: details?.code || null,
      message: details?.message || 'Unknown error',
    });
  }

  if (path.split('/')[0] === 'userLogs') return;

  await writeUserLog({
    operation,
    collectionPath,
    documentPath,
    status,
    payload,
    details,
  });
}

export const getDoc = async (...args: any[]) => {
  const [reference] = args;
  return fbGetDoc(reference);
};

export const getDocs = async (...args: any[]) => {
  const [reference] = args;
  return fbGetDocs(reference);
};

export const addDoc = async (...args: any[]) => {
  const [reference, data] = args;
  try {
    const result = await fbAddDoc(reference, data);
    await logFirestore('create', result, 'success', data);
    return result;
  } catch (error: any) {
    await logFirestore('create', reference, 'error', data, { code: error?.code, message: error?.message || 'Unknown error' });
    throw error;
  }
};

export const setDoc = async (...args: any[]) => {
  const [reference, data, options] = args;
  try {
    const result = await fbSetDoc(reference, data, options);
    await logFirestore('create', reference, 'success', data);
    return result;
  } catch (error: any) {
    await logFirestore('create', reference, 'error', data, { code: error?.code, message: error?.message || 'Unknown error' });
    throw error;
  }
};

export const updateDoc = async (...args: any[]) => {
  const [reference, ...rest] = args;
  const payload = rest.length === 1 ? rest[0] : rest;
  try {
    const result = await (fbUpdateDoc as any)(reference, ...rest);
    await logFirestore('update', reference, 'success', payload);
    return result;
  } catch (error: any) {
    await logFirestore('update', reference, 'error', payload, { code: error?.code, message: error?.message || 'Unknown error' });
    throw error;
  }
};

export const deleteDoc = async (...args: any[]) => {
  const [reference] = args;
  try {
    const result = await fbDeleteDoc(reference);
    await logFirestore('delete', reference, 'success', null);
    return result;
  } catch (error: any) {
    await logFirestore('delete', reference, 'error', null, { code: error?.code, message: error?.message || 'Unknown error' });
    throw error;
  }
};

export const onSnapshot = (...args: any[]) => {
  const reference = args[0];
  const observerOrNext = args[1];
  const errorArg = args[2];

  if (typeof observerOrNext === 'function') {
    const next = observerOrNext;
    const error = typeof errorArg === 'function' ? errorArg : undefined;

    return fbOnSnapshot(
      reference,
      (snapshot: any) => {
        next(snapshot);
      },
      (err: any) => {
        if (error) error(err);
      }
    );
  }

  if (observerOrNext && typeof observerOrNext === 'object') {
    const observer = observerOrNext;
    return fbOnSnapshot(reference, {
      ...observer,
      next: (snapshot: any) => {
        if (typeof observer.next === 'function') observer.next(snapshot);
      },
      error: (err: any) => {
        if (typeof observer.error === 'function') observer.error(err);
      },
    });
  }

  return (fbOnSnapshot as any)(...args);
};

export const runLoggedTransaction = async (
  db: any,
  updateFunction: (transaction: any) => Promise<any>,
  payload: unknown,
  details?: Record<string, unknown>
) => {
  try {
    const result = await fbRunTransaction(db, updateFunction);
    await writeUserLog({
      operation: 'update',
      collectionPath: 'transactions',
      status: 'success',
      payload,
      details: { atomic: true, ...details },
    });
    return result;
  } catch (error: any) {
    await writeUserLog({
      operation: 'update',
      collectionPath: 'transactions',
      status: 'error',
      payload,
      details: { atomic: true, ...details, code: error?.code, message: error?.message || 'Unknown error' },
    });
    throw error;
  }
};
