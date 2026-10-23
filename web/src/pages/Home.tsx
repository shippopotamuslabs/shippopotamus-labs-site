import { APPS, REDDIT_URL } from "../data/apps";
import { Link } from "../lib/router";

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Shippopotamus Labs</p>
        <h1>Small studio. Serious apps.</h1>
        <p className="lede">
          Shippopotamus Labs is an independent Android studio building three
          apps: Stratum, a workout tracker; Bloviate, dictation with style;
          and Enclave, a privacy-first AI assistant that runs on your phone.
        </p>
      </section>

      {APPS.map((app) => (
        <section className="app-card" key={app.slug}>
          <div className="app-card-head">
            <h2>{app.name}</h2>
            <span className="app-kind">{app.kind}</span>
          </div>
          <p>{app.blurb}</p>
          <div className="status">
            <strong>Current status</strong>
            {app.status}
          </div>
          <div className="app-card-actions">
            <Link className="ghost-btn" to={`/${app.slug}`}>
              About {app.name}
            </Link>
            <Link className="ghost-btn" to={`/requests?app=${app.slug}`}>
              Requests for {app.name}
            </Link>
          </div>
        </section>
      ))}

      <section className="follow">
        <h2>Follow along</h2>
        <p>
          Development notes, release announcements, and the occasional
          progress screenshot land on the studio's Reddit profile first.
        </p>
        <a
          className="pill-btn"
          href={REDDIT_URL}
          target="_blank"
          rel="noreferrer"
        >
          Follow on Reddit
        </a>
      </section>
    </>
  );
}
