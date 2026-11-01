import { describe, expect, it } from "vitest";
import {
  CHECKOUT_ACTIVATING_TIMEOUT_MS,
  isCheckoutActivatingTimedOut,
  parseCheckoutReturn,
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
