import { describe, expect, it } from "vitest";
import {
  CHECKOUT_ACTIVATING_TIMEOUT_MS,
  formatExpiryDate,
  isPortalNoCustomerError,
  isStripeEntitlementSubscribed,
  PORTAL_NO_STRIPE_CUSTOMER_MESSAGE,
  resolveSubscribePhase,
} from "./entitlementState";

const NOW = 1_700_000_000_000;
const FUTURE = NOW + 86_400_000;
const PAST = NOW - 86_400_000;

describe("isStripeEntitlementSubscribed", () => {
  it("is true when active with no expiry", () => {
    expect(isStripeEntitlementSubscribed({ active: true }, NOW)).toBe(true);
  });

  it("is true when active and expiry is in the future", () => {
    expect(
      isStripeEntitlementSubscribed({ active: true, expiryTimeMillis: FUTURE }, NOW),
    ).toBe(true);
  });

  it("is false when active but expiry is in the past", () => {
    expect(
      isStripeEntitlementSubscribed({ active: true, expiryTimeMillis: PAST }, NOW),
    ).toBe(false);
  });

  it("is false when inactive", () => {
    expect(
      isStripeEntitlementSubscribed({ active: false, expiryTimeMillis: FUTURE }, NOW),
    ).toBe(false);
  });
});

describe("resolveSubscribePhase", () => {
  const base = {
    authKnown: true,
    signedIn: true,
    entitlementLoaded: true,
    entitlementDoc: null as null,
    entitlementLoadFailed: false,
    nowMillis: NOW,
  };

  it("returns loading until auth is known", () => {
    expect(
      resolveSubscribePhase({ ...base, authKnown: false, signedIn: false }),
    ).toBe("loading");
  });

  it("returns signed-out when auth known and no user", () => {
    expect(resolveSubscribePhase({ ...base, signedIn: false })).toBe("signed-out");
  });

  it("returns loading while entitlement is loading", () => {
    expect(
      resolveSubscribePhase({ ...base, entitlementLoaded: false, entitlementDoc: null }),
    ).toBe("loading");
  });

  it("returns entitlement-error when load failed", () => {
    expect(
      resolveSubscribePhase({ ...base, entitlementLoadFailed: true }),
    ).toBe("entitlement-error");
  });

  it("returns unsubscribed when stripe doc is missing", () => {
    expect(resolveSubscribePhase({ ...base, entitlementDoc: null })).toBe("unsubscribed");
  });

  it("returns subscribed for active entitlement", () => {
    expect(
      resolveSubscribePhase({
        ...base,
        entitlementDoc: { active: true, expiryTimeMillis: FUTURE },
      }),
    ).toBe("subscribed");
  });

  it("returns lapsed when doc exists but subscription is not active", () => {
    expect(
      resolveSubscribePhase({
        ...base,
        entitlementDoc: { active: false, expiryTimeMillis: FUTURE },
      }),
    ).toBe("lapsed");
  });

  it("returns lapsed when doc is expired", () => {
    expect(
      resolveSubscribePhase({
        ...base,
        entitlementDoc: { active: true, expiryTimeMillis: PAST },
      }),
    ).toBe("lapsed");
  });

  it("returns activating while waiting for entitlement after checkout", () => {
    expect(
      resolveSubscribePhase({
        ...base,
        activating: true,
        activatingStartedAtMillis: NOW,
        entitlementLoaded: false,
        entitlementDoc: null,
      }),
    ).toBe("activating");
  });

  it("returns subscribed during activating once the doc is active", () => {
    expect(
      resolveSubscribePhase({
        ...base,
        activating: true,
        activatingStartedAtMillis: NOW,
        entitlementDoc: { active: true, expiryTimeMillis: FUTURE },
      }),
    ).toBe("subscribed");
  });

  it("returns unsubscribed after activating times out with no doc", () => {
    expect(
      resolveSubscribePhase({
        ...base,
        activating: true,
        activatingStartedAtMillis: NOW - CHECKOUT_ACTIVATING_TIMEOUT_MS,
        entitlementDoc: null,
      }),
    ).toBe("unsubscribed");
  });

  it("does not show entitlement-error while activating", () => {
    expect(
      resolveSubscribePhase({
        ...base,
        activating: true,
        activatingStartedAtMillis: NOW,
        entitlementLoadFailed: true,
        entitlementDoc: null,
      }),
    ).toBe("activating");
  });
});

describe("formatExpiryDate", () => {
  it("formats a fixed millis value", () => {
    expect(formatExpiryDate(Date.UTC(2026, 0, 15), "en-US")).toMatch(/January 15, 2026/);
  });
});

describe("isPortalNoCustomerError", () => {
  it("matches Enclave no-customer failed-precondition", () => {
    expect(
      isPortalNoCustomerError(
        "functions/failed-precondition",
        PORTAL_NO_STRIPE_CUSTOMER_MESSAGE,
      ),
    ).toBe(true);
  });

  it("rejects other failed-precondition messages", () => {
    expect(
      isPortalNoCustomerError("functions/failed-precondition", "Stripe is not configured."),
    ).toBe(false);
  });
});
