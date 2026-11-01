import { useEffect } from "react";
import { SUPPORT_EMAIL, appBySlug } from "./data/apps";
import { Link, usePathname } from "./lib/router";
import AppPage from "./pages/AppPage";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import {
  DeleteAccount,
  PrivacyHub,
  PrivacyPolicy,
  TermsHub,
  TermsOfService,
} from "./pages/Legal";
import Requests from "./pages/Requests";
import {
  StratumDeleteAccount,
  StratumLicenses,
  StratumPrivacy,
  StratumTerms,
} from "./pages/StratumLegal";

const NAV: { to: string; label: string }[] = [
  { to: "/", label: "Home" },
  { to: "/stratum", label: "Stratum" },
  { to: "/bloviate", label: "Bloviate" },
  { to: "/enclave", label: "Enclave" },
  { to: "/requests", label: "Requests" },
  { to: "/contact", label: "Contact" },
];

const TITLES: Record<string, string> = {
  "/": "Shippopotamus Labs",
  "/stratum": "Stratum · Shippopotamus Labs",
  "/bloviate": "Bloviate · Shippopotamus Labs",
  "/enclave": "Enclave · Shippopotamus Labs",
  "/requests": "Requests · Shippopotamus Labs",
  "/contact": "Contact · Shippopotamus Labs",
  "/privacy": "Privacy policies · Shippopotamus Labs",
  "/terms": "Terms of service · Shippopotamus Labs",
  "/bloviate/privacy": "Bloviate Privacy Policy · Shippopotamus Labs",
  "/bloviate/terms": "Bloviate Terms of Service · Shippopotamus Labs",
  "/bloviate/delete-account": "Delete your Bloviate account · Shippopotamus Labs",
  "/delete-account": "Delete your Bloviate account · Shippopotamus Labs",
  "/stratum/privacy": "Stratum Privacy Policy · Shippopotamus Labs",
  "/stratum/terms": "Stratum Terms of Use · Shippopotamus Labs",
  "/stratum/delete-account": "Delete your Stratum account · Shippopotamus Labs",
  "/stratum/licenses": "Open-source licenses — Stratum · Shippopotamus Labs",
};

export default function App() {
  const path = usePathname();

  useEffect(() => {
    document.title = TITLES[path] ?? "Shippopotamus Labs";
    window.scrollTo(0, 0);
  }, [path]);

  let page;
  if (path === "/") {
    page = <Home />;
  } else if (path === "/requests") {
    page = <Requests />;
  } else if (path === "/contact") {
    page = <Contact />;
  } else if (path === "/privacy") {
    page = <PrivacyHub />;
  } else if (path === "/terms") {
    page = <TermsHub />;
  } else if (path === "/bloviate/privacy") {
    page = <PrivacyPolicy />;
  } else if (path === "/bloviate/terms") {
    page = <TermsOfService />;
  } else if (path === "/bloviate/delete-account" || path === "/delete-account") {
    page = <DeleteAccount />;
  } else if (path === "/stratum/privacy") {
    page = <StratumPrivacy />;
  } else if (path === "/stratum/terms") {
    page = <StratumTerms />;
  } else if (path === "/stratum/delete-account") {
    page = <StratumDeleteAccount />;
  } else if (path === "/stratum/licenses") {
    page = <StratumLicenses />;
  } else {
    const app = appBySlug(path.slice(1));
    page = app ? (
      <AppPage app={app} />
    ) : (
      <section className="app-hero">
        <h1>Not found</h1>
        <p className="lede">
          That page doesn't exist. The <Link to="/">home page</Link> does.
        </p>
      </section>
    );
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand" to="/">
            Shippopotamus Labs
          </Link>
          <nav className="main-nav">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={path === item.to ? "active" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="page">{page}</main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span className="foot-brand">Shippopotamus Labs</span>
          <span>Indie Android apps: Stratum, Bloviate, Enclave.</span>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          <Link to="/requests">Requests</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </footer>
    </>
  );
}
