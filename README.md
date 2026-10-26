# Shippopotamus Labs: shippopotamuslabs.com

The website for Shippopotamus Labs, an independent Android studio. One site
for the three apps, Stratum (workout tracker), Bloviate (dictation with style
rewrites), and Enclave (privacy-first on-device AI assistant). People find each
app here, get in touch, and file feature requests and bug reports that are
public by default.

A React frontend on Cloudflare Pages in front of a small Go API on Cloud Run.

```
shippopotamus-labs-site/
  web/   React 19 + TypeScript + Vite (Cloudflare Pages)
  api/   Go, standard library only (Cloud Run)
```

## Pages

| Path | What it is |
|------|------------|
| `/` | Studio home: intro, one section per app with its current status, follow-along (Reddit) |
| `/stratum` `/bloviate` `/enclave` | Per-app pages: description, features, screenshots where real ones exist, status, links, and a door into that app's requests |
| `/requests` | Public feature requests and bug reports (from Linear, via the API) plus the submission form |
| `/contact` | Email, Reddit, and a pointer to Requests |

Routing is client-side with clean URLs. `web/public/_redirects`
(`/* /index.html 200`) is the Cloudflare Pages SPA fallback. The site runs no
tracking, no analytics, and no cookies. The only data it collects is what
someone types into the requests form.

## How public requests work (the Linear label scheme)

Requests live in Linear. The Go API is a filtered public window onto them, and
labels are the whole mechanism:

| Label | Meaning |
|-------|---------|
| `public` | The visibility switch. An issue appears on the site only while it carries this label. |
| `feature-request` / `bug-report` | The type shown on the site. |
| `app:stratum` / `app:bloviate` / `app:enclave` | Which app the issue belongs to. |
| `website` | Source marker, applied to everything submitted through the site form. |

Rules the API enforces:

- The public list returns only issues that carry the `public` label, an app
  label, and a type label, newest first, max 100.
- It exposes only the issue number (e.g. `STR-123`), title, app, type,
  workflow state name, and creation date. Descriptions, comments, assignees,
  and internal URLs stay in Linear.
- Website submissions are born public: the form creates the issue with all
  four labels already attached.
- To hide anything, remove its `public` label in Linear. It disappears from
  the site on the next page load. To feature an existing backlog issue
  publicly, add `public` plus its app and type labels.

Label names are resolved to IDs by the API at startup and retried on demand.
Renames in Linear are picked up on restart.

## API

| Endpoint | Takes | Returns |
| --- | --- | --- |
| `GET /healthz` |  | `200 {"ok":true}` (also `/health`; Google intercepts `/healthz` on run.app) |
| `GET /api/requests?app=<stratum\|bloviate\|enclave>&type=<feature\|bug>` | Query filters | The public request list |
| `POST /api/requests` | `{app, type, title, description, email?, honeypot}` | `201` with the new issue id; behavior details below |

- POST validates: app and type in the allowed sets, title 3 to 120 chars,
  details 10 to 4000 chars, email optional but must parse. A filled honeypot
  field returns `202` and creates nothing (spam trap). Submissions are
  rate-limited to 5 per hour per IP, in memory. A daily cap also applies;
  hitting it returns `429` and points the sender at the support email.
- A successful POST creates the Linear issue (single team, `LINEAR_TEAM_ID`)
  and returns `201 {"id": "STR-123"}`. The issue description is the submitted
  details plus a `Submitted via shippopotamuslabs.com` footer, with the
  contact email appended when one was provided.
- Unconfigured behavior (no `LINEAR_API_KEY` or `LINEAR_TEAM_ID`): GET
  returns `200 []` with header `X-Requests-Configured: false`; POST returns
  `503 {"error":"requests are not configured yet"}`. The frontend turns both
  into a "requests are opening soon" message.
- CORS allows `https://shippopotamuslabs.com`,
  `https://www.shippopotamuslabs.com`, and `http://localhost:5173`.

Linear notes: the API talks GraphQL (`https://api.linear.app/graphql`).
Personal API keys go in the raw `Authorization: <key>` header, with no
`Bearer` prefix.

## Local development

```bash
# API (runs fine unconfigured)
cd api && go run .            # http://localhost:8080

# Web
cd web && npm install && npm run dev   # http://localhost:5173
```

The web app reads the API base from `VITE_API_BASE_URL` (see
`web/.env.example`). Unset, it defaults to `http://localhost:8080`. To use
the real Linear flow locally, export a key and team id before `go run .`:

```bash
LINEAR_API_KEY=lin_api_... LINEAR_TEAM_ID=<team-uuid> go run .
```

## Deploy checklist

One manual prerequisite first, in Linear, once:

1. Create the labels: `public`, `website`, `feature-request`, `bug-report`,
   `app:stratum`, `app:bloviate`, `app:enclave`.
2. Create a Linear API key (Settings, API, Personal API keys).
3. Note the team ID for the team website submissions should land in.

API to Cloud Run:

```bash
cd api
gcloud run deploy shippopotamus-api \
  --source . --region us-east1 \
  --set-env-vars LINEAR_API_KEY=lin_api_...,LINEAR_TEAM_ID=<team-uuid>
```

Web to Cloudflare Pages (GitHub Actions):

- `.github/workflows/deploy-pages.yml` deploys on every push to `main`
  (path-gated to `web/**`) and can be run manually from the Actions tab.
- The workflow builds `web/` (`npm ci`, `npm run build`, output `web/dist`)
  and uploads the result to the `shippopotamus-labs` Pages project with
  Wrangler.
- Repo secrets: `CLOUDFLARE_API_TOKEN` (Account, Cloudflare Pages, Edit)
  and `CLOUDFLARE_ACCOUNT_ID`. The build reads `VITE_API_BASE_URL` from the
  repo variable of the same name, falling back to the current Cloud Run URL,
  so the shipped bundle calls the real API.
- The `shippopotamuslabs.com` DNS points at the Pages project. Automatic
  deployments stay off in the Pages project settings; GitHub is the only
  deploy path.

## App status copy

The status text on the site is plain and current. Stratum and Bloviate are
pre-launch: no Play listing exists yet, and the pages say the listing arrives
with the public launch rather than linking anywhere dead. Enclave's public
repository is a stated plan, not a link. Update `web/src/data/apps.ts` when
any of that changes. It is the single source of the site's copy.

## License

0BSD license. Do whatever you want with the code. Just don't expect it to work or sue me.
