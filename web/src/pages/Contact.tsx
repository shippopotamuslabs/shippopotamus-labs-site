import { REDDIT_URL, SUPPORT_EMAIL } from "../data/apps";
import { Link } from "../lib/router";

export default function Contact() {
  return (
    <>
      <section className="app-hero">
        <p className="eyebrow">Contact</p>
        <h1>Get in touch</h1>
        <p className="lede">
          No contact form, no ticket portal maze. Email is the front door,
          and feature requests and bug reports have their own page so they
          don't get lost in an inbox.
        </p>
      </section>

      <div className="contact-cards">
        <div className="contact-card">
          <strong>Email</strong>
          For anything that isn't a feature request or a bug report:
          <br />
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </div>
        <div className="contact-card">
          <strong>Reddit</strong>
          Follow development and say hello in public:
          <br />
          <a href={REDDIT_URL} target="_blank" rel="noreferrer">
            u/Ok_Wafer_273
          </a>
        </div>
        <div className="contact-card">
          <strong>Features &amp; bugs</strong>
          Want something built, or found something broken?
          <br />
          <Link to="/requests">Go to Requests</Link>
        </div>
      </div>
    </>
  );
}
