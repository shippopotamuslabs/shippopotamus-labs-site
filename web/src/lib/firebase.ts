import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { Functions } from "firebase/functions";
import type { StripeEntitlementDoc } from "./subscribe/entitlementState";

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
let firestore: Firestore | undefined;
let functions: Functions | undefined;

const FIREBASE_FUNCTIONS_REGION = "us-central1";

async function ensureFirebaseApp(config: NonNullable<ReturnType<typeof readFirebaseConfigFromEnv>>) {
  const { initializeApp, getApps } = await import("firebase/app");
  if (getApps().length === 0) {
    app = initializeApp(config);
  } else {
    app = getApps()[0]!;
  }
  return app;
}

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
    const { getAuth } = await import("firebase/auth");
    const firebaseApp = await ensureFirebaseApp(config);
    auth = getAuth(firebaseApp);
  }

  return auth;
}

/** Lazy-init Firestore. Call only from `/enclave/subscribe`. */
export async function getFirebaseFirestore(): Promise<Firestore | null> {
  const config = readFirebaseConfigFromEnv();
  if (!config) {
    return null;
  }

  if (!firestore) {
    const { getFirestore } = await import("firebase/firestore");
    const firebaseApp = await ensureFirebaseApp(config);
    firestore = getFirestore(firebaseApp);
  }

  return firestore;
}

/** Lazy-init Cloud Functions (us-central1). Call only from `/enclave/subscribe`. */
export async function getFirebaseFunctions(): Promise<Functions | null> {
  const config = readFirebaseConfigFromEnv();
  if (!config) {
    return null;
  }

  if (!functions) {
    const { getFunctions } = await import("firebase/functions");
    const firebaseApp = await ensureFirebaseApp(config);
    functions = getFunctions(firebaseApp, FIREBASE_FUNCTIONS_REGION);
  }

  return functions;
}

export type StripeEntitlementListener = (
  doc: StripeEntitlementDoc | null | undefined,
  error?: Error,
) => void;

/**
 * Listen to `users/{uid}/entitlement/stripe` with the signed-in user token.
 * `undefined` doc means the first snapshot has not arrived yet; `null` means no document.
 */
export async function listenToStripeEntitlement(
  uid: string,
  listener: StripeEntitlementListener,
): Promise<() => void> {
  const db = await getFirebaseFirestore();
  if (!db) {
    listener(null);
    return () => {};
  }

  const { doc, onSnapshot } = await import("firebase/firestore");
  const ref = doc(db, "users", uid, "entitlement", "stripe");

  return onSnapshot(
    ref,
    (snapshot) => {
      listener(snapshot.exists() ? (snapshot.data() as StripeEntitlementDoc) : null);
    },
    (err) => {
      listener(undefined, err);
    },
  );
}

export async function callCreateCheckoutSession(): Promise<string> {
  const firebaseFunctions = await getFirebaseFunctions();
  if (!firebaseFunctions) {
    throw new Error("Firebase billing is not configured on this site yet.");
  }

  const { httpsCallable } = await import("firebase/functions");
  const createCheckoutSession = httpsCallable<Record<string, never>, { url: string }>(
    firebaseFunctions,
    "createCheckoutSession",
  );
  const result = await createCheckoutSession({});
  const url = result.data?.url;
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("Checkout did not return a URL. Try again.");
  }
  return url;
}

export async function callCreatePortalSession(): Promise<string> {
  const firebaseFunctions = await getFirebaseFunctions();
  if (!firebaseFunctions) {
    throw new Error("Firebase billing is not configured on this site yet.");
  }

  const { httpsCallable } = await import("firebase/functions");
  const createPortalSession = httpsCallable<Record<string, never>, { url: string }>(
    firebaseFunctions,
    "createPortalSession",
  );
  const result = await createPortalSession({});
  const url = result.data?.url;
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("Billing portal did not return a URL. Try again.");
  }
  return url;
}

const MOBILE_UA_PATTERN = /Android|iPhone|iPad|iPod|Mobile/i;

/** Redirect sign-in for phones and narrow viewports where popups often fail. */
export function shouldUseGoogleRedirectSignIn(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (MOBILE_UA_PATTERN.test(navigator.userAgent)) {
    return true;
  }
  return window.matchMedia("(max-width: 768px)").matches;
}

export async function completeGoogleRedirectSignIn(): Promise<User | null> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    return null;
  }

  const { getRedirectResult } = await import("firebase/auth");
  const result = await getRedirectResult(firebaseAuth);
  return result?.user ?? null;
}

export type GoogleSignInMode = "popup" | "redirect";

export async function signInWithGoogle(): Promise<GoogleSignInMode> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error("Firebase sign-in is not configured on this site yet.");
  }

  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } =
    await import("firebase/auth");
  const provider = new GoogleAuthProvider();

  if (shouldUseGoogleRedirectSignIn()) {
    await signInWithRedirect(firebaseAuth, provider);
    return "redirect";
  }

  await signInWithPopup(firebaseAuth, provider);
  return "popup";
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
