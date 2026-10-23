import { useEffect } from "react";
import { SUPPORT_EMAIL, appBySlug } from "./data/apps";
import { Link, usePathname } from "./lib/router";
import AppPage from "./pages/AppPage";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Requests from "./pages/Requests";

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
  "/stratum": "Stratum — Shippopotamus Labs",
  "/bloviate": "Bloviate — Shippopotamus Labs",
  "/enclave": "Enclave — Shippopotamus Labs",
  "/requests": "Requests — Shippopotamus Labs",
  "/contact": "Contact — Shippopotamus Labs",
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
        </div>
      </footer>
    </>
  );
}
