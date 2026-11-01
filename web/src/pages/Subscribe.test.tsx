import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/firebase", () => ({
  isFirebaseConfigured: vi.fn(() => true),
  listenToAuthState: vi.fn(async (listener: (user: null) => void) => {
    listener(null);
    return () => {};
  }),
  signInWithGoogle: vi.fn(),
  signOutFirebase: vi.fn(),
}));

import { isFirebaseConfigured } from "../lib/firebase";
import Subscribe from "./Subscribe";

describe("Subscribe page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(isFirebaseConfigured).mockImplementation(() => true);
  });

  it("renders signed-out copy and Google sign-in when configured", async () => {
    render(createElement(Subscribe));
    expect(
      await screen.findByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/you are signed out/i)).toBeInTheDocument();
  });

  it("explains when Firebase web sign-in is not configured", () => {
    vi.mocked(isFirebaseConfigured).mockImplementation(() => false);
    render(createElement(Subscribe));
    expect(screen.getByText(/sign-in not configured/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign in with google/i })).toBeNull();
  });
});
