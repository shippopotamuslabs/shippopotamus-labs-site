import {
  CHECKOUT_ACTIVATING_TIMEOUT_MS,
  isCheckoutActivatingTimedOut,
} from "./checkoutReturn";

export { CHECKOUT_ACTIVATING_TIMEOUT_MS, isCheckoutActivatingTimedOut };

/** Stripe entitlement fields read from `users/{uid}/entitlement/stripe`. Never written from the web app. */
export type StripeEntitlementDoc = {
  active?: boolean;
  expiryTimeMillis?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  updatedAt?: number;
};

export type SubscribePhase =
  | "signed-out"
  | "loading"
  | "entitlement-error"
  | "unsubscribed"
  | "subscribed"
  | "lapsed"
  | "activating";

export function isStripeEntitlementSubscribed(
  doc: StripeEntitlementDoc,
  nowMillis: number,
): boolean {
  if (doc.active !== true) {
    return false;
  }
  const expiry = doc.expiryTimeMillis;
  if (expiry == null) {
    return true;
  }
  return expiry > nowMillis;
}

export type ResolveSubscribePhaseInput = {
  authKnown: boolean;
  signedIn: boolean;
  entitlementLoaded: boolean;
  entitlementDoc: StripeEntitlementDoc | null;
  entitlementLoadFailed: boolean;
  /** Post-checkout return: wait for webhook via Firestore listener until subscribed or timeout. */
  activating?: boolean;
  activatingStartedAtMillis?: number | null;
  nowMillis: number;
};

export function resolveSubscribePhase(input: ResolveSubscribePhaseInput): SubscribePhase {
  if (!input.authKnown) {
    return "loading";
  }
  if (!input.signedIn) {
    return "signed-out";
  }
  if (input.entitlementLoadFailed && !input.activating) {
    return "entitlement-error";
  }
  if (
    input.activating &&
    input.activatingStartedAtMillis != null &&
    !isCheckoutActivatingTimedOut(input.activatingStartedAtMillis, input.nowMillis)
  ) {
    const doc = input.entitlementDoc;
    if (doc != null && isStripeEntitlementSubscribed(doc, input.nowMillis)) {
      return "subscribed";
    }
    return "activating";
  }
  if (!input.entitlementLoaded) {
    return "loading";
  }
  if (input.entitlementDoc === null) {
    return "unsubscribed";
  }
  if (isStripeEntitlementSubscribed(input.entitlementDoc, input.nowMillis)) {
    return "subscribed";
  }
  return "lapsed";
}

export function formatExpiryDate(expiryTimeMillis: number, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(expiryTimeMillis));
}

export function firebaseCallableErrorMessage(
  error: unknown,
  fallback: string,
): { message: string; code: string | null } {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    const message =
      "message" in error && typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : fallback;
    return { message, code };
  }
  if (error instanceof Error) {
    return { message: error.message, code: null };
  }
  return { message: fallback, code: null };
}

/** Matches Enclave `handleCreatePortalSession` when no Stripe customer exists. */
export const PORTAL_NO_STRIPE_CUSTOMER_MESSAGE = "No Stripe customer for this account.";

export function isPortalNoCustomerError(code: string | null, message: string): boolean {
  return (
    code === "functions/failed-precondition" && message === PORTAL_NO_STRIPE_CUSTOMER_MESSAGE
  );
}

export function isCallableUnauthorized(code: string | null): boolean {
  return code === "functions/unauthenticated" || code === "functions/permission-denied";
}
