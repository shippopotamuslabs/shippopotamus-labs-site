import { SUPPORT_EMAIL } from "../data/apps";
import { Link } from "../lib/router";

const EFFECTIVE = "October 25, 2026";

function LegalHub({
  kind,
  blurb,
  entries,
}: {
  kind: string;
  blurb: string;
  entries: { app: string; line: string; to?: string }[];
}) {
  return (
    <>
      <section className="app-hero">
        <p className="eyebrow">Shippopotamus Labs</p>
        <h1>{kind}</h1>
        <p className="lede">{blurb}</p>
      </section>
      <section className="section">
        <div className="contact-cards">
          {entries.map((e) => (
            <div className="contact-card" key={e.app}>
              <strong>{e.app}</strong>
              <span>{e.line}</span>
              {e.to ? (
                <>
                  {" "}
                  <Link to={e.to}>
                    Read the {e.app} {kind === "Privacy policies" ? "privacy policy" : "terms of service"}
                  </Link>
                  .
                </>
              ) : (
                <>
                  {" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function PrivacyHub() {
  return (
    <LegalHub
      kind="Privacy policies"
      blurb="Each Shippopotamus Labs app has its own privacy policy, written for what that app actually does."
      entries={[
        {
          app: "Bloviate",
          line: "On-device dictation; optional cloud styling sends transcript text only. Audio never leaves the phone.",
          to: "/bloviate/privacy",
        },
        {
          app: "Stratum",
          line: "Workout and training data, Google sign-in, Health Connect, and cloud program generation.",
          to: "/stratum/privacy",
        },
        {
          app: "Enclave",
          line: "Its policy page is moving to this site. Until it lands, questions go to",
        },
      ]}
    />
  );
}

export function TermsHub() {
  return (
    <LegalHub
      kind="Terms of service"
      blurb="Each Shippopotamus Labs app has its own terms, written for that app's service."
      entries={[
        {
          app: "Bloviate",
          line: "Covers the free app and the Bloviate Styles subscription, including the fair-use allowance.",
          to: "/bloviate/terms",
        },
        {
          app: "Stratum",
          line: "Training risk, accounts, subscriptions, and the fair-use limits on cloud generation.",
          to: "/stratum/terms",
        },
        {
          app: "Enclave",
          line: "Its terms page is moving to this site. Until it lands, questions go to",
        },
      ]}
    />
  );
}

export function LegalShell({
  title,
  app = "Bloviate",
  effective = EFFECTIVE,
  children,
}: {
  title: string;
  app?: string;
  effective?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="app-hero">
        <p className="eyebrow">{app}</p>
        <h1>{title}</h1>
        {effective ? <p className="lede">Effective date: {effective}</p> : null}
      </section>
      <section className="section legal">{children}</section>
    </>
  );
}


export function PrivacyPolicy() {
  return (
    <LegalShell title="Bloviate Privacy Policy">
      <p>
        Bloviate is a dictation app for Android, made by Shippopotamus Labs.
        This policy describes what data the app handles, where it goes, and
        what you can do about it. Questions:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>Your audio stays on your phone</h2>
      <p>
        Bloviate transcribes your voice on your device. Your audio is never
        uploaded, never stored on a server, and never leaves your phone. The
        free version of Bloviate sends nothing anywhere: no account, no network
        calls for dictation.
      </p>

      <h2>What we collect, and why</h2>
      <p>
        <strong>Account information.</strong> When you sign in with Google, we
        receive your name and email address. We use them to run your account
        and your subscription entitlement. That is the only personal
        information sign-in gives us.
      </p>
      <p>
        <strong>Subscription records.</strong> When you subscribe, Google Play
        handles the payment. We receive a purchase token from Google Play and
        keep a record that your account holds an active subscription, so the
        app can unlock cloud styles. We never see or store your payment card
        details.
      </p>
      <p>
        <strong>Fair-use counters.</strong> Cloud styling is sold as unlimited
        ordinary use with a monthly fair-use allowance. To run that allowance
        we keep a per-account counter of AI processing usage (token counts)
        for the current month. The counter records how much processing you
        used. It never records what you said or what the styling produced.
      </p>
      <p>
        <strong>Support email.</strong> If you email us, we receive your email
        address and whatever you write. We use it to answer you.
      </p>

      <h2>Cloud styling: where your text goes</h2>
      <p>
        Cloud styles are optional and part of the subscription. When you
        dictate with a cloud style selected, the app sends the transcript text
        of that dictation to our server. Our server passes the text to an AI
        provider (currently DeepSeek and Google Gemini models, reached through
        routing providers) with the style's instructions, receives the styled
        text back, and returns it to your phone.
      </p>
      <ul>
        <li>
          The text is processed to produce your styled dictation. It is not
          stored and it is not logged. Our server logs carry an account
          identifier hash, the style used, token counts, latency, and
          estimated cost, never transcript or output content.
        </li>
        <li>
          Your custom styles are stored with your account on our server and
          cached on your device. A cloud styling request sends the style's
          identifier and your transcript text.
        </li>
        <li>
          All traffic between the app, our server, and providers is encrypted
          in transit.
        </li>
      </ul>

      <h2>Diagnostics</h2>
      <p>
        The app may collect crash logs and basic diagnostics (device model,
        Android version, app version, and where in the app a failure occurred)
        so we can find and fix bugs. Diagnostics do not include your audio,
        your transcripts, or your styled text.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell personal information.</li>
        <li>
          We do not share personal information with third parties for
          advertising. The AI providers above process text only to return your
          styled dictation, as service providers.
        </li>
        <li>We do not build advertising profiles. Bloviate has no ads.</li>
        <li>
          We do not knowingly collect data from children. Bloviate is for
          adults, 18 and older.
        </li>
      </ul>

      <h2>Retention and deletion</h2>
      <p>
        Account information and subscription records are kept while your
        account exists. Fair-use counters reset monthly and are not kept as a
        history of your dictations. You can delete your account and its
        associated data at any time: see the{" "}
        <Link to="/bloviate/delete-account">account deletion page</Link>.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that affects what data goes where, we
        will update this page and change the effective date before the change
        takes effect in the app.
      </p>
      <p>
        Shippopotamus Labs
        <br />
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalShell>
  );
}

export function TermsOfService() {
  return (
    <LegalShell title="Bloviate Terms of Service">
      <p>
        These terms are an agreement between you and Shippopotamus Labs for
        the use of Bloviate, a dictation app for Android. By using Bloviate,
        you accept these terms. Questions:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>The service</h2>
      <p>
        Bloviate turns speech into text on your device. The free version
        transcribes on your phone and applies the built-in mechanical styles.
        A subscription, Bloviate Styles, adds cloud styles: your transcript
        text is sent to our server and restyled by AI models, and the styled
        text comes back to your phone. The{" "}
        <Link to="/bloviate/privacy">privacy policy</Link> describes exactly what data
        moves and what does not.
      </p>
      <p>Bloviate is for adults. You must be 18 or older to use it.</p>

      <h2>Your account</h2>
      <p>
        Cloud styles require signing in with a Google account. Your
        subscription is tied to that account. One subscription serves one
        account on that person's own devices.
      </p>

      <h2>Subscription and billing</h2>
      <ul>
        <li>
          Bloviate Styles costs $2.99 per month, with a one-week free trial
          for new subscribers. After the trial, the subscription renews
          automatically each month until cancelled.
        </li>
        <li>
          Google Play handles billing. You can cancel at any time in Google
          Play; cancellation stops the next renewal, and cloud styles stay
          available until the end of the current billing period.
        </li>
        <li>Refunds follow Google Play's refund policies.</li>
        <li>
          Prices may change. If the price of your subscription changes,
          Google Play will notify you and the change will apply as Google
          Play's rules provide.
        </li>
      </ul>

      <h2>Fair use</h2>
      <p>
        Bloviate Styles is sold for personal, human dictation. "Unlimited"
        means unlimited ordinary use by one person on their own devices.
        Automated, scripted, or bulk use is not permitted, including accessing
        the styling service through anything other than the Bloviate app, or
        reselling styled output as a service. To keep the service sustainable
        for everyone, styled dictations are subject to a generous monthly
        fair-use allowance measured by AI processing usage, with rate limits
        that ordinary dictation never reaches. If you reach the allowance,
        styling pauses until your next billing cycle. Your on-device dictation
        and the mechanical styles always keep working, allowance or not,
        subscription or not.
      </p>

      <h2>Your content</h2>
      <p>
        Your dictations are yours. You grant us only the processing needed to
        run the service: transcribing on your device, and, when you choose a
        cloud style, sending the transcript to our server and its AI providers
        to produce the styled text. We do not store that text (see the{" "}
        <Link to="/bloviate/privacy">privacy policy</Link>).
      </p>
      <p>Custom styles you create are yours. Styles you create stay on your device.</p>

      <h2>AI output</h2>
      <p>
        Cloud styles produce AI-generated text. Styles rewrite in voices you
        choose, and some voices use strong language. You are responsible for
        the text you send, publish, or act on after styling. Check important
        text before you rely on it, the same as any draft.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Use Bloviate for your own dictation. Do not use it to break the law,
        to infringe anyone's rights, or to attack, overload, or probe the
        styling service. We may suspend an account that does any of these, or
        that passes the fair-use limits by automated means.
      </p>

      <h2>Availability and changes</h2>
      <p>
        We work on Bloviate continuously. Features may be added, changed, or
        removed, and the cloud styling service may occasionally be
        unavailable. On-device dictation does not depend on our servers and
        keeps working regardless. We may update these terms; the current
        version will always be at this address with its effective date, and
        continued use after a change means you accept it.
      </p>

      <h2>Warranty and liability</h2>
      <p>
        Bloviate is provided as is, without warranties of any kind. To the
        fullest extent the law allows, Shippopotamus Labs is not liable for
        indirect or consequential damages arising from use of the app, and
        total liability is limited to the amount you paid for the service in
        the twelve months before the claim.
      </p>

      <h2>Closing your account</h2>
      <p>
        You can delete your account at any time from the{" "}
        <Link to="/bloviate/delete-account">account deletion page</Link>. Deleting
        your account does not cancel your Google Play subscription; cancel
        that in Google Play as well if you want billing to stop.
      </p>
      <p>
        Shippopotamus Labs
        <br />
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalShell>
  );
}

export function DeleteAccount() {
  return (
    <LegalShell title="Delete your Bloviate account">
      <p>
        You can delete your Bloviate account and the data tied to it. Deleting
        is permanent.
      </p>

      <h2>How to delete</h2>
      <p>
        In the app: open Bloviate, go to the Setup tab, and tap{" "}
        <strong>Delete account</strong>. Tap <strong>Continue</strong>, sign
        in again to confirm it is you, then tap <strong>Delete account</strong>{" "}
        again. Your account is deleted right away.
      </p>
      <p>
        You can also email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the
        Google account email you use for Bloviate, with the subject "Delete
        my Bloviate account." We verify the request comes from the account's
        email address, then delete the account. Email requests are processed
        within 30 days, and we reply to confirm when the deletion is complete.
      </p>

      <h2>What gets deleted</h2>
      <ul>
        <li>Your account record, including your name and email address</li>
        <li>
          Your subscription entitlement records and fair-use usage counters
          held by us
        </li>
        <li>Your custom styles stored with your account</li>
        <li>Output reports you submitted</li>
        <li>Any other server-side records tied to your account</li>
      </ul>

      <h2>What deletion does not do</h2>
      <ul>
        <li>
          It does not cancel your Google Play subscription. If you subscribe,
          cancel in Google Play too, or billing continues.
        </li>
        <li>
          Google keeps its own purchase records under Google's policies;
          those are Google's records, not ours.
        </li>
        <li>
          Dictations and data that live only on your phone stay on your phone
          until you uninstall Bloviate.
        </li>
      </ul>
      <p>
        Shippopotamus Labs
        <br />
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalShell>
  );
}
