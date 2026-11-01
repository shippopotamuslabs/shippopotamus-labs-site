import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { Link } from "../lib/router";
import {
  callCreateCheckoutSession,
  callCreatePortalSession,
  completeGoogleRedirectSignIn,
  isFirebaseConfigured,
  listenToAuthState,
  listenToStripeEntitlement,
  signInWithGoogle,
  signOutFirebase,
} from "../lib/firebase";
import {
  CHECKOUT_ACTIVATING_TIMEOUT_MS,
  firebaseCallableErrorMessage,
  formatExpiryDate,
  isCallableUnauthorized,
  isPortalNoCustomerError,
  isStripeEntitlementSubscribed,
  resolveSubscribePhase,
  type StripeEntitlementDoc,
} from "../lib/subscribe/entitlementState";
import {
  parseCheckoutReturn,
  stripCheckoutQueryFromLocation,
} from "../lib/subscribe/checkoutReturn";

function authErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function Subscribe() {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [entitlementDoc, setEntitlementDoc] = useState<StripeEntitlementDoc | null | undefined>(
    undefined,
  );
  const [entitlementLoadFailed, setEntitlementLoadFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [checkoutInFlight, setCheckoutInFlight] = useState(false);
  const [portalInFlight, setPortalInFlight] = useState(false);
  const [portalOfferSubscribe, setPortalOfferSubscribe] = useState(false);
  const [entitlementRetryToken, setEntitlementRetryToken] = useState(0);
  const [nowMillis, setNowMillis] = useState(() => Date.now());
  const [checkoutActivating, setCheckoutActivating] = useState(false);
  const [activatingStartedAtMillis, setActivatingStartedAtMillis] = useState<number | null>(
    null,
  );
  const [pendingCheckoutSuccess, setPendingCheckoutSuccess] = useState(false);

  useEffect(() => {
    const refreshNow = () => setNowMillis(Date.now());
    const intervalId = window.setInterval(refreshNow, 1_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshNow();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const authKnown = !configured || user !== undefined;
  const signedIn = Boolean(user);
  const entitlementLoaded = !signedIn || entitlementDoc !== undefined;
  const authLoading = configured && user === undefined;

  useEffect(() => {
    const checkoutReturn = parseCheckoutReturn(window.location.search);
    if (checkoutReturn == null) {
      return;
    }
    const nextUrl = stripCheckoutQueryFromLocation(
      window.location.pathname,
      window.location.search,
    );
    window.history.replaceState(null, "", nextUrl);

    if (checkoutReturn === "cancel") {
      setCheckoutActivating(false);
      setActivatingStartedAtMillis(null);
      setPendingCheckoutSuccess(false);
      setError(null);
      return;
    }

    setPendingCheckoutSuccess(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (!pendingCheckoutSuccess || !signedIn) {
      return;
    }
    setPendingCheckoutSuccess(false);
    setCheckoutActivating(true);
    setActivatingStartedAtMillis(Date.now());
    setEntitlementLoadFailed(false);
    setError(null);
  }, [pendingCheckoutSuccess, signedIn]);

  useEffect(() => {
    if (!checkoutActivating || activatingStartedAtMillis == null) {
      return;
    }
    const doc = entitlementDoc;
    if (doc != null && isStripeEntitlementSubscribed(doc, nowMillis)) {
      setCheckoutActivating(false);
      setActivatingStartedAtMillis(null);
      return;
    }
    if (nowMillis - activatingStartedAtMillis >= CHECKOUT_ACTIVATING_TIMEOUT_MS) {
      setCheckoutActivating(false);
      setActivatingStartedAtMillis(null);
      setEntitlementLoadFailed(false);
      setError(null);
    }
  }, [checkoutActivating, activatingStartedAtMillis, entitlementDoc, nowMillis]);

  const phase = useMemo(
    () =>
      resolveSubscribePhase({
        authKnown,
        signedIn,
        entitlementLoaded,
        entitlementDoc: entitlementDoc ?? null,
        entitlementLoadFailed,
        activating: checkoutActivating,
        activatingStartedAtMillis,
        nowMillis,
      }),
    [
      authKnown,
      signedIn,
      entitlementLoaded,
      entitlementDoc,
      entitlementLoadFailed,
      checkoutActivating,
      activatingStartedAtMillis,
      nowMillis,
    ],
  );

  useEffect(() => {
    if (!configured) {
      setUser(null);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void completeGoogleRedirectSignIn().catch((e) => {
      if (!cancelled) {
        setError(
          authErrorMessage(e, "Could not finish Google sign-in after redirect. Try again."),
        );
      }
    });

    void listenToAuthState((next) => {
      if (!cancelled) {
        if (next) {
          setError(null);
        }
        setUser(next);
      }
    })
      .then((off) => {
        if (cancelled) {
          off();
        } else {
          unsubscribe = off;
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            authErrorMessage(e, "Could not check sign-in status. Try again."),
          );
          setUser(null);
        }
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [configured]);

  useEffect(() => {
    if (!configured || !user) {
      setEntitlementDoc(undefined);
      setEntitlementLoadFailed(false);
      return;
    }

    let cancelled = false;
    let unsubscribeEntitlement: (() => void) | undefined;

    setEntitlementDoc(undefined);
    setEntitlementLoadFailed(false);

    void listenToStripeEntitlement(user.uid, (doc, err) => {
      if (cancelled) {
        return;
      }
      if (err) {
        setEntitlementLoadFailed(true);
        setEntitlementDoc(undefined);
        return;
      }
      setEntitlementDoc(doc ?? null);
    })
      .then((off) => {
        if (cancelled) {
          off();
        } else {
          unsubscribeEntitlement = off;
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setEntitlementLoadFailed(true);
          setError(
            authErrorMessage(e, "Could not load subscription status. Try again."),
          );
        }
      });

    return () => {
      cancelled = true;
      unsubscribeEntitlement?.();
    };
  }, [configured, user, entitlementRetryToken]);

  async function handleSignIn() {
    setSigningIn(true);
    setError(null);
    try {
      const mode = await signInWithGoogle();
      if (mode === "redirect") {
        return;
      }
      setSigningIn(false);
    } catch (e) {
      setError(authErrorMessage(e, "Sign-in did not complete. Try again."));
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    setError(null);
    setPortalOfferSubscribe(false);
    try {
      await signOutFirebase();
    } catch (e) {
      setError(authErrorMessage(e, "Sign-out did not complete. Try again."));
    }
  }

  async function handleSubscribe() {
    if (checkoutInFlight) {
      return;
    }
    setCheckoutInFlight(true);
    setError(null);
    setPortalOfferSubscribe(false);
    try {
      const url = await callCreateCheckoutSession();
      window.location.assign(url);
    } catch (e) {
      const { message, code } = firebaseCallableErrorMessage(
        e,
        "Checkout did not start. Try again.",
      );
      if (isCallableUnauthorized(code)) {
        setError("Sign in again, then try Subscribe.");
      } else {
        setError(message);
      }
      setCheckoutInFlight(false);
    }
  }

  async function handleManageBilling() {
    if (portalInFlight) {
      return;
    }
    setPortalInFlight(true);
    setError(null);
    setPortalOfferSubscribe(false);
    try {
      const url = await callCreatePortalSession();
      window.location.assign(url);
    } catch (e) {
      const { message, code } = firebaseCallableErrorMessage(
        e,
        "Billing portal did not open. Try again.",
      );
      if (isPortalNoCustomerError(code, message)) {
        setPortalOfferSubscribe(true);
        setError(null);
      } else if (isCallableUnauthorized(code)) {
        setError("Sign in again, then try Manage.");
      } else {
        setError(message);
      }
      setPortalInFlight(false);
    }
  }

  function retryEntitlementLoad() {
    setEntitlementLoadFailed(false);
    setEntitlementDoc(undefined);
    setError(null);
    setEntitlementRetryToken((value) => value + 1);
  }

  const subscribedExpiry =
    entitlementDoc &&
    isStripeEntitlementSubscribed(entitlementDoc, nowMillis) &&
    entitlementDoc.expiryTimeMillis != null
      ? entitlementDoc.expiryTimeMillis
      : null;

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
        <p className="lede" style={{ marginTop: "1rem" }}>
          Google sign-in on this page uses Firebase Authentication for this site
          to link the same account as the Enclave Android app. See our{" "}
          <Link to="/privacy">privacy policies</Link>.
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

      {authLoading && (
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

      {configured && signedIn && user && (
        <section className="subscribe-panel">
          <div className="contact-card">
            <strong>Signed in</strong>
            <p style={{ margin: "0.75rem 0 0" }}>
              Account id: <code>{user.uid}</code>
            </p>
          </div>

          {phase === "loading" && (
            <p className="lede" role="status">
              Loading subscription status…
            </p>
          )}

          {phase === "entitlement-error" && (
            <>
              <div className="form-msg err" role="alert">
                Could not load subscription status. Try again.
              </div>
              <button className="ghost-btn" type="button" onClick={retryEntitlementLoad}>
                Retry
              </button>
            </>
          )}

          {phase === "activating" && (
            <>
              <p role="status">
                Finishing your subscription. This usually takes a moment while we confirm
                payment.
              </p>
              <p style={{ color: "var(--muted)" }}>
                Stay on this page. We will update when your subscription is active.
              </p>
            </>
          )}

          {phase === "unsubscribed" && (
            <>
              <p>You do not have an active subscription.</p>
              {error && (
                <div className="form-msg err" role="alert">
                  {error}
                </div>
              )}
              <button
                className="pill-btn"
                type="button"
                disabled={checkoutInFlight}
                onClick={() => void handleSubscribe()}
              >
                {checkoutInFlight ? "Starting checkout…" : "Subscribe"}
              </button>
            </>
          )}

          {phase === "lapsed" && (
            <>
              <p>Your subscription is not active. Subscribe again to restore access.</p>
              {error && (
                <div className="form-msg err" role="alert">
                  {error}
                </div>
              )}
              <button
                className="pill-btn"
                type="button"
                disabled={checkoutInFlight}
                onClick={() => void handleSubscribe()}
              >
                {checkoutInFlight ? "Starting checkout…" : "Subscribe"}
              </button>
            </>
          )}

          {phase === "subscribed" && (
            <>
              <p>Your subscription is active.</p>
              {subscribedExpiry != null && (
                <p style={{ color: "var(--muted)" }}>
                  Renews on {formatExpiryDate(subscribedExpiry)}.
                </p>
              )}
              {portalOfferSubscribe ? (
                <>
                  <p>
                    Billing management is not set up for this account yet. Use Subscribe
                    to start checkout.
                  </p>
                  <button
                    className="pill-btn"
                    type="button"
                    disabled={checkoutInFlight}
                    onClick={() => void handleSubscribe()}
                  >
                    {checkoutInFlight ? "Starting checkout…" : "Subscribe"}
                  </button>
                </>
              ) : (
                <>
                  {error && (
                    <div className="form-msg err" role="alert">
                      {error}
                    </div>
                  )}
                  <button
                    className="pill-btn"
                    type="button"
                    disabled={portalInFlight}
                    onClick={() => void handleManageBilling()}
                  >
                    {portalInFlight ? "Opening billing…" : "Manage"}
                  </button>
                </>
              )}
            </>
          )}

          <button
            className="ghost-btn"
            type="button"
            style={{ marginTop: "1rem" }}
            onClick={() => void handleSignOut()}
          >
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
