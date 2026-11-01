import { describe, expect, it } from "vitest";
import {
  formatExpiryDate,
  isStripeEntitlementSubscribed,
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

  it("returns activating when activating flag is set (Chunk 3 stub)", () => {
    expect(
      resolveSubscribePhase({
        ...base,
        activating: true,
        entitlementDoc: { active: true, expiryTimeMillis: FUTURE },
      }),
    ).toBe("activating");
  });
});

describe("formatExpiryDate", () => {
  it("formats a fixed millis value", () => {
    expect(formatExpiryDate(Date.UTC(2026, 0, 15), "en-US")).toMatch(/January 15, 2026/);
  });
});
