import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Link } from "../lib/router";
import {
  isFirebaseConfigured,
  listenToAuthState,
  signInWithGoogle,
  signOutFirebase,
} from "../lib/firebase";

export default function Subscribe() {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!configured) {
      setUser(null);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void listenToAuthState((next) => {
      if (!cancelled) {
        setUser(next);
      }
    }).then((off) => {
      if (cancelled) {
        off();
      } else {
        unsubscribe = off;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [configured]);

  async function handleSignIn() {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Sign-in did not complete. Try again.";
      setError(message);
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    setError(null);
    try {
      await signOutFirebase();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Sign-out did not complete. Try again.";
      setError(message);
    }
  }

  return (
    <>
      <section className="app-hero">
        <p className="eyebrow">Enclave</p>
        <h1>Subscription account</h1>
        <p className="lede">
          Sign in with Google to link this page to your Enclave account. The
          same Google account you use in the Android app gets the same account
          id here.
        </p>
      </section>

      {!configured && (
        <section className="contact-cards">
          <div className="contact-card">
            <strong>Sign-in not configured</strong>
            <p style={{ margin: "0.75rem 0 0" }}>
              Google sign-in is not set up on this deployment yet. Subscription
              steps will appear here once the Firebase web app is configured
              for this site.
            </p>
          </div>
        </section>
      )}

      {configured && user === undefined && (
        <p className="lede" role="status">
          Checking sign-in status…
        </p>
      )}

      {configured && user === null && (
        <section className="subscribe-panel">
          <p>
            You are signed out. Sign in to continue with subscription setup on
            this page.
          </p>
          {error && (
            <div className="form-msg err" role="alert">
              {error}
            </div>
          )}
          <button
            className="pill-btn"
            type="button"
            disabled={signingIn}
            onClick={() => void handleSignIn()}
          >
            {signingIn ? "Signing in…" : "Sign in with Google"}
          </button>
        </section>
      )}

      {configured && user && (
        <section className="subscribe-panel">
          <div className="contact-card">
            <strong>Signed in</strong>
            <p style={{ margin: "0.75rem 0 0" }}>
              Account id: <code>{user.uid}</code>
            </p>
            <p style={{ margin: "0.75rem 0 0", color: "var(--muted)" }}>
              Subscription checkout and management will appear on this page in a
              later update.
            </p>
          </div>
          {error && (
            <div className="form-msg err" role="alert">
              {error}
            </div>
          )}
          <button className="ghost-btn" type="button" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </section>
      )}

      <p className="lede" style={{ marginTop: "2rem" }}>
        <Link to="/enclave">Back to Enclave</Link>
      </p>
    </>
  );
}
