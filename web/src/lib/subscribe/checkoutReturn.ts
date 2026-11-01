/** Query params Stripe checkout redirects append to `/enclave/subscribe`. */

export const CHECKOUT_ACTIVATING_TIMEOUT_MS = 60_000;

export type CheckoutReturn = "success" | "cancel";

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
