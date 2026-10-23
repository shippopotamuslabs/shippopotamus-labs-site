// API client for the Shippopotamus Labs API (Go service in /api).
// The base URL is baked in at build time via VITE_API_BASE_URL; the
// default is the local dev server.

export const API_BASE: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type AppSlug = "stratum" | "bloviate" | "enclave";
export type RequestType = "feature" | "bug";

export interface PublicRequest {
  id: string; // public issue number, e.g. "STR-123"
  title: string;
  app: AppSlug;
  type: RequestType;
  state: string; // workflow state name, e.g. "In Progress"
  createdAt: string; // ISO 8601
}

export interface FetchRequestsResult {
  configured: boolean;
  items: PublicRequest[];
}

// fetchRequests resolves to null when the API cannot be reached at
// all; the page treats that the same as "not configured yet".
export async function fetchRequests(
  app?: string,
  type?: string,
): Promise<FetchRequestsResult | null> {
  const params = new URLSearchParams();
  if (app) params.set("app", app);
  if (type) params.set("type", type);
  const qs = params.toString();
  try {
    const resp = await fetch(`${API_BASE}/api/requests${qs ? `?${qs}` : ""}`);
    if (!resp.ok) return null;
    const configured = resp.headers.get("X-Requests-Configured") !== "false";
    const items = (await resp.json()) as PublicRequest[];
    return { configured, items: Array.isArray(items) ? items : [] };
  } catch {
    return null;
  }
}

export interface SubmitResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function submitRequest(body: {
  app: string;
  type: string;
  title: string;
  description: string;
  email?: string;
  honeypot?: string;
}): Promise<SubmitResult> {
  try {
    const resp = await fetch(`${API_BASE}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await resp.json().catch(() => ({}))) as {
      id?: string;
      error?: string;
    };
    if (resp.ok) return { ok: true, id: data.id };
    return { ok: false, error: data.error ?? "Something went wrong." };
  } catch {
    return {
      ok: false,
      error: "Could not reach the requests service. Please try again later, or email us instead.",
    };
  }
}
