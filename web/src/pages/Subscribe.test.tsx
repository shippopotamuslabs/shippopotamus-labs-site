import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/firebase", () => ({
  isFirebaseConfigured: vi.fn(() => true),
  completeGoogleRedirectSignIn: vi.fn(async () => null),
  listenToAuthState: vi.fn(async (listener: (user: null) => void) => {
    listener(null);
    return () => {};
  }),
  signInWithGoogle: vi.fn(),
  signOutFirebase: vi.fn(),
}));

import {
  completeGoogleRedirectSignIn,
  isFirebaseConfigured,
  listenToAuthState,
} from "../lib/firebase";
import Subscribe from "./Subscribe";

describe("Subscribe page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(isFirebaseConfigured).mockImplementation(() => true);
    vi.mocked(completeGoogleRedirectSignIn).mockResolvedValue(null);
    vi.mocked(listenToAuthState).mockImplementation(async (listener) => {
      listener(null);
      return () => {};
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
});
