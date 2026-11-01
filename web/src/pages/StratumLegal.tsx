import { Link } from "../lib/router";
import { LegalShell } from "./Legal";

// Migrated 2026-10-25 from stratum-a1a5b.web.app (STR-217). Text carried
// over as published there; only cross-links moved to the /stratum/* paths.
// The contact email remains support@shippopotamuslabs.com as in the
// originals, pending Sean's call on switching it to the Labs address.

const CONTACT_EMAIL = "support@shippopotamuslabs.com";

function StratumFooterLinks() {
  return (
    <p>
      <Link to="/stratum/privacy">Privacy Policy</Link> ·{" "}
      <Link to="/stratum/terms">Terms of Use</Link> ·{" "}
      <Link to="/stratum/delete-account">Delete your account</Link> ·{" "}
      <Link to="/stratum/licenses">Open-source licenses</Link>
    </p>
  );
}

export function StratumPrivacy() {
  return (
    <LegalShell title="Privacy Policy" app="Stratum" effective="July 10, 2026">
      <p>
        This Privacy Policy describes how Stratum ("we," "us") handles
        information when you use the Stratum Android app and related backend
        services. It is meant to be clear and short. Contact us if something
        is unclear.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Stratum is a workout log and programming companion. For privacy
        questions or data requests, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. Information we collect</h2>
      <p>Depending on how you use Stratum, we may process:</p>
      <ul>
        <li>
          <strong>Account information</strong> — identifiers from Google
          Sign-In (for example user ID, display name, and email associated
          with the Google account you choose).
        </li>
        <li>
          <strong>Training data you provide</strong> — programs, workouts,
          lifts, sets, weights, notes, gym or equipment preferences,
          onboarding answers, imports, and similar content you enter or
          upload.
        </li>
        <li>
          <strong>App and device signals</strong> — technical data needed to
          run and secure the service (for example app version, crash
          diagnostics, and App Check / integrity signals).
        </li>
        <li>
          <strong>Support messages</strong> — whatever you send us by email
          when you contact support.
        </li>
      </ul>
      <p>
        We do not require you to submit special medical diagnoses. Training
        logs can still reflect health-related activity (for example sessions
        completed). Treat that data carefully.
      </p>

      <h2>3. How we use information</h2>
      <ul>
        <li>Authenticate you and keep you signed in.</li>
        <li>
          Store and sync your training data across devices when cloud sync is
          enabled.
        </li>
        <li>
          Power product features such as program generation, progression
          helpers, imports, and optional cloud-assisted suggestions.
        </li>
        <li>
          Operate, secure, debug, and improve the app (including crash
          reporting).
        </li>
        <li>Respond to your requests and enforce our Terms of Use.</li>
      </ul>

      <h2>4. Cloud AI / language model processing</h2>
      <p>
        Some features may send limited, feature-related prompts or structured
        context to a cloud language model through our own backend (Firebase
        Callable Functions). Provider API keys are not shipped in the app.
        Content you include in those features may be processed by that
        backend and the model provider solely to fulfill the request. Do not
        put secrets or sensitive personal data into prompts or imports that
        you would not want processed for that purpose.
      </p>

      <h2>5. Third parties and processors</h2>
      <p>We use infrastructure providers to run Stratum, including:</p>
      <ul>
        <li>
          <strong>Google Firebase / Google Cloud</strong> — Authentication,
          Firestore, Cloud Functions, Storage (where used), App Check, and
          Crashlytics.
        </li>
        <li>
          <strong>Google Play</strong> — distribution, updates, and (when
          offered) billing for subscriptions or in-app products.
        </li>
        <li>
          <strong>Model inference providers</strong> — only via our backend
          when a cloud-assisted feature is used (not as a direct client
          integration from the app).
        </li>
      </ul>
      <p>
        These parties process data under their own terms and privacy policies
        when they act as independent controllers, or under our instructions
        when they act as processors.
      </p>

      <h2>6. Retention</h2>
      <p>
        We keep account and training data while your account is active and as
        needed to provide the service. Local data on a device is typically
        removed when you sign out on that device or uninstall the app. Cloud
        data is retained until you delete your account (or we delete it in
        response to a valid request), subject to reasonable backups, legal
        holds, and security logs.
      </p>

      <h2>7. Account deletion and your choices</h2>
      <p>
        <strong>Sign out</strong> clears local training data on that device;
        cloud data generally remains associated with your account so it can
        return when you sign back in.
      </p>
      <p>
        <strong>Delete account:</strong> In the app, open{" "}
        <strong>Settings → Account → Delete account</strong> and confirm. That
        permanently removes your Stratum Auth account, associated cloud
        training data, and local training data on the device (subject to
        short technical delays, backups, and any data we must keep for legal
        or security reasons). Your Google Account is not deleted. Full steps:{" "}
        <Link to="/stratum/delete-account">delete your Stratum account</Link>.
      </p>
      <p>
        If the in-app control is unavailable or fails, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address on
        your account and request deletion. We will process reasonable requests
        within a commercially reasonable time (typically within 30 days).
      </p>
      <p>
        You can also stop using Stratum at any time and revoke the app's
        Google access from your Google account settings.
      </p>

      <h2>8. Children</h2>
      <p>
        Stratum is not directed to children under 13 (or the minimum age
        required in your country). We do not knowingly collect personal
        information from children. If you believe a child has provided us
        personal information, contact us and we will take appropriate steps to
        delete it.
      </p>

      <h2>9. Security</h2>
      <p>
        We use industry-standard platform controls (including Firebase
        Authentication and App Check where configured). No method of
        transmission or storage is perfectly secure; use the app with that
        understanding.
      </p>

      <h2>10. International processing</h2>
      <p>
        We may process information in the United States and other countries
        where our providers operate. Those locations may have different
        data-protection rules than your home country.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. The "Effective
        date" will change when we do. Material changes may also be called out
        in the app or store listing when practical. Continued use after an
        update means you accept the revised policy.
      </p>

      <h2>12. Contact</h2>
      <p>
        Privacy questions, access requests, or deletion requests:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <StratumFooterLinks />
    </LegalShell>
  );
}

export function StratumTerms() {
  return (
    <LegalShell title="Terms of Use" app="Stratum" effective="July 11, 2026">
      <p>
        <strong>
          Training can hurt you. You are responsible for your training.
        </strong>{" "}
        Stratum is a software tool, not a coach, doctor, physical therapist,
        or personal trainer. You use the app and any program, progression, or
        suggestion at your own risk.
      </p>

      <h2>1. What Stratum is</h2>
      <p>
        Stratum is an Android workout log and programming companion. It may
        help you plan sessions, log sets, estimate volume, import programs,
        and generate or adjust training structure. It does{" "}
        <strong>not</strong> provide medical advice, physical therapy,
        diagnosis, treatment, or individualized professional coaching.
      </p>

      <h2>2. Training and health risk (read this)</h2>
      <p>
        Strength training and related activities involve inherent risks of
        injury, illness, or death. By using Stratum you acknowledge that:
      </p>
      <ul>
        <li>
          You are solely responsible for how you train, recover, eat, and use
          any information in the app.
        </li>
        <li>
          Programs, rep ranges, loads, progressions, AI or import-assisted
          suggestions, and any other guidance may be wrong, incomplete, or
          unsafe for you.
        </li>
        <li>
          You should consult a qualified physician before starting or changing
          an exercise program, especially if you have any medical condition,
          injury history, or other concern.
        </li>
        <li>
          There is no coach–client, trainer–client, or medical relationship
          between you and the operator of Stratum merely because you use the
          app.
        </li>
      </ul>
      <p>
        <strong>
          To the fullest extent permitted by law, you assume all risk of
          injury or other harm arising from your training and from your use
          of Stratum.
        </strong>
      </p>

      <h2>3. No warranties</h2>
      <p>
        Stratum is provided <strong>"as is" and "as available."</strong> We
        make no warranties of any kind, express or implied, including fitness
        for a particular purpose, accuracy, reliability, or non-infringement.
        Features may change, break, or go offline without notice.
      </p>

      <h2>4. Your content and imports</h2>
      <p>
        You may enter lifts, programs, notes, and other content, and you may
        import material from elsewhere (for example spreadsheets or other
        programs). You are solely responsible for that content: its accuracy,
        legality, and whether you have the right to use it. The operator of
        Stratum does not police third-party intellectual property on your
        behalf and is not responsible if you import or share something you
        should not.
      </p>

      <h2>5. Accounts</h2>
      <p>
        Access may require signing in with Google. You are responsible for
        activity under your account and for keeping your sign-in credentials
        secure. We may suspend or terminate access if we reasonably believe
        these Terms are being abused or the service is being misused.
      </p>
      <p>
        <strong>Deleting your Stratum account and data.</strong> You can
        permanently delete your Stratum account from the app via{" "}
        <strong>Settings → Account → Delete account</strong>. That removes
        your Stratum Firebase Auth account for the app, cloud training data
        tied to that account, and local training data on the device. It does{" "}
        <strong>not</strong> delete your Google Account. Deletion cannot be
        undone. Full steps and email fallback:{" "}
        <Link to="/stratum/delete-account">delete your Stratum account</Link>.
      </p>

      <h2>6. Subscriptions and purchases</h2>
      <p>
        If paid features or subscriptions are offered, they are billed
        through Google Play under Google's terms and payment processes.
        Manage or cancel subscriptions in Google Play. Taxes and refunds
        follow Google Play's policies unless a separate statement says
        otherwise.
      </p>
      <p>
        Subscription fees (if any) pay for access under these Terms. They do{" "}
        <strong>not</strong> guarantee unlimited compute, unlimited program
        generation, or any particular volume of cloud generation or related
        automated services.
      </p>

      <h2>7. Fair use and automated generation</h2>
      <p>
        Certain Stratum features—including cloud program generation, lift-swap
        or naming assistance, import assistance, and similar automated or
        server-side jobs—use limited service resources. They are provided for
        ordinary, personal training use, not for bulk, automated, or abusive
        consumption.
      </p>
      <p>By using those features you acknowledge that:</p>
      <ul>
        <li>
          We may enforce reasonable use limits, including per-account monthly
          caps on program generation and other generation-related requests.
        </li>
        <li>
          We may queue, throttle, or refuse requests that exceed those limits
          or that appear excessive, automated, scripted, or otherwise abusive.
        </li>
        <li>
          We may suspend or terminate accounts that automate generation,
          circumvent limits, or otherwise abuse these features, consistent
          with the Accounts section above.
        </li>
        <li>
          Exact limits may change over time. We will give notice by updating
          these Terms and/or through in-app messaging; continued use after
          notice constitutes acceptance of the updated limits.
        </li>
      </ul>
      <p>
        Nothing in a subscription, purchase, or feature description creates a
        right to unlimited generation capacity. Availability of cloud
        generation features depends on capacity, fair use, and the
        operational needs of the service.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by applicable law, the operator of
        Stratum (and its officers, contractors, and agents) will not be liable
        for any indirect, incidental, special, consequential, exemplary, or
        punitive damages, or for any loss of profits, data, goodwill, or other
        intangible losses, arising out of or related to your use of (or
        inability to use) the app—including injuries sustained while
        training—even if advised of the possibility of such damages.
      </p>
      <p>
        To the fullest extent permitted by law, our total liability for any
        claim arising out of or relating to the app or these Terms is limited
        to the greater of (a) the amount you paid us for Stratum in the
        twelve months before the claim, or (b) USD $50.
      </p>
      <p>
        Some jurisdictions do not allow certain limitations; in those places,
        our liability is limited to the maximum extent permitted.
      </p>

      <h2>9. Indemnity</h2>
      <p>
        You agree to defend and hold harmless the operator of Stratum from
        claims, damages, and expenses (including reasonable legal fees)
        arising from your training, your content, your misuse of the app, or
        your violation of these Terms—except to the extent a claim is caused
        by our willful misconduct where such exclusion is not allowed by law.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of the{" "}
        <strong>State of Delaware</strong>, United States, without regard to
        conflict-of-law rules. Courts located in Delaware will have exclusive
        jurisdiction over disputes arising out of or relating to these Terms
        or the app, except that we may seek injunctive relief in any
        jurisdiction if needed to protect the service. If you are a consumer
        with non-waivable rights in your home jurisdiction, those rights
        still apply to the extent required by law.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these Terms from time to time. The "Effective date"
        above will change when we do. Continued use of Stratum after an
        update means you accept the revised Terms. If you do not agree, stop
        using the app and delete your account via Settings (or contact us to
        request deletion).
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <StratumFooterLinks />
    </LegalShell>
  );
}

export function StratumDeleteAccount() {
  return (
    <LegalShell title="Delete your Stratum account" app="Stratum" effective="">
      <p>
        For the <strong>Stratum</strong> Android app (developer listing name:{" "}
        <strong>Stratum</strong> / package <code>com.aether.stratum</code>).
      </p>
      <p>
        <strong>Self-serve deletion.</strong> You can delete your account and
        associated data from inside the app. Use the steps below. We also
        process reasonable email requests within a commercially reasonable
        time (typically within 30 days) if you cannot use the in-app control.
      </p>

      <h2>Delete from the app (recommended)</h2>
      <ol>
        <li>Open Stratum on your Android device and sign in with Google.</li>
        <li>
          Open <strong>Settings</strong>.
        </li>
        <li>
          In the <strong>Account</strong> section, tap{" "}
          <strong>Delete account</strong>.
        </li>
        <li>
          Confirm when prompted. This permanently removes your Stratum
          account and training data from this device and the cloud. Your
          Google Account is not deleted.
        </li>
        <li>
          After deletion you are signed out and returned to the sign-in
          screen. You may also revoke Stratum's access under your{" "}
          <a href="https://myaccount.google.com/permissions">
            Google Account permissions
          </a>{" "}
          if it still appears there.
        </li>
      </ol>

      <h2>Email request (if you cannot use the app)</h2>
      <ol>
        <li>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the{" "}
          <strong>same Google account email</strong> you use to sign in to
          Stratum.
        </li>
        <li>
          Use a subject line like{" "}
          <strong>Stratum account deletion request</strong>.
        </li>
        <li>
          In the body, state that you want your Stratum account and
          associated data deleted, and include the Google account email used
          in the app.
        </li>
      </ol>

      <h2>What we delete</h2>
      <p>When account deletion completes, we remove from our systems:</p>
      <ul>
        <li>Your Firebase Auth account for Stratum (where applicable)</li>
        <li>
          Cloud training data tied to that account (for example programs,
          workouts, logs, preferences, import job metadata, and related sync
          documents we store for the app)
        </li>
        <li>Local training data on the device when you delete from the app</li>
        <li>
          Associated support emails you sent about a manual request, after
          we're done
        </li>
      </ul>

      <h2>What we may keep (limited retention)</h2>
      <ul>
        <li>
          Short-lived backups or logs needed for security, fraud prevention,
          or legal compliance, deleted or rotated on normal retention
          schedules
        </li>
        <li>
          Aggregated or de-identified analytics that cannot reasonably
          identify you
        </li>
        <li>
          Records we are required to keep by law (if any apply to a specific
          request)
        </li>
      </ul>

      <h2>What deletion does not do</h2>
      <ul>
        <li>
          It does not delete your Google Account itself—only Stratum's
          account and our app data for that sign-in.
        </li>
        <li>
          <strong>Log out</strong> (without deleting) only clears local data
          on that device; cloud data remains so it can return when you sign
          back in.
        </li>
        <li>
          Uninstalling the app alone does not delete cloud data; use Delete
          account (or email us) for a full wipe.
        </li>
      </ul>

      <h2>Contact</h2>
      <p>
        Deletion and privacy requests:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <StratumFooterLinks />
    </LegalShell>
  );
}

export function StratumLicenses() {
  return (
    <LegalShell
      title="Open-source licenses"
      app="Stratum"
      effective="July 10, 2026"
    >
      <p>
        Stratum is built with free and open-source software. This page
        acknowledges major third-party components distributed with or used by
        the Android app. Each project remains under its own license; the
        summaries below are for convenience, not a substitute for the full
        license text.
      </p>

      <h2>Major components</h2>
      <ul>
        <li>
          <strong>Kotlin</strong> — Apache License 2.0 —{" "}
          <a href="https://github.com/JetBrains/kotlin">JetBrains/kotlin</a>
        </li>
        <li>
          <strong>AndroidX / Jetpack</strong> (including Compose, Room,
          Lifecycle, Navigation, WorkManager, DataStore, Credentials) —
          Apache License 2.0 —{" "}
          <a href="https://developer.android.com/jetpack">Android Jetpack</a>
        </li>
        <li>
          <strong>Material components for Android / Compose Material3</strong>{" "}
          — Apache License 2.0
        </li>
        <li>
          <strong>Dagger / Hilt</strong> — Apache License 2.0 —{" "}
          <a href="https://github.com/google/dagger">google/dagger</a>
        </li>
        <li>
          <strong>Kotlin coroutines</strong> — Apache License 2.0 —{" "}
          <a href="https://github.com/Kotlin/kotlinx.coroutines">
            Kotlin/kotlinx.coroutines
          </a>
        </li>
        <li>
          <strong>kotlinx.serialization</strong> — Apache License 2.0
        </li>
        <li>
          <strong>Firebase Android SDKs</strong> (Auth, Firestore, Functions,
          Storage, App Check, Crashlytics, and related Google Play services
          libraries) — see Google's open-source notices for the specific
          artifacts you install from Google Play / Maven
        </li>
        <li>
          <strong>Coil</strong> — Apache License 2.0 —{" "}
          <a href="https://github.com/coil-kt/coil">coil-kt/coil</a>
        </li>
        <li>
          <strong>Vico</strong> (charts) by Patryk Goworowski &amp; Patrick
          Michalik /{" "}
          <a href="https://github.com/patrykandpatrick/vico">
            patrykandpatrick/vico
          </a>{" "}
          — Apache License 2.0. Maven artifacts used by Stratum:{" "}
          <code>com.patrykandpatrick.vico:compose</code>,{" "}
          <code>com.patrykandpatrick.vico:compose-m3</code> (and transitive
          Vico modules). Copyright © the Vico authors. Licensed under the
          Apache License, Version 2.0; see{" "}
          <a href="https://github.com/patrykandpatrick/vico/blob/main/LICENSE">
            LICENSE
          </a>{" "}
          in the Vico repository and the Apache summary below.
        </li>
        <li>
          <strong>Google OR-Tools</strong> — Apache License 2.0 and related
          notices —{" "}
          <a href="https://github.com/google/or-tools">google/or-tools</a>
        </li>
        <li>
          <strong>Turbine</strong> (tests) — Apache License 2.0
        </li>
        <li>
          <strong>JUnit / Robolectric / related test tooling</strong> — EPL /
          Apache / other licenses as published by those projects (test-only;
          not shipped in production APK behavior paths)
        </li>
        <li>
          <strong>Body map geometry</strong> used by the muscle picker is
          derived from <code>react-native-body-highlighter</code> (MIT) — see
          in-app source attribution
        </li>
      </ul>

      <h2>Apache License 2.0 (summary)</h2>
      <p>
        Many of the libraries above are licensed under the Apache License,
        Version 2.0. You may obtain a copy of the License at{" "}
        <a href="https://www.apache.org/licenses/LICENSE-2.0">
          https://www.apache.org/licenses/LICENSE-2.0
        </a>
        . Unless required by applicable law or agreed to in writing, software
        distributed under the License is distributed on an "AS IS" BASIS,
        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
        implied.
      </p>

      <h2>MIT License (summary)</h2>
      <p>
        Some components (including certain UI geometry sources) are MIT
        licensed: free of charge permission to use, copy, modify, merge,
        publish, distribute, sublicense, and/or sell copies, subject to
        including the copyright notice and permission notice in substantial
        portions of the software, and without warranty.
      </p>

      <h2>Contact</h2>
      <p>
        If you need a more complete dependency inventory or a machine-readable
        license report for a specific Stratum build, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <StratumFooterLinks />
    </LegalShell>
  );
}
