// shippopotamus-labs-api: the API behind shippopotamuslabs.com.
//
// Its one job is the public Requests page. Feature requests and bug
// reports live in Linear; this service is the public window onto
// them, governed by labels:
//
//   - An issue is publicly visible ONLY while it carries the "public"
//     label. Removing the label hides it from the site immediately.
//   - Type is a label: "feature-request" or "bug-report".
//   - App is a label: "app:stratum", "app:bloviate", "app:enclave".
//   - Issues submitted from the website are born with "public", the
//     type and app labels, and a "website" source label.
//
// The public list exposes only an issue's number, title, app, type,
// workflow state, and date — never descriptions, comments, assignees,
// or internal URLs.
//
// Configuration is entirely from the environment: LINEAR_API_KEY,
// LINEAR_TEAM_ID, PORT (default 8080). Without the Linear settings
// the service still runs: the list endpoint returns an empty array
// with an X-Requests-Configured: false header, and submissions get a
// calm 503, so the site can say "requests are opening soon".
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/mail"
	"os"
	"sort"
	"strings"
	"sync"
	"time"
)

const serviceName = "shippopotamus-labs-api"
const linearEndpoint = "https://api.linear.app/graphql"

// ---------- configuration ----------

type config struct {
	linearAPIKey string
	linearTeamID string
	port         string
}

func loadConfig() config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return config{
		linearAPIKey: os.Getenv("LINEAR_API_KEY"),
		linearTeamID: os.Getenv("LINEAR_TEAM_ID"),
		port:         port,
	}
}

// configured reports whether the Linear integration can run. Both
// the key and the team are required: submissions need a team, and
// there is nothing public to read without the key.
func (c config) configured() bool {
	return c.linearAPIKey != "" && c.linearTeamID != ""
}

// ---------- label scheme ----------

const (
	labelPublic  = "public"
	labelWebsite = "website"
)

var typeToLabel = map[string]string{
	"feature": "feature-request",
	"bug":     "bug-report",
}

var labelToType = map[string]string{
	"feature-request": "feature",
	"bug-report":      "bug",
}

var appToLabel = map[string]string{
	"stratum":  "app:stratum",
	"bloviate": "app:bloviate",
	"enclave":  "app:enclave",
}

func neededLabels() []string {
	names := []string{labelPublic, labelWebsite, "feature-request", "bug-report"}
	for _, l := range appToLabel {
		names = append(names, l)
	}
	return names
}

// labelCache resolves label names to Linear IDs once and caches them.
// IDs are what issueCreate wants; reads filter by name instead.
type labelCache struct {
	mu  sync.Mutex
	ids map[string]string
}

func (lc *labelCache) resolve(ctx context.Context, client *linearClient) error {
	const query = `query { issueLabels(first: 250) { nodes { id name } } }`
	var data struct {
		IssueLabels struct {
			Nodes []struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			} `json:"nodes"`
		} `json:"issueLabels"`
	}
	if err := client.graphQL(ctx, query, nil, &data); err != nil {
		return err
	}
	found := map[string]string{}
	for _, n := range data.IssueLabels.Nodes {
		found[n.Name] = n.ID
	}
	lc.mu.Lock()
	lc.ids = found
	lc.mu.Unlock()
	var missing []string
	for _, name := range neededLabels() {
		if _, ok := found[name]; !ok {
			missing = append(missing, name)
		}
	}
	if len(missing) > 0 {
		slog.Warn("some Linear labels do not exist yet", "missing", missing)
	}
	return nil
}

// idsFor returns the cached IDs for the given label names. If any is
// missing it attempts one fresh resolution; ok is false when any
// requested label still has no ID.
func (lc *labelCache) idsFor(ctx context.Context, client *linearClient, names ...string) (ids []string, ok bool) {
	get := func() ([]string, bool) {
		lc.mu.Lock()
		defer lc.mu.Unlock()
		out := make([]string, 0, len(names))
		for _, name := range names {
			id, has := lc.ids[name]
			if !has {
				return nil, false
			}
			out = append(out, id)
		}
		return out, true
	}
	if ids, ok := get(); ok {
		return ids, true
	}
	if err := lc.resolve(ctx, client); err != nil {
		slog.Error("label resolution failed", "err", err)
		return nil, false
	}
	return get()
}

// ---------- Linear client ----------

type linearClient struct {
	apiKey string
	http   *http.Client
}

func newLinearClient(apiKey string) *linearClient {
	return &linearClient{
		apiKey: apiKey,
		http:   &http.Client{Timeout: 15 * time.Second},
	}
}

type graphqlResponse struct {
	Data   json.RawMessage `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

// graphQL runs one GraphQL operation. Linear personal API keys are
// sent as the raw Authorization header value — no "Bearer" prefix.
func (lc *linearClient) graphQL(ctx context.Context, query string, variables map[string]any, out any) error {
	body, err := json.Marshal(map[string]any{"query": query, "variables": variables})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, linearEndpoint, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", lc.apiKey)
	resp, err := lc.http.Do(req)
	if err != nil {
		return fmt.Errorf("linear request: %w", err)
	}
	defer resp.Body.Close()
	raw, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return err
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("linear status %d: %s", resp.StatusCode, strings.TrimSpace(string(raw)))
	}
	var gr graphqlResponse
	if err := json.Unmarshal(raw, &gr); err != nil {
		return fmt.Errorf("linear decode: %w", err)
	}
	if len(gr.Errors) > 0 {
		return fmt.Errorf("linear error: %s", gr.Errors[0].Message)
	}
	if out != nil {
		if err := json.Unmarshal(gr.Data, out); err != nil {
			return fmt.Errorf("linear data decode: %w", err)
		}
	}
	return nil
}

// ---------- helpers ----------

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// ---------- CORS ----------

// The frontend is served from the apex domain (and www) and calls
// this API cross-origin; the Vite dev server is allowed for local
// development.
var corsOrigins = map[string]bool{
	"https://shippopotamuslabs.com":     true,
	"https://www.shippopotamuslabs.com": true,
	"http://localhost:5173":             true, // Vite dev
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if corsOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Access-Control-Expose-Headers", "X-Requests-Configured")
			w.Header().Set("Access-Control-Max-Age", "86400")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ---------- rate limit (submissions) ----------

// A modest per-IP sliding window keeps the public form from being
// useful as a spam cannon. In-memory and per-instance: a speed bump,
// not a security boundary.
type rateLimiter struct {
	mu     sync.Mutex
	bucket map[string][]time.Time
	limit  int
	window time.Duration
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{bucket: map[string][]time.Time{}, limit: limit, window: window}
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	now := time.Now()
	cutoff := now.Add(-rl.window)
	kept := rl.bucket[ip][:0]
	for _, t := range rl.bucket[ip] {
		if t.After(cutoff) {
			kept = append(kept, t)
		}
	}
	if len(kept) >= rl.limit {
		rl.bucket[ip] = kept
		return false
	}
	rl.bucket[ip] = append(kept, now)
	return true
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if ip, _, _ := strings.Cut(xff, ","); ip != "" {
			return strings.TrimSpace(ip)
		}
	}
	return r.RemoteAddr
}

// ---------- requests handlers ----------

type server struct {
	cfg    config
	linear *linearClient // nil when unconfigured
	labels *labelCache
	submit *rateLimiter
}

type publicRequest struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	App       string `json:"app"`
	Type      string `json:"type"`
	State     string `json:"state"`
	CreatedAt string `json:"createdAt"`
}

type linearIssue struct {
	Identifier string `json:"identifier"`
	Title      string `json:"title"`
	CreatedAt  string `json:"createdAt"`
	State      struct {
		Name string `json:"name"`
	} `json:"state"`
	Labels struct {
		Nodes []struct {
			Name string `json:"name"`
		} `json:"nodes"`
	} `json:"labels"`
}

// labelFilter builds a Linear IssueFilter clause requiring one label
// by name: labels.some.name.eq.
func labelFilter(name string) map[string]any {
	return map[string]any{
		"labels": map[string]any{
			"some": map[string]any{
				"name": map[string]any{"eq": name},
			},
		},
	}
}

func (s *server) handleListRequests(w http.ResponseWriter, r *http.Request) {
	if !s.cfg.configured() {
		w.Header().Set("X-Requests-Configured", "false")
		writeJSON(w, http.StatusOK, []publicRequest{})
		return
	}
	w.Header().Set("X-Requests-Configured", "true")

	q := r.URL.Query()
	app := q.Get("app")
	typ := q.Get("type")
	if app != "" {
		if _, ok := appToLabel[app]; !ok {
			writeErr(w, http.StatusBadRequest, "unknown app")
			return
		}
	}
	if typ != "" {
		if _, ok := typeToLabel[typ]; !ok {
			writeErr(w, http.StatusBadRequest, "unknown type")
			return
		}
	}

	conds := []any{labelFilter(labelPublic)}
	if app != "" {
		conds = append(conds, labelFilter(appToLabel[app]))
	}
	if typ != "" {
		conds = append(conds, labelFilter(typeToLabel[typ]))
	}
	var filter any = conds[0]
	if len(conds) > 1 {
		filter = map[string]any{"and": conds}
	}

	const query = `query ListIssues($filter: IssueFilter) {
		issues(filter: $filter, first: 100) {
			nodes {
				identifier
				title
				createdAt
				state { name }
				labels { nodes { name } }
			}
		}
	}`
	var data struct {
		Issues struct {
			Nodes []linearIssue `json:"nodes"`
		} `json:"issues"`
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	if err := s.linear.graphQL(ctx, query, map[string]any{"filter": filter}, &data); err != nil {
		slog.Error("linear list failed", "err", err)
		writeErr(w, http.StatusBadGateway, "could not load requests right now")
		return
	}

	out := make([]publicRequest, 0, len(data.Issues.Nodes))
	for _, iss := range data.Issues.Nodes {
		var appSlug, reqType string
		for _, l := range iss.Labels.Nodes {
			if strings.HasPrefix(l.Name, "app:") {
				appSlug = strings.TrimPrefix(l.Name, "app:")
			}
			if t, ok := labelToType[l.Name]; ok {
				reqType = t
			}
		}
		// A public issue without its app and type labels cannot be
		// presented honestly in the list; leave it out. (Submissions
		// from this site are always fully labeled.)
		if appSlug == "" || reqType == "" {
			continue
		}
		out = append(out, publicRequest{
			ID:        iss.Identifier,
			Title:     iss.Title,
			App:       appSlug,
			Type:      reqType,
			State:     iss.State.Name,
			CreatedAt: iss.CreatedAt,
		})
	}
	// Newest first, regardless of the order Linear returned.
	sort.Slice(out, func(i, j int) bool { return out[i].CreatedAt > out[j].CreatedAt })
	if len(out) > 100 {
		out = out[:100]
	}
	writeJSON(w, http.StatusOK, out)
}

type submitBody struct {
	App         string `json:"app"`
	Type        string `json:"type"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Email       string `json:"email"`
	Honeypot    string `json:"honeypot"`
}

func runeLen(s string) int { return len([]rune(s)) }

func (s *server) handleSubmitRequest(w http.ResponseWriter, r *http.Request) {
	if !s.cfg.configured() {
		writeErr(w, http.StatusServiceUnavailable, "requests are not configured yet")
		return
	}
	var body submitBody
	if err := json.NewDecoder(io.LimitReader(r.Body, 64<<10)).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "request body must be JSON")
		return
	}
	// Honeypot: a field humans never see or fill. Anything in it is a
	// bot; accept the submission silently and create nothing.
	if strings.TrimSpace(body.Honeypot) != "" {
		writeJSON(w, http.StatusAccepted, map[string]any{"ok": true})
		return
	}
	if !s.submit.allow(clientIP(r)) {
		writeErr(w, http.StatusTooManyRequests, "too many submissions; try again in a while")
		return
	}

	body.Title = strings.TrimSpace(body.Title)
	body.Description = strings.TrimSpace(body.Description)
	body.Email = strings.TrimSpace(body.Email)
	if _, ok := appToLabel[body.App]; !ok {
		writeErr(w, http.StatusBadRequest, "app must be stratum, bloviate, or enclave")
		return
	}
	if _, ok := typeToLabel[body.Type]; !ok {
		writeErr(w, http.StatusBadRequest, "type must be feature or bug")
		return
	}
	if n := runeLen(body.Title); n < 3 || n > 120 {
		writeErr(w, http.StatusBadRequest, "title must be 3-120 characters")
		return
	}
	if n := runeLen(body.Description); n < 10 || n > 4000 {
		writeErr(w, http.StatusBadRequest, "details must be 10-4000 characters")
		return
	}
	if body.Email != "" {
		if _, err := mail.ParseAddress(body.Email); err != nil {
			writeErr(w, http.StatusBadRequest, "email does not look valid")
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	labelIDs, ok := s.labels.idsFor(ctx, s.linear,
		labelPublic, typeToLabel[body.Type], appToLabel[body.App], labelWebsite)
	if !ok {
		slog.Error("submission labels unavailable")
		writeErr(w, http.StatusInternalServerError, "could not file the request right now")
		return
	}

	description := body.Description + "\n\n---\nSubmitted via shippopotamuslabs.com"
	if body.Email != "" {
		description += "\nContact: " + body.Email
	}

	const mutation = `mutation CreateIssue($input: IssueCreateInput!) {
		issueCreate(input: $input) {
			success
			issue { identifier }
		}
	}`
	input := map[string]any{
		"teamId":      s.cfg.linearTeamID,
		"title":       body.Title,
		"description": description,
		"labelIds":    labelIDs,
	}
	var data struct {
		IssueCreate struct {
			Success bool `json:"success"`
			Issue   struct {
				Identifier string `json:"identifier"`
			} `json:"issue"`
		} `json:"issueCreate"`
	}
	if err := s.linear.graphQL(ctx, mutation, map[string]any{"input": input}, &data); err != nil {
		slog.Error("linear create failed", "err", err)
		writeErr(w, http.StatusBadGateway, "could not file the request right now")
		return
	}
	if !data.IssueCreate.Success {
		slog.Error("linear create reported failure")
		writeErr(w, http.StatusBadGateway, "could not file the request right now")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": data.IssueCreate.Issue.Identifier})
}

// ---------- misc handlers ----------

func handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		writeErr(w, http.StatusNotFound, "no such route")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"service":   serviceName,
		"endpoints": []string{"GET /healthz", "GET /api/requests", "POST /api/requests"},
	})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ---------- main ----------

func main() {
	cfg := loadConfig()
	s := &server{
		cfg:    cfg,
		labels: &labelCache{},
		submit: newRateLimiter(5, time.Hour),
	}
	if cfg.configured() {
		s.linear = newLinearClient(cfg.linearAPIKey)
		// Resolve label IDs up front; failures are logged, and the
		// handlers retry resolution on demand.
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
			defer cancel()
			if err := s.labels.resolve(ctx, s.linear); err != nil {
				slog.Error("startup label resolution failed", "err", err)
			} else {
				slog.Info("linear labels resolved")
			}
		}()
	} else {
		slog.Warn("LINEAR_API_KEY or LINEAR_TEAM_ID unset: requests endpoints run unconfigured")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", handleRoot)
	// Both spellings: /healthz is conventional, but Google's frontend
	// intercepts /healthz on *.run.app domains and returns its own
	// 404 before the request reaches the container. /health is the
	// path that works there.
	mux.HandleFunc("GET /healthz", handleHealth)
	mux.HandleFunc("GET /health", handleHealth)
	mux.HandleFunc("GET /api/requests", s.handleListRequests)
	mux.HandleFunc("POST /api/requests", s.handleSubmitRequest)

	addr := ":" + cfg.port
	slog.Info("listening", "service", serviceName, "addr", addr)
	if err := http.ListenAndServe(addr, cors(mux)); err != nil {
		slog.Error("server exited", "err", err)
		os.Exit(1)
	}
}
