import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shouldUseGoogleRedirectSignIn } from "./firebase";

describe("shouldUseGoogleRedirectSignIn", () => {
  const originalMatchMedia = window.matchMedia;
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("768px"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.stubGlobal("matchMedia", originalMatchMedia);
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it("prefers redirect on mobile user agents", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });
    expect(shouldUseGoogleRedirectSignIn()).toBe(true);
  });

  it("prefers redirect on narrow viewports", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    });
    expect(shouldUseGoogleRedirectSignIn()).toBe(true);
  });
});
