# Shippopotamus Labs — shippopotamuslabs.com

The home base for Shippopotamus Labs, an independent Android studio.
One site for the three apps — **Stratum** (workout tracker),
**Bloviate** (dictation, styled), and **Enclave** (privacy-first
on-device AI assistant) — where people can find each app, get in
touch, and file feature requests and bug reports that are public by
default.

A React frontend on Cloudflare Pages in front of a small Go API on Cloud Run.

```
shippopotamus-labs-site/
  web/   React 19 + TypeScript + Vite (Cloudflare Pages)
  api/   Go, standard library only (Cloud Run)
```

## Pages

| Path        | What it is |
|-------------|------------|
| `/`         | Studio home: intro, one section per app with its current status, follow-along (Reddit) |
| `/stratum` `/bloviate` `/enclave` | Per-app pages: description, features, screenshots (where real ones exist), status, links, and a door into that app's requests |
| `/requests` | Public feature requests & bug reports (from Linear, via the API) plus the submission form |
| `/contact`  | Email, Reddit, and a pointer to Requests |

Routing is client-side with clean URLs; `web/public/_redirects`
(`/* /index.html 200`) is the Cloudflare Pages SPA fallback.
No tracking, no analytics, no cookies — the only data the site
collects is what someone types into the requests form.

## How public requests work (the Linear label scheme)

Requests live in Linear. The Go API is a filtered public window
onto them, and **labels are the whole mechanism**:

| Label | Meaning |
|-------|---------|
| `public` | The visibility switch. An issue appears on the site **only while it carries this label**. |
| `feature-request` / `bug-report` | The type shown on the site. |
| `app:stratum` / `app:bloviate` / `app:enclave` | Which app the issue belongs to. |
| `website` | Source marker, applied to everything submitted through the site form. |

Rules the API enforces:

- The public list returns only issues that have the `public` label
  **and** an app label **and** a type label, newest first, max 100.
- It exposes only the issue number (e.g. `STR-123`), title, app,
  type, workflow state name, and creation date. Descriptions,
  comments, assignees, and internal URLs never leave Linear.
- Website submissions are **born public**: the form creates the
  issue with all four labels already attached.
- **To hide anything, remove its `public` label in Linear.** It
  disappears from the site on the next page load. To feature an
  existing backlog issue publicly, add `public` plus its app and
  type labels.

Label names are resolved to IDs by the API at startup (and retried
on demand); renames in Linear are picked up on restart.

## API

```
GET  /healthz                  -> 200 {"ok":true}   (also /health; Google intercepts /healthz on run.app)
GET  /api/requests?app=<stratum|bloviate|enclave>&type=<feature|bug>
POST /api/requests             {app, type, title, description, email?, honeypot}
```

- POST validates: app/type in the allowed sets, title 3–120 chars,
  details 10–4000 chars, email optional but must parse. A filled
  honeypot field returns `202` and creates nothing (spam trap).
  Submissions are rate-limited to 5/hour per IP, in memory.
- A successful POST creates the Linear issue (single team,
  `LINEAR_TEAM_ID`) and returns `201 {"id": "STR-123"}`. The issue
  description is the submitted details plus a
  `Submitted via shippopotamuslabs.com` footer, with the contact
  email appended when one was provided.
- **Unconfigured behavior** (no `LINEAR_API_KEY` or
  `LINEAR_TEAM_ID`): GET returns `200 []` with header
  `X-Requests-Configured: false`; POST returns
  `503 {"error":"requests are not configured yet"}`. The frontend
  turns both into a calm "requests are opening soon" message.
- CORS allows `https://shippopotamuslabs.com`,
  `https://www.shippopotamuslabs.com`, and `http://localhost:5173`.

Linear notes: the API talks GraphQL (`https://api.linear.app/graphql`).
Personal API keys are sent as the raw `Authorization: <key>` header —
no `Bearer` prefix.

## Local development

```bash
# API (runs fine unconfigured)
cd api && go run .            # http://localhost:8080

# Web
cd web && npm install && npm run dev   # http://localhost:5173
```

The web app reads the API base from `VITE_API_BASE_URL`
(see `web/.env.example`); unset, it defaults to
`http://localhost:8080`. To exercise the real Linear flow locally,
export a key and team id before `go run .`:

```bash
LINEAR_API_KEY=lin_api_... LINEAR_TEAM_ID=<team-uuid> go run .
```

## Deploy checklist

**One manual prerequisite first** (in Linear, once):

1. Create the labels: `public`, `website`, `feature-request`,
   `bug-report`, `app:stratum`, `app:bloviate`, `app:enclave`.
2. Create a Linear API key (Settings → API → Personal API keys).
3. Note the team ID for the team website submissions should land in.

**API → Cloud Run**:

```bash
cd api
gcloud run deploy shippopotamus-api \
  --source . --region us-east1 \
  --set-env-vars LINEAR_API_KEY=lin_api_...,LINEAR_TEAM_ID=<team-uuid>
```

**Web → Cloudflare Pages** (git-connected):

- Build command: `cd web && npm run build`, output dir `web/dist`.
- Set the build-time environment variable
  `VITE_API_BASE_URL=https://<the Cloud Run URL>` in the Pages
  project so the shipped bundle calls the real API.
- Point the `shippopotamuslabs.com` DNS at the Pages project.

## App status copy

The status text on the site is deliberately plain and current:
Stratum and Bloviate are pre-launch (no Play listing exists yet, and
the pages say the listing "arrives with the public launch" rather
than linking anywhere dead). Enclave's public repository is a stated
plan, not a link. Update `web/src/data/apps.ts` when any of that
changes — it is the single source of the site's copy.
