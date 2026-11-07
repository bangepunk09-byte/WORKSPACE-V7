import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let isFirebaseConfigured = false;

try {
  // Check if firebase-applet-config.json exists dynamically or in window
  // In development before provisioning, we fall back gracefully to modern IndexedDB reactive storage
  const config = (window as unknown as { __FIREBASE_CONFIG__?: Record<string, string> }).__FIREBASE_CONFIG__;
  if (config && config.apiKey) {
    const app = !getApps().length ? initializeApp(config) : getApp();
    dbInstance = getFirestore(app);
    authInstance = getAuth(app);
    isFirebaseConfigured = true;

    // Validate connection to Firestore
    getDocFromServer(doc(dbInstance, 'test', 'connection')).catch((error) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firestore offline check note.');
      }
    });
  }
} catch {
  // Graceful fallback to rich local state
  isFirebaseConfigured = false;
}

export const db = dbInstance;
export const auth = authInstance;
export const isConfigured = isFirebaseConfigured;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid || 'local-user',
      email: authInstance?.currentUser?.email || 'local-user@asliri.id',
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Context: ', JSON.stringify(errInfo));
}
