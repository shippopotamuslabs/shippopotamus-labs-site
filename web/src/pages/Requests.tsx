import { useCallback, useEffect, useState, type FormEvent } from "react";
import { APPS, SUPPORT_EMAIL } from "../data/apps";
import {
  fetchRequests,
  submitRequest,
  type PublicRequest,
} from "../lib/api";

type ListState =
  | { kind: "loading" }
  | { kind: "ready"; configured: boolean; items: PublicRequest[] }
  | { kind: "down" };

const APP_NAMES: Record<string, string> = Object.fromEntries(
  APPS.map((a) => [a.slug, a.name]),
);

function initialAppFilter(): string {
  const app = new URLSearchParams(window.location.search).get("app");
  return app && APP_NAMES[app] ? app : "";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Requests() {
  const [appFilter, setAppFilter] = useState<string>(initialAppFilter);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [list, setList] = useState<ListState>({ kind: "loading" });

  const load = useCallback(async () => {
    setList({ kind: "loading" });
    const result = await fetchRequests(appFilter || undefined, typeFilter || undefined);
    if (result === null) {
      setList({ kind: "down" });
    } else {
      setList({ kind: "ready", configured: result.configured, items: result.items });
    }
  }, [appFilter, typeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  // ---- submission form ----
  const [formApp, setFormApp] = useState<string>(initialAppFilter() || "stratum");
  const [formType, setFormType] = useState<string>("feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const configured =
    list.kind === "ready" ? list.configured : list.kind === "loading" ? null : false;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFeedback(null);
    const result = await submitRequest({
      app: formApp,
      type: formType,
      title: title.trim(),
      description: description.trim(),
      email: email.trim() || undefined,
      honeypot,
    });
    setSending(false);
    if (result.ok) {
      setFeedback({
        ok: true,
        text: result.id
          ? `Thanks. Your request is in as ${result.id} and is listed publicly below.`
          : "Thanks. Your request is in and will appear in the public list.",
      });
      setTitle("");
      setDescription("");
      setEmail("");
      void load();
    } else {
      setFeedback({
        ok: false,
        text: `${result.error ?? "Something went wrong."} You can also email it to ${SUPPORT_EMAIL}.`,
      });
    }
  };

  return (
    <>
      <section className="app-hero">
        <p className="eyebrow">Requests</p>
        <h1>Feature requests &amp; bug reports</h1>
        <p className="lede">
          Everything below is public: the same list the studio works from,
          with internal details left out. Ask for something, or tell us
          what's broken.
        </p>
      </section>

      <div className="filters">
        <label>
          App
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
          >
            <option value="">All apps</option>
            {APPS.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            <option value="feature">Feature requests</option>
            <option value="bug">Bug reports</option>
          </select>
        </label>
      </div>

      {list.kind === "loading" && <p style={{ color: "var(--muted)" }}>Loading requests…</p>}

      {(list.kind === "down" || (list.kind === "ready" && !list.configured)) && (
        <div className="empty-note">
          Public requests are opening soon. Until then, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with the
          app name and what you'd like to see, or what's broken.
        </div>
      )}

      {list.kind === "ready" && list.configured && list.items.length === 0 && (
        <div className="empty-note">
          Nothing public here yet. Be the first to ask.
        </div>
      )}

      {list.kind === "ready" && list.configured && list.items.length > 0 && (
        <ul className="request-list">
          {list.items.map((item) => (
            <li className="request-item" key={item.id}>
              <p className="req-title">{item.title}</p>
              <div className="req-meta">
                <span className="tag accent">{item.id}</span>
                <span className="tag">{APP_NAMES[item.app] ?? item.app}</span>
                <span className="tag">
                  {item.type === "feature" ? "Feature request" : "Bug report"}
                </span>
                <span className="tag">{item.state}</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="section">
        <h2>Submit a request</h2>
        <form className="req-form" onSubmit={onSubmit}>
          <div className="row">
            <label>
              App
              <select value={formApp} onChange={(e) => setFormApp(e.target.value)}>
                {APPS.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                <option value="feature">Feature request</option>
                <option value="bug">Bug report</option>
              </select>
            </label>
          </div>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={120}
              placeholder="One line: what should exist, or what's broken"
            />
          </label>
          <label>
            Details
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={4000}
              rows={6}
              placeholder="For features: what it should do and why. For bugs: what happened, what you expected, and the steps to make it happen again."
            />
          </label>
          <label>
            Email <span className="hint">(optional; only used to reply to you, never shown publicly)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          {/* Honeypot: humans never see this field. Bots fill it and are silently accepted-and-dropped by the API. */}
          <div className="hp-field" aria-hidden="true">
            <label>
              Leave this field empty
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
          </div>
          {feedback && (
            <div className={`form-msg ${feedback.ok ? "ok" : "err"}`} role="status">
              {feedback.text}
            </div>
          )}
          <div>
            <button className="pill-btn" type="submit" disabled={sending || configured === false}>
              {sending ? "Sending…" : "Submit request"}
            </button>
            {configured === false && (
              <p style={{ color: "var(--muted)", marginTop: 10 }}>
                Submissions open soon. The email route above works today.
              </p>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
