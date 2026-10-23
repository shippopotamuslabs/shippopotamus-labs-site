// Minimal history router: clean URLs, no dependency. The Cloudflare
// Pages _redirects fallback serves index.html for every path, and
// this hook keeps React in sync with the address bar.
import { useSyncExternalStore, type MouseEvent, type ReactNode } from "react";

const NAV_EVENT = "shippopotamus:navigate";

function subscribe(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(NAV_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(NAV_EVENT, cb);
  };
}

export function usePathname(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => "/",
  );
}

export function navigate(to: string) {
  window.history.pushState(null, "", to);
  window.dispatchEvent(new Event(NAV_EVENT));
}

export function Link({
  to,
  className,
  children,
  onNavigate,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    navigate(to);
    onNavigate?.();
  };
  return (
    <a href={to} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
