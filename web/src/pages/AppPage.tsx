import type { AppInfo } from "../data/apps";
import { Link } from "../lib/router";

export default function AppPage({ app }: { app: AppInfo }) {
  return (
    <>
      <section className="app-hero">
        <p className="eyebrow">{app.kind}</p>
        <h1>{app.name}</h1>
        {app.description.map((para, i) => (
          <p className="lede" key={i} style={i > 0 ? { marginTop: 14 } : undefined}>
            {para}
          </p>
        ))}
      </section>

      {app.screenshots && app.screenshots.length > 0 && (
        <section className="section">
          <h2>Screenshots</h2>
          <div className="shots">
            {app.screenshots.map((s) => (
              <figure key={s.src}>
                <img src={s.src} alt={s.alt} loading="lazy" />
                <figcaption>{s.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2>What it does</h2>
        <div className="feature-grid">
          {app.features.map((f) => (
            <div className="feature" key={f.title}>
              <strong>{f.title}</strong>
              {f.text}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Current status</h2>
        <div className="status" style={{ marginTop: 14 }}>
          <strong>{app.statusLabel}</strong>
          {app.status}
        </div>
      </section>

      <section className="section">
        <h2>Links</h2>
        <div className="status" style={{ marginTop: 14 }}>
          {app.linksNote}
        </div>
        <div className="app-card-actions">
          <Link className="ghost-btn" to={`/requests?app=${app.slug}`}>
            Feature requests &amp; bug reports for {app.name}
          </Link>
        </div>
      </section>
    </>
  );
}
