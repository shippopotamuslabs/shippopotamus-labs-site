import { useEffect, type ReactNode } from "react";
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

// Single route table: each static path carries its document title and its
// page. App pages (/<slug>) resolve through appBySlug instead, with the
// title derived from the app data; anything else is Not found.
type Route = { title: string; page: ReactNode };

const deleteAccountRoute: Route = {
  title: "Delete your Bloviate account · Shippopotamus Labs",
  page: <DeleteAccount />,
};

const ROUTES: Record<string, Route> = {
  "/": { title: "Shippopotamus Labs", page: <Home /> },
  "/requests": { title: "Requests · Shippopotamus Labs", page: <Requests /> },
  "/contact": { title: "Contact · Shippopotamus Labs", page: <Contact /> },
  "/privacy": {
    title: "Privacy policies · Shippopotamus Labs",
    page: <PrivacyHub />,
  },
  "/terms": {
    title: "Terms of service · Shippopotamus Labs",
    page: <TermsHub />,
  },
  "/bloviate/privacy": {
    title: "Bloviate Privacy Policy · Shippopotamus Labs",
    page: <PrivacyPolicy />,
  },
  "/bloviate/terms": {
    title: "Bloviate Terms of Service · Shippopotamus Labs",
    page: <TermsOfService />,
  },
  "/bloviate/delete-account": deleteAccountRoute,
  "/delete-account": deleteAccountRoute,
  "/stratum/privacy": {
    title: "Stratum Privacy Policy · Shippopotamus Labs",
    page: <StratumPrivacy />,
  },
  "/stratum/terms": {
    title: "Stratum Terms of Use · Shippopotamus Labs",
    page: <StratumTerms />,
  },
  "/stratum/delete-account": {
    title: "Delete your Stratum account · Shippopotamus Labs",
    page: <StratumDeleteAccount />,
  },
  "/stratum/licenses": {
    title: "Open-source licenses — Stratum · Shippopotamus Labs",
    page: <StratumLicenses />,
  },
};

export default function App() {
  const path = usePathname();

  const route = ROUTES[path];
  const app = route ? undefined : appBySlug(path.slice(1));
  const title =
    route?.title ?? (app ? `${app.name} · Shippopotamus Labs` : "Shippopotamus Labs");

  useEffect(() => {
    document.title = title;
    window.scrollTo(0, 0);
  }, [path, title]);

  let page: ReactNode;
  if (route) {
    page = route.page;
  } else if (app) {
    page = <AppPage app={app} />;
  } else {
    page = (
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
