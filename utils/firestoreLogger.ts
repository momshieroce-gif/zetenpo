import {
  addDoc as fbAddDoc,
  collection as fbCollection,
  deleteDoc as fbDeleteDoc,
  doc,
  documentId,
  getDoc as fbGetDoc,
  getDocs as fbGetDocs,
  limit,
  onSnapshot as fbOnSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc as fbSetDoc,
  Timestamp,
  updateDoc as fbUpdateDoc,
  where,
} from 'firebase/firestore';

export { collection, doc, documentId, limit, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';

type LogOperation = 'read' | 'write' | 'delete' | 'login' | 'logout';

type LogPayload = {
  operation: LogOperation;
  collectionPath?: string;
  documentPath?: string;
  status: 'success' | 'error';
  details?: Record<string, unknown>;
};

const recentLogKeys = new Map<string, number>();
const LOG_DEDUPE_WINDOW_MS = 1500;

function getLogKey(payload: LogPayload, uid: string | null, routePath: string | null): string {
  return [
    uid || 'anon',
    payload.operation,
    payload.status,
    payload.collectionPath || '',
    payload.documentPath || '',
    routePath || '',
  ].join('|');
}

function shouldSkipDuplicateLog(key: string): boolean {
  const now = Date.now();
  const last = recentLogKeys.get(key);

  for (const [savedKey, savedAt] of recentLogKeys.entries()) {
    if (now - savedAt > LOG_DEDUPE_WINDOW_MS * 3) {
      recentLogKeys.delete(savedKey);
    }
  }

  if (typeof last === 'number' && now - last < LOG_DEDUPE_WINDOW_MS) {
    return true;
  }

  recentLogKeys.set(key, now);
  return false;
}

function getPath(value: any): string {
  if (!value) return '';
  if (typeof value.path === 'string') return value.path;

  const internalPath = value?._query?.path;
  if (!internalPath) return '';
  if (typeof internalPath.canonicalString === 'function') return internalPath.canonicalString();
  if (Array.isArray(internalPath.segments)) return internalPath.segments.join('/');

  return '';
}

function isUserLogsPath(path: string): boolean {
  if (!path) return false;
  return path.split('/')[0] === 'userLogs';
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

    const dedupeKey = getLogKey(payload, uid, routePath);
    if (shouldSkipDuplicateLog(dedupeKey)) {
      return;
    }

    await fbAddDoc(fbCollection(db, 'userLogs'), {
      uid,
      email,
      operation: payload.operation,
      collectionPath: payload.collectionPath || null,
      documentPath: payload.documentPath || null,
      status: payload.status,
      details: payload.details || null,
      routePath,
      userAgent: process.client ? navigator.userAgent : null,
      createdAt: serverTimestamp(),
      clientCreatedAt: Date.now(),
    });
  } catch {
    // Logging must never block user actions.
  }
}

async function logFirestore(
  operation: Extract<LogOperation, 'read' | 'write' | 'delete'>,
  reference: any,
  status: 'success' | 'error',
  details?: Record<string, unknown>
): Promise<void> {
  const path = getPath(reference);
  if (isUserLogsPath(path)) return;

  const segments = path ? path.split('/') : [];
  const collectionPath = segments.length > 0
    ? (segments.length % 2 === 0 ? segments.slice(0, -1).join('/') : segments.join('/'))
    : undefined;

  await writeUserLog({
    operation,
    collectionPath,
    documentPath: segments.length % 2 === 0 ? path : undefined,
    status,
    details,
  });
}

export async function logUserAuthActivity(
  operation: Extract<LogOperation, 'login' | 'logout'>,
  status: 'success' | 'error',
  details?: Record<string, unknown>
): Promise<void> {
  await writeUserLog({
    operation,
    status,
    details,
  });
}

export const getDoc = async (...args: any[]) => {
  const [reference] = args;
  try {
    const result = await fbGetDoc(reference);
    await logFirestore('read', reference, 'success', { exists: result.exists() });
    return result;
  } catch (error: any) {
    await logFirestore('read', reference, 'error', { message: error?.message || 'Unknown error' });
    throw error;
  }
};

export const getDocs = async (...args: any[]) => {
  const [reference] = args;
  try {
    const result = await fbGetDocs(reference);
    await logFirestore('read', reference, 'success', { count: result.size });
    return result;
  } catch (error: any) {
    await logFirestore('read', reference, 'error', { message: error?.message || 'Unknown error' });
    throw error;
  }
};

export const addDoc = async (...args: any[]) => {
  const [reference, data] = args;
  try {
    const result = await fbAddDoc(reference, data);
    await logFirestore('write', result, 'success');
    return result;
  } catch (error: any) {
    await logFirestore('write', reference, 'error', { message: error?.message || 'Unknown error' });
    throw error;
  }
};

export const setDoc = async (...args: any[]) => {
  const [reference, data, options] = args;
  try {
    const result = await fbSetDoc(reference, data, options);
    await logFirestore('write', reference, 'success');
    return result;
  } catch (error: any) {
    await logFirestore('write', reference, 'error', { message: error?.message || 'Unknown error' });
    throw error;
  }
};

export const updateDoc = async (...args: any[]) => {
  const [reference, ...rest] = args;
  try {
    const result = await (fbUpdateDoc as any)(reference, ...rest);
    await logFirestore('write', reference, 'success');
    return result;
  } catch (error: any) {
    await logFirestore('write', reference, 'error', { message: error?.message || 'Unknown error' });
    throw error;
  }
};

export const deleteDoc = async (...args: any[]) => {
  const [reference] = args;
  try {
    const result = await fbDeleteDoc(reference);
    await logFirestore('delete', reference, 'success');
    return result;
  } catch (error: any) {
    await logFirestore('delete', reference, 'error', { message: error?.message || 'Unknown error' });
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
      async (snapshot: any) => {
        const count = typeof snapshot?.size === 'number' ? snapshot.size : 1;
        await logFirestore('read', reference, 'success', { source: 'onSnapshot', count });
        next(snapshot);
      },
      async (err: any) => {
        await logFirestore('read', reference, 'error', { source: 'onSnapshot', message: err?.message || 'Snapshot error' });
        if (error) error(err);
      }
    );
  }

  if (observerOrNext && typeof observerOrNext === 'object') {
    const observer = observerOrNext;
    return fbOnSnapshot(reference, {
      ...observer,
      next: async (snapshot: any) => {
        const count = typeof snapshot?.size === 'number' ? snapshot.size : 1;
        await logFirestore('read', reference, 'success', { source: 'onSnapshot', count });
        if (typeof observer.next === 'function') observer.next(snapshot);
      },
      error: async (err: any) => {
        await logFirestore('read', reference, 'error', { source: 'onSnapshot', message: err?.message || 'Snapshot error' });
        if (typeof observer.error === 'function') observer.error(err);
      },
    });
  }

  return (fbOnSnapshot as any)(...args);
};
