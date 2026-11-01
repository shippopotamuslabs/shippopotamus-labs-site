import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  CHECKOUT_RETURN_SESSION_KEY,
  CHECKOUT_ACTIVATING_TIMEOUT_MS,
  clearPersistedCheckoutReturn,
  isCheckoutActivatingTimedOut,
  parseCheckoutReturn,
  persistCheckoutReturn,
  readPersistedCheckoutReturn,
  resolveCheckoutReturn,
  stripCheckoutQueryFromLocation,
} from "./checkoutReturn";

describe("parseCheckoutReturn", () => {
  it("reads success and cancel", () => {
    expect(parseCheckoutReturn("?checkout=success")).toBe("success");
    expect(parseCheckoutReturn("?checkout=cancel")).toBe("cancel");
  });

  it("ignores unknown values", () => {
    expect(parseCheckoutReturn("?checkout=weird")).toBeNull();
    expect(parseCheckoutReturn("")).toBeNull();
  });
});

describe("stripCheckoutQueryFromLocation", () => {
  it("removes checkout while keeping other params", () => {
    expect(stripCheckoutQueryFromLocation("/enclave/subscribe", "?checkout=success&x=1")).toBe(
      "/enclave/subscribe?x=1",
    );
  });

  it("returns pathname only when checkout was the only param", () => {
    expect(stripCheckoutQueryFromLocation("/enclave/subscribe", "?checkout=cancel")).toBe(
      "/enclave/subscribe",
    );
  });
});

describe("isCheckoutActivatingTimedOut", () => {
  it("is false before the timeout window", () => {
    const start = 1_000;
    expect(isCheckoutActivatingTimedOut(start, start + CHECKOUT_ACTIVATING_TIMEOUT_MS - 1)).toBe(
      false,
    );
  });

  it("is true at or after the timeout window", () => {
    const start = 1_000;
    expect(isCheckoutActivatingTimedOut(start, start + CHECKOUT_ACTIVATING_TIMEOUT_MS)).toBe(true);
  });
});

describe("checkout return sessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("persists and reads success and cancel", () => {
    persistCheckoutReturn("success");
    expect(readPersistedCheckoutReturn()).toBe("success");
    clearPersistedCheckoutReturn();
    expect(readPersistedCheckoutReturn()).toBeNull();
  });

  it("resolveCheckoutReturn prefers the query param over session", () => {
    persistCheckoutReturn("success");
    expect(resolveCheckoutReturn("?checkout=cancel")).toBe("cancel");
  });

  it("resolveCheckoutReturn falls back to session when the query is gone", () => {
    persistCheckoutReturn("success");
    expect(resolveCheckoutReturn("")).toBe("success");
    expect(sessionStorage.getItem(CHECKOUT_RETURN_SESSION_KEY)).toBe("success");
  });
});
