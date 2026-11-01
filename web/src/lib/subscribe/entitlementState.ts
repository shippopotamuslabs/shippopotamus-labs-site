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
  /** Chunk 3 wires checkout query poll; stub only in Chunk 2. */
  activating?: boolean;
  nowMillis: number;
};

export function resolveSubscribePhase(input: ResolveSubscribePhaseInput): SubscribePhase {
  if (!input.authKnown) {
    return "loading";
  }
  if (!input.signedIn) {
    return "signed-out";
  }
  if (input.activating) {
    return "activating";
  }
  if (input.entitlementLoadFailed) {
    return "entitlement-error";
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

export function isPortalNoCustomerError(code: string | null): boolean {
  return code === "functions/failed-precondition";
}

export function isCallableUnauthorized(code: string | null): boolean {
  return code === "functions/unauthenticated" || code === "functions/permission-denied";
}
