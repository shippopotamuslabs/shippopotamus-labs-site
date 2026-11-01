import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
} from "../lib/firebase";
import Subscribe from "./Subscribe";

function mockSignedIn() {
  vi.mocked(listenToAuthState).mockImplementation(async (listener) => {
    listener(mockUser as never);
    return () => {};
  });
}

function emitEntitlement(doc: unknown) {
  entitlementListener?.(doc);
}

describe("Subscribe page", () => {
  afterEach(() => {
    cleanup();
    entitlementListener = undefined;
    vi.mocked(callCreateCheckoutSession).mockReset();
    vi.mocked(callCreatePortalSession).mockReset();
  });

  beforeEach(() => {
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
    vi.stubGlobal("location", { ...window.location, assign: vi.fn() });
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

  it("shows entitlement error with retry when Firestore listen fails", async () => {
    mockSignedIn();
    render(createElement(Subscribe));

    entitlementListener?.(undefined, new Error("Firestore denied"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not load subscription status/i,
    );
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
