/** Query params Stripe checkout redirects append to `/enclave/subscribe`. */

export const CHECKOUT_ACTIVATING_TIMEOUT_MS = 60_000;

export type CheckoutReturn = "success" | "cancel";

/** Survives StrictMode remount after the checkout query is stripped from the URL. */
export const CHECKOUT_RETURN_SESSION_KEY = "enclave-subscribe-checkout-return";

export function parseCheckoutReturn(search: string): CheckoutReturn | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  if (!raw) {
    return null;
  }
  const value = new URLSearchParams(raw).get("checkout");
  if (value === "success") {
    return "success";
  }
  if (value === "cancel") {
    return "cancel";
  }
  return null;
}

/** Remove `checkout` from the URL without a navigation. */
export function stripCheckoutQueryFromLocation(pathname: string, search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete("checkout");
  const nextSearch = params.toString();
  return nextSearch ? `${pathname}?${nextSearch}` : pathname;
}

export function isCheckoutActivatingTimedOut(
  activatingStartedAtMillis: number,
  nowMillis: number,
  timeoutMs = CHECKOUT_ACTIVATING_TIMEOUT_MS,
): boolean {
  return nowMillis - activatingStartedAtMillis >= timeoutMs;
}

export function persistCheckoutReturn(value: CheckoutReturn): void {
  try {
    sessionStorage.setItem(CHECKOUT_RETURN_SESSION_KEY, value);
  } catch {
    // sessionStorage may be unavailable in some embed contexts
  }
}

export function readPersistedCheckoutReturn(): CheckoutReturn | null {
  try {
    const value = sessionStorage.getItem(CHECKOUT_RETURN_SESSION_KEY);
    if (value === "success" || value === "cancel") {
      return value;
    }
  } catch {
    // ignore
  }
  return null;
}

export function clearPersistedCheckoutReturn(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_RETURN_SESSION_KEY);
  } catch {
    // ignore
  }
}

/** Query param wins; otherwise read a pending value saved before the URL was stripped. */
export function resolveCheckoutReturn(search: string): CheckoutReturn | null {
  const fromQuery = parseCheckoutReturn(search);
  if (fromQuery != null) {
    return fromQuery;
  }
  return readPersistedCheckoutReturn();
}
