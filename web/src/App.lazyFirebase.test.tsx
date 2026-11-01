import { cleanup, render, screen } from "@testing-library/react";
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
  onAuthStateChanged: vi.fn(() => () => {}),
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
