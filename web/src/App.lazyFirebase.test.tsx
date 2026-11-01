import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initializeApp = vi.fn(() => ({}));

vi.mock("firebase/app", () => ({
  initializeApp,
  getApps: vi.fn(() => []),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn().mockResolvedValue(null),
  onAuthStateChanged: vi.fn((_auth, listener: (user: null) => void) => {
    listener(null);
    return () => {};
  }),
  signOut: vi.fn(),
}));

import App from "./App";
import { navigate } from "./lib/router";

describe("Firebase lazy init on marketing routes", () => {
  beforeEach(() => {
    initializeApp.mockClear();
  });

  afterEach(() => {
    cleanup();
    navigate("/");
    vi.unstubAllEnvs();
  });

  it("does not initialize Firebase on the home route", () => {
    navigate("/");
    render(createElement(App));
    expect(screen.getByRole("link", { name: "Shippopotamus Labs" })).toBeInTheDocument();
    expect(initializeApp).not.toHaveBeenCalled();
  });

  it("does not initialize Firebase on /enclave", () => {
    navigate("/enclave");
    render(createElement(App));
    expect(screen.getByRole("heading", { level: 1, name: "Enclave" })).toBeInTheDocument();
    expect(initializeApp).not.toHaveBeenCalled();
  });
});

describe("Firebase init on subscribe route", () => {
  beforeEach(() => {
    initializeApp.mockClear();
    vi.stubEnv("VITE_FIREBASE_API_KEY", "test-api-key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "example.firebaseapp.com");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "enclave-497101");
    vi.stubEnv("VITE_FIREBASE_APP_ID", "1:123456789:web:abc123");
  });

  afterEach(() => {
    cleanup();
    navigate("/");
    vi.unstubAllEnvs();
  });

  it("initializes Firebase when /enclave/subscribe loads with configured env", async () => {
    navigate("/enclave/subscribe");
    render(createElement(App));

    await waitFor(() => {
      expect(initializeApp).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });
});
