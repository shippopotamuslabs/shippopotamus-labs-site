import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockUser = { uid: "test-uid-123" };

let entitlementListener: ((doc: unknown, error?: Error) => void) | undefined;

vi.mock("../lib/firebase", () => ({
  isFirebaseConfigured: vi.fn(() => true),
  completeGoogleRedirectSignIn: vi.fn(async () => null),
  listenToAuthState: vi.fn(async (listener: (user: typeof mockUser | null) => void) => {
    listener(null);
    return () => {};
  }),
  listenToStripeEntitlement: vi.fn(
    async (_uid: string, listener: (doc: unknown, error?: Error) => void) => {
      entitlementListener = listener;
      return () => {};
    },
  ),
  signInWithGoogle: vi.fn(),
  signOutFirebase: vi.fn(),
  callCreateCheckoutSession: vi.fn(),
  callCreatePortalSession: vi.fn(),
}));

import {
  callCreateCheckoutSession,
  callCreatePortalSession,
  completeGoogleRedirectSignIn,
  isFirebaseConfigured,
  listenToAuthState,
  listenToStripeEntitlement,
  signOutFirebase,
} from "../lib/firebase";
import {
  CHECKOUT_RETURN_SESSION_KEY,
  persistCheckoutReturn,
} from "../lib/subscribe/checkoutReturn";
import Subscribe from "./Subscribe";

function mockSignedIn() {
  vi.mocked(listenToAuthState).mockImplementation(async (listener) => {
    listener(mockUser as never);
    return () => {};
  });
}

let authListener: ((user: typeof mockUser | null) => void) | undefined;

function emitEntitlement(doc: unknown) {
  entitlementListener?.(doc);
}

describe("Subscribe page", () => {
  afterEach(() => {
    cleanup();
    entitlementListener = undefined;
    vi.mocked(callCreateCheckoutSession).mockReset();
    vi.mocked(callCreatePortalSession).mockReset();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    sessionStorage.clear();
    authListener = undefined;
    vi.mocked(isFirebaseConfigured).mockImplementation(() => true);
    vi.mocked(completeGoogleRedirectSignIn).mockResolvedValue(null);
    vi.mocked(listenToAuthState).mockImplementation(async (listener) => {
      listener(null);
      return () => {};
    });
    vi.mocked(listenToStripeEntitlement).mockImplementation(async (_uid, listener) => {
      entitlementListener = listener;
      return () => {};
    });
    vi.stubGlobal("location", {
      ...window.location,
      pathname: "/enclave/subscribe",
      search: "",
      assign: vi.fn(),
    });
  });

  it("renders signed-out copy and Google sign-in when configured", async () => {
    render(createElement(Subscribe));
    expect(
      await screen.findByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/you are signed out/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy policies/i })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.queryByText(/^Account id:/i)).toBeNull();
  });

  it("explains when Firebase web sign-in is not configured", () => {
    vi.mocked(isFirebaseConfigured).mockImplementation(() => false);
    render(createElement(Subscribe));
    expect(screen.getByText(/sign-in not configured/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign in with google/i })).toBeNull();
  });

  it("clears redirect sign-in error once auth delivers a user", async () => {
    const redirectError = new Error(
      "Could not finish Google sign-in after redirect. Try again.",
    );
    vi.mocked(completeGoogleRedirectSignIn).mockRejectedValueOnce(redirectError);

    let deliverAuth: ((user: typeof mockUser | null) => void) | undefined;
    vi.mocked(listenToAuthState).mockImplementation(async (listener) => {
      deliverAuth = listener;
      listener(null);
      return () => {};
    });

    render(createElement(Subscribe));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(redirectError.message);
    });

    deliverAuth!(mockUser as never);
    expect(await screen.findByText(/^Account id:/i)).toBeInTheDocument();
    emitEntitlement(null);
    await waitFor(() => {
      expect(screen.getByText(/you do not have an active subscription/i)).toBeInTheDocument();
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  it("shows an error instead of spinning when auth state listen fails", async () => {
    vi.mocked(listenToAuthState).mockRejectedValueOnce(new Error("Auth unavailable"));

    render(createElement(Subscribe));

    expect(await screen.findByRole("alert")).toHaveTextContent("Auth unavailable");
    expect(screen.queryByText(/checking sign-in status/i)).toBeNull();
    expect(
      await screen.findByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it("shows unsubscribed Subscribe when signed in with no stripe doc", async () => {
    mockSignedIn();
    render(createElement(Subscribe));

    expect(await screen.findByText(/^Account id:/i)).toBeInTheDocument();
    emitEntitlement(null);

    expect(await screen.findByText(/you do not have an active subscription/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^subscribe$/i })).toBeInTheDocument();
    expect(screen.queryByText(/\$/)).toBeNull();
  });

  it("shows subscribed status, renewal date, and Manage", async () => {
    mockSignedIn();
    render(createElement(Subscribe));

    emitEntitlement({
      active: true,
      expiryTimeMillis: Date.now() + 86_400_000 * 30,
    });

    expect(await screen.findByText(/your subscription is active/i)).toBeInTheDocument();
    expect(screen.getByText(/renews on/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^manage$/i })).toBeInTheDocument();
  });

  it("shows lapsed copy and Subscribe when entitlement is inactive", async () => {
    mockSignedIn();
    render(createElement(Subscribe));

    emitEntitlement({ active: false, stripeCustomerId: "cus_123" });

    expect(await screen.findByText(/your subscription is not active/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^subscribe$/i })).toBeInTheDocument();
  });

  it("redirects to checkout URL on Subscribe", async () => {
    mockSignedIn();
    vi.mocked(callCreateCheckoutSession).mockResolvedValue("https://checkout.stripe.test/session");
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });

    render(createElement(Subscribe));
    emitEntitlement(null);

    fireEvent.click(await screen.findByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(callCreateCheckoutSession).toHaveBeenCalledTimes(1);
      expect(assign).toHaveBeenCalledWith("https://checkout.stripe.test/session");
    });
  });

  it("disables duplicate Subscribe clicks while checkout is in flight", async () => {
    mockSignedIn();
    let resolveCheckout: (value: string) => void = () => {};
    vi.mocked(callCreateCheckoutSession).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCheckout = resolve;
        }),
    );

    render(createElement(Subscribe));
    emitEntitlement(null);

    const button = await screen.findByRole("button", { name: /^subscribe$/i });
    fireEvent.click(button);
    expect(await screen.findByRole("button", { name: /starting checkout/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /starting checkout/i }));
    expect(callCreateCheckoutSession).toHaveBeenCalledTimes(1);

    resolveCheckout("https://checkout.stripe.test/session");
  });

  it("shows plain error and retry on checkout failure", async () => {
    mockSignedIn();
    vi.mocked(callCreateCheckoutSession).mockRejectedValue({
      code: "functions/internal",
      message: "Checkout failed on the server.",
    });

    render(createElement(Subscribe));
    emitEntitlement(null);

    fireEvent.click(await screen.findByRole("button", { name: /^subscribe$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Checkout failed on the server.",
    );
    expect(screen.getByRole("button", { name: /^subscribe$/i })).not.toBeDisabled();
  });

  it("offers Subscribe when portal has no Stripe customer", async () => {
    mockSignedIn();
    vi.mocked(callCreatePortalSession).mockRejectedValue({
      code: "functions/failed-precondition",
      message: "No Stripe customer for this account.",
    });

    render(createElement(Subscribe));
    emitEntitlement({ active: true, expiryTimeMillis: Date.now() + 60_000 });

    fireEvent.click(await screen.findByRole("button", { name: /^manage$/i }));

    expect(await screen.findByText(/billing management is not set up/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^subscribe$/i })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows error for other portal failed-precondition responses", async () => {
    mockSignedIn();
    vi.mocked(callCreatePortalSession).mockRejectedValue({
      code: "functions/failed-precondition",
      message: "Stripe is not configured.",
    });

    render(createElement(Subscribe));
    emitEntitlement({ active: true, expiryTimeMillis: Date.now() + 60_000 });

    fireEvent.click(await screen.findByRole("button", { name: /^manage$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Stripe is not configured.");
    expect(screen.queryByText(/billing management is not set up/i)).toBeNull();
  });

  it("shows entitlement error with retry when Firestore listen fails", async () => {
    mockSignedIn();
    render(createElement(Subscribe));

    entitlementListener?.(undefined, new Error("Firestore denied"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not load subscription status/i,
    );
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("shows plain unsubscribed after checkout cancel with no error", async () => {
    vi.stubGlobal("location", {
      ...window.location,
      pathname: "/enclave/subscribe",
      search: "?checkout=cancel",
      assign: vi.fn(),
    });
    vi.stubGlobal("history", { ...window.history, replaceState: vi.fn() });
    mockSignedIn();
    render(createElement(Subscribe));
    emitEntitlement(null);

    expect(await screen.findByText(/you do not have an active subscription/i)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it("shows activating after checkout success until entitlement is active", async () => {
    vi.stubGlobal("location", {
      ...window.location,
      pathname: "/enclave/subscribe",
      search: "?checkout=success",
      assign: vi.fn(),
    });
    vi.stubGlobal("history", { ...window.history, replaceState: vi.fn() });
    mockSignedIn();
    render(createElement(Subscribe));

    expect(await screen.findByText(/finishing your subscription/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /your subscription is active/i })).toBeNull();
    expect(screen.queryByText(/^Your subscription is active\.$/i)).toBeNull();

    emitEntitlement({ active: true, expiryTimeMillis: Date.now() + 86_400_000 });

    expect(await screen.findByText(/^Your subscription is active\.$/i)).toBeInTheDocument();
    expect(screen.queryByText(/finishing your subscription/i)).toBeNull();
  });

  it("returns to unsubscribed after activating timeout without claiming subscribed", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    vi.stubGlobal("location", {
      ...window.location,
      pathname: "/enclave/subscribe",
      search: "?checkout=success",
      assign: vi.fn(),
    });
    vi.stubGlobal("history", { ...window.history, replaceState: vi.fn() });
    mockSignedIn();
    render(createElement(Subscribe));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(/finishing your subscription/i)).toBeInTheDocument();
    emitEntitlement(null);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(screen.getByText(/you do not have an active subscription/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Your subscription is active\.$/i)).toBeNull();
    expect(screen.queryByText(/finishing your subscription/i)).toBeNull();

    vi.useRealTimers();
  });

  it("shows unsubscribed after activating timeout when entitlement never loads", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    vi.stubGlobal("location", {
      ...window.location,
      pathname: "/enclave/subscribe",
      search: "?checkout=success",
      assign: vi.fn(),
    });
    vi.stubGlobal("history", { ...window.history, replaceState: vi.fn() });
    mockSignedIn();
    render(createElement(Subscribe));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(/finishing your subscription/i)).toBeInTheDocument();
    expect(screen.queryByText(/loading subscription status/i)).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(screen.getByText(/you do not have an active subscription/i)).toBeInTheDocument();
    expect(screen.queryByText(/loading subscription status/i)).toBeNull();

    vi.useRealTimers();
  });

  it("shows entitlement retry after activating timeout when Firestore listen failed", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    vi.stubGlobal("location", {
      ...window.location,
      pathname: "/enclave/subscribe",
      search: "?checkout=success",
      assign: vi.fn(),
    });
    vi.stubGlobal("history", { ...window.history, replaceState: vi.fn() });
    mockSignedIn();
    render(createElement(Subscribe));

    await act(async () => {
      await Promise.resolve();
    });

    entitlementListener?.(undefined, new Error("Firestore denied"));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/could not load subscription status/i);
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.queryByText(/loading subscription status/i)).toBeNull();

    vi.useRealTimers();
  });

  it("arms activating from sessionStorage after checkout query was stripped (StrictMode remount)", async () => {
    persistCheckoutReturn("success");
    vi.stubGlobal("location", {
      ...window.location,
      pathname: "/enclave/subscribe",
      search: "",
      assign: vi.fn(),
    });
    mockSignedIn();
    render(createElement(Subscribe));

    expect(await screen.findByText(/finishing your subscription/i)).toBeInTheDocument();
    expect(sessionStorage.getItem(CHECKOUT_RETURN_SESSION_KEY)).toBe("success");
  });

  it("clears activating checkout state on sign out", async () => {
    vi.stubGlobal("location", {
      ...window.location,
      pathname: "/enclave/subscribe",
      search: "?checkout=success",
      assign: vi.fn(),
    });
    vi.stubGlobal("history", { ...window.history, replaceState: vi.fn() });
    vi.mocked(signOutFirebase).mockResolvedValue(undefined);
    vi.mocked(listenToAuthState).mockImplementation(async (listener) => {
      authListener = listener;
      listener(mockUser as never);
      return () => {};
    });

    render(createElement(Subscribe));
    expect(await screen.findByText(/finishing your subscription/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));
    await act(async () => {
      authListener?.(null);
    });

    expect(sessionStorage.getItem(CHECKOUT_RETURN_SESSION_KEY)).toBeNull();

    await act(async () => {
      authListener?.(mockUser as never);
    });
    emitEntitlement(null);

    expect(await screen.findByText(/you do not have an active subscription/i)).toBeInTheDocument();
    expect(screen.queryByText(/finishing your subscription/i)).toBeNull();
  });
});
