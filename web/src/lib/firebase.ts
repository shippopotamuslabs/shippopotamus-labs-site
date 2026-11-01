import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

function envString(key: string): string | undefined {
  const value = import.meta.env[key];
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Public Firebase web config from Vite env. Never contains secrets. */
export function readFirebaseConfigFromEnv(): FirebasePublicConfig | null {
  const apiKey = envString("VITE_FIREBASE_API_KEY");
  const authDomain = envString("VITE_FIREBASE_AUTH_DOMAIN");
  const projectId = envString("VITE_FIREBASE_PROJECT_ID");
  const appId = envString("VITE_FIREBASE_APP_ID");

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: envString("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: envString("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  };
}

export function isFirebaseConfigured(): boolean {
  return readFirebaseConfigFromEnv() !== null;
}

/** Lazy-init Firebase Auth. Call only from `/enclave/subscribe`. */
export async function getFirebaseAuth(): Promise<Auth | null> {
  const config = readFirebaseConfigFromEnv();
  if (!config) {
    return null;
  }

  if (!auth) {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getAuth } = await import("firebase/auth");

    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApps()[0]!;
    }
    auth = getAuth(app);
  }

  return auth;
}

export async function signInWithGoogle(): Promise<void> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error("Firebase sign-in is not configured on this site yet.");
  }

  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  await signInWithPopup(firebaseAuth, provider);
}

export async function signOutFirebase(): Promise<void> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    return;
  }
  const { signOut } = await import("firebase/auth");
  await signOut(firebaseAuth);
}

export type AuthStateListener = (user: User | null) => void;

/** Subscribe to auth changes after lazy init. Returns an unsubscribe function. */
export async function listenToAuthState(listener: AuthStateListener): Promise<() => void> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    listener(null);
    return () => {};
  }

  const { onAuthStateChanged } = await import("firebase/auth");
  return onAuthStateChanged(firebaseAuth, listener);
}
