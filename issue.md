# Stellumio — Issue Tracker

> Canonical list of open engineering issues. Each entry links to a wave in
> [`docs/ROADMAP.md`](docs/ROADMAP.md). Issues are grouped by wave and module.
> Status: `[ ]` open · `[-]` in progress · `[x]` closed.

---

## Wave 1.0 — Core Executable (`#001–#070`)

### A. Credibility & data integrity

- [ ] `#004` Remove `isMock` field from `AnchorRate` — fail closed on unknown source
  - **Module:** `types/`, `lib/stellar/`
  - **Difficulty:** good-first-issue
  - **Acceptance:** No `isMock` field in types or runtime; build passes.

- [ ] `#007` Amount field rejects negatives, zero, and non-numeric strings
  - **Module:** `components/ui/AmountInput.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Entering `-1`, `abc`, or `0` shows inline error; valid positive decimals pass.

- [ ] `#009` Refresh button resets stale state before re-fetching
  - **Module:** `hooks/useAnchorRates.ts`, `components/offramp/RateTable.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Clicking refresh clears old rows immediately, shows skeleton, then populates fresh data.

- [ ] `#011` Add `discoverAnchorsForCorridor(corridorId)` with parallel SEP-1 resolution
  - **Module:** `lib/stellar/sep1.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Returns resolved TOML for all anchors on a corridor in parallel; rejects anchors with missing `TRANSFER_SERVER_SEP0024`.

- [ ] `#012` Broader corridor coverage — add XOF (Senegal/Côte d'Ivoire)
  - **Module:** `constants/anchors.ts`
  - **Difficulty:** good-first-issue
  - **Acceptance:** XOF corridor appears in corridor selector; at least one anchor registered.

- [ ] `#013` Broader corridor coverage — add ZAR (South Africa)
  - **Module:** `constants/anchors.ts`
  - **Difficulty:** good-first-issue
  - **Acceptance:** ZAR corridor appears in corridor selector; at least one anchor registered.

### B. SEP-10 authentication hardening

- [ ] `#020` Challenge expiry + re-auth loop in `ExecuteDrawer`
  - **Module:** `lib/stellar/sep10.ts`, `components/offramp/ExecuteDrawer.tsx`
  - **Difficulty:** intermediate
  - **Acceptance:** If JWT is expired when drawer opens, silently re-authenticates before proceeding.

- [ ] `#021` JWT refresh before `iat + ttl` boundary
  - **Module:** `lib/stellar/sep10.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** JWT is refreshed ≥30s before expiry; no 401 mid-flow.

- [ ] `#022` Network mismatch (testnet/standalone) bailout card
  - **Module:** `components/offramp/`, `hooks/useFreighter.ts`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Connecting a testnet wallet shows a clear error card; mainnet connection proceeds normally.

- [ ] `#023` Account switch → wipe per-anchor JWTs
  - **Module:** `contexts/WalletContext.tsx`, `lib/stellar/sep10.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Switching Freighter account clears all cached JWTs; next action re-authenticates.

### C. SEP-24 withdraw flow

- [ ] `#030` Refund / terminal-error visual differentiation in `StatusTracker`
  - **Module:** `components/offramp/StatusTracker.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** `refunded` shows yellow banner with refund amount; `error` shows red banner with support link.

- [ ] `#031` `no_market` / `too_small` / `too_large` UX in rate table and drawer
  - **Module:** `components/offramp/RateTable.tsx`, `components/offramp/ExecuteDrawer.tsx`
  - **Difficulty:** intermediate
  - **Acceptance:** Each status shows a distinct message with actionable guidance (e.g. "Try a larger amount").

- [ ] `#032` Exponential backoff on consecutive `/transaction` 5xx responses
  - **Module:** `hooks/useWithdrawStatus.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** After 3 consecutive 5xx, polling interval doubles up to 60s; resets on success.

- [ ] `#033` Stellar Expert link on `completed` status
  - **Module:** `components/offramp/StatusTracker.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** When `stellar_transaction_id` is a valid 64-char hex, render a link to `{STELLAR_EXPERT_URL}/tx/{id}`.

### D. UI & accessibility

- [ ] `#040` Skeleton loader on rate table while SWR loads
  - **Module:** `components/offramp/RateTable.tsx`, `components/ui/Skeleton.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** While `isLoading` is true, show skeleton rows matching the table column layout.

- [ ] `#041` Keyboard focus ring on all interactive rate table rows
  - **Module:** `components/offramp/RateTable.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Tab navigation reaches every "Off-ramp" button; focus ring is visible at 3:1 contrast ratio.

- [ ] `#042` Empty-state copy and illustration for unsupported corridor
  - **Module:** `components/offramp/RateTable.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** When no anchors support the selected corridor, show a helpful empty state instead of a blank table.

- [ ] `#043` Responsive layout audit at 320 / 768 / 1024 / 1440px
  - **Module:** `components/offramp/`, `app/offramp/page.tsx`
  - **Difficulty:** intermediate
  - **Acceptance:** No horizontal scroll or overlapping elements at any of the four breakpoints.

- [ ] `#044` Favicon and app icon final assets (16/32/180/192/512)
  - **Module:** `public/`
  - **Difficulty:** good-first-issue
  - **Acceptance:** All icon sizes present; `<head>` links updated in `app/layout.tsx`.

- [ ] `#045` Dark mode polish pass — verify all text meets 4.5:1 contrast
  - **Module:** `app/globals.css`, `components/`
  - **Difficulty:** intermediate
  - **Acceptance:** Lighthouse accessibility score ≥ 90 in dark mode.

### E. Core tests

- [ ] `#050` Playwright happy-path smoke test — USDC→NGN via mock anchor
  - **Module:** `tests/e2e/`
  - **Difficulty:** hard
  - **Acceptance:** Test runs in CI; completes the full off-ramp flow against the MSW mock server.

- [ ] `#051` SEP-10 challenge validator unit tests
  - **Module:** `tests/sep10.spec.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Tests cover: valid challenge passes; wrong network passphrase throws; malformed XDR throws.

- [ ] `#052` SEP-24 fetcher timeout regression test
  - **Module:** `tests/sep24.spec.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Mocked anchor that never responds triggers timeout error after 10s.

- [ ] `#053` `AmountInput` unit tests — validation edge cases
  - **Module:** `tests/AmountInput.spec.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Tests cover: negative input, zero, non-numeric, valid decimal, suggested chip click.

- [ ] `#054` `formatCurrency` and `formatRate` helper tests
  - **Module:** `tests/utils.spec.ts`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Tests cover: all supported currencies, zero, large numbers, null input.

---

## Wave 1.1 — Hardening + SEP-38 (`#071–#110`)

### F. SEP-38 integration

- [ ] `#071` Wire `getSep38Info` into anchor registry discovery
  - **Module:** `lib/stellar/sep38.ts`, `lib/stellar/anchors.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Anchors that support SEP-38 are flagged in the registry; anchors without it gracefully downgrade to `/fee`.

- [ ] `#072` `postSep38Quote` called in `ExecuteDrawer` before initiating SEP-24
  - **Module:** `components/offramp/ExecuteDrawer.tsx`
  - **Difficulty:** intermediate
  - **Acceptance:** The firm `quote_id` from SEP-38 is passed as `quote_id` to `/transactions/withdraw/interactive`.

- [ ] `#073` Expiry countdown shown in rate table row for SEP-38 quotes
  - **Module:** `components/offramp/RateTable.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** A live countdown (e.g. "28s") appears next to each SEP-38 row; turns red below 5s.

- [ ] `#074` "Quote expired — re-quote before signing" blocker in drawer
  - **Module:** `components/offramp/ExecuteDrawer.tsx`
  - **Difficulty:** intermediate
  - **Acceptance:** If quote expires while drawer is open, drawer shows a re-quote prompt and blocks signing.

- [ ] `#075` Per-anchor quote cache with TTL
  - **Module:** `hooks/useAnchorRates.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Each anchor's quote is cached for its `expires_at` duration; expired quotes trigger a background refresh.

- [ ] `#076` SEP-38 quote expiry regression test
  - **Module:** `tests/sep38.spec.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Test confirms `isQuoteExpired` returns true after mocked `expires_at`; drawer blocks signing on expired quote.

### G. Error handling & retries

- [ ] `#080` Per-anchor circuit breaker — opens on 3 consecutive failures
  - **Module:** `lib/stellar/sep38.ts`, `hooks/useAnchorRates.ts`
  - **Difficulty:** hard
  - **Acceptance:** After 3 failures an anchor is marked `circuit_open`; it resets after 60s. Rate table shows "Temporarily unavailable".

- [ ] `#081` Retry-with-backoff on `429` responses honouring `Retry-After` header
  - **Module:** `lib/stellar/sep38.ts`, `lib/stellar/sep24.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** On 429, waits for `Retry-After` seconds (capped at 30s) before retrying; surfaces error after 3 retries.

- [ ] `#082` Sentry reporter scaffold — pluggable, off by default, env-toggled
  - **Module:** `lib/reporter.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** `configureReporter({ dsn })` enables Sentry; default is a noop reporter. No secrets in repo.

- [ ] `#083` Clock-skew detection and surfacing in rate table
  - **Module:** `hooks/useAnchorRates.ts`, `components/offramp/RateTable.tsx`
  - **Difficulty:** hard
  - **Acceptance:** If local clock differs from anchor's `Date` header by > 30s, show a warning banner.

### H. Rate freshness

- [ ] `#085` Per-row age badge — `5s / 15s / 60s / stale`
  - **Module:** `components/offramp/RateTable.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Each row shows how old its quote is; "stale" shown after `QUOTE_VALIDITY_MS` elapses.

- [ ] `#086` "Auto-refresh all" and "refresh one anchor" affordances
  - **Module:** `components/offramp/RateTable.tsx`
  - **Difficulty:** intermediate
  - **Acceptance:** Global refresh button refreshes all; per-row refresh button fetches only that anchor.

---

## Wave 1.2 — Router + Seeds (`#111–#140`)

### I. Intent schema & API

- [ ] `#111` `app/api/intent/offramp/route.ts` — accept and validate signed intents
  - **Module:** `app/api/intent/offramp/`
  - **Difficulty:** hard
  - **Acceptance:** POST with valid signed intent returns a plan; invalid signature returns `INVALID_SIGNATURE`; expired deadline returns `EXPIRED_INTENT`.

- [ ] `#112` Replay protection — reject duplicate `(account, nonce)` pairs
  - **Module:** `app/api/intent/offramp/route.ts`, `lib/intent/`
  - **Difficulty:** hard
  - **Acceptance:** Second request with same nonce returns `REPLAY_DETECTED`; first request succeeds.

- [ ] `#113` `lib/intent/sign.ts` — ed25519 signing via Freighter
  - **Module:** `lib/intent/sign.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** `signIntent(intent)` returns a `SignedIntent` with valid signature; works in browser with Freighter.

- [ ] `#114` Intent schema validation with Zod
  - **Module:** `lib/intent/validate.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** All intent fields validated; invalid inputs return typed errors with field paths.

- [ ] `#115` `docs/INTENT_API.md` curl and TypeScript examples verified against live API
  - **Module:** `docs/INTENT_API.md`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Both examples run successfully against local dev server.

### J. Single-anchor intent router

- [ ] `#120` `lib/router/score.ts` — net-landed-value scoring function
  - **Module:** `lib/router/score.ts`
  - **Difficulty:** hard
  - **Acceptance:** `scoreAnchor(anchor, quote, reputationData)` returns a float in [0, 1]; unit tests cover all formula branches.

- [ ] `#121` `lib/router/select.ts` — single-anchor plan selection
  - **Module:** `lib/router/select.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Given N scored anchors, returns the one with highest score; ties broken by `fill_rate` descending.

- [ ] `#122` `lib/router/plan.ts` — produces `Plan` from `SignedIntent` and quotes
  - **Module:** `lib/router/plan.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Returns `SolverResult` with `ok: true` and a `Plan`; handles no-route and floor-not-met cases.

- [ ] `#123` Feature flag `INTENT_FLOW=true` enables router in offramp page
  - **Module:** `lib/flags.ts`, `app/offramp/page.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** With flag on, drawer uses router output; with flag off, uses direct `RateTable` row click (current behaviour).

### K. Reputation write path seed

- [ ] `#128` `ReputationStore` interface — pluggable (SQLite dev, Postgres prod)
  - **Module:** `lib/reputation/store.ts`
  - **Difficulty:** hard
  - **Acceptance:** Interface defined; SQLite implementation passes all interface tests.

- [ ] `#129` `app/api/outcomes/route.ts` — accept outcome tuples with signature verification
  - **Module:** `app/api/outcomes/`
  - **Difficulty:** hard
  - **Acceptance:** Valid outcome accepted and stored; missing signature returns 401; unknown intent returns 404.

- [ ] `#130` `lib/publisher/queue.ts` — durable outcome queue (SQLite-backed, dev only)
  - **Module:** `lib/publisher/queue.ts`
  - **Difficulty:** hard
  - **Acceptance:** Outcomes survive process restart; at-least-once delivery; idempotent on duplicate.

- [ ] `#131` Feature flag `REPUTATION_WRITE=true` enables outcome submission
  - **Module:** `lib/flags.ts`, `app/offramp/page.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** With flag on, terminal states submit outcome to `/api/outcomes`; with flag off, no submission.

### L. MCP server

- [ ] `#135` `list_corridors` MCP tool backed by `CORRIDORS` registry
  - **Module:** `scripts/mcp/tools/`
  - **Difficulty:** intermediate
  - **Acceptance:** `claude mcp add` installs the server; calling `list_corridors` returns all corridors.

- [ ] `#136` `list_anchors_for_corridor` MCP tool
  - **Module:** `scripts/mcp/tools/`
  - **Difficulty:** intermediate
  - **Acceptance:** Returns all anchors for a given corridor ID; unknown corridor returns empty array.

- [ ] `#137` `quote_corridor` MCP tool backed by `/api/rates`
  - **Module:** `scripts/mcp/tools/`
  - **Difficulty:** intermediate
  - **Acceptance:** Returns live quotes for a corridor; handles anchor-down gracefully.

- [ ] `#138` MCP server subprocess round-trip test
  - **Module:** `tests/mcp-e2e.spec.ts`
  - **Difficulty:** hard
  - **Acceptance:** Test spawns the MCP server as a subprocess and calls all three read-only tools.

---

## Wave 1.3 — Polish + Release Gate (`#141–#150`)

- [ ] `#141` Structured logger `lib/logger.ts` with correlation IDs via `AsyncLocalStorage`
  - **Module:** `lib/logger.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Logger emits JSON lines in production; pretty-prints in dev. Correlation ID threads through API routes.

- [ ] `#142` Client-side quote and submit latency metrics
  - **Module:** `lib/metrics.ts`
  - **Difficulty:** intermediate
  - **Acceptance:** Time-to-first-quote and time-to-sign are captured and logged on each off-ramp.

- [ ] `#143` `GET /api/metrics` endpoint — success/error counters
  - **Module:** `app/api/metrics/`
  - **Difficulty:** intermediate
  - **Acceptance:** Returns JSON with quote count, success rate, and per-anchor error counts for the last 24h.

- [ ] `#144` Per-anchor latency histogram in metrics endpoint
  - **Module:** `app/api/metrics/`, `lib/reputation/`
  - **Difficulty:** hard
  - **Acceptance:** Histogram with p50/p95/p99 buckets per anchor, sourced from `ReputationStore`.

- [ ] `#145` `lib/version.ts` with build metadata displayed in footer
  - **Module:** `lib/version.ts`, `components/layout/Footer.tsx`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Footer shows version string from `package.json` and git SHA (injected at build time).

- [ ] `#146` Feature flag module `lib/flags.ts` with env-variable backing
  - **Module:** `lib/flags.ts`
  - **Difficulty:** good-first-issue
  - **Acceptance:** `getFlag('INTENT_FLOW')` returns boolean; all flags documented in `.env.example`.

- [ ] `#147` Env validation at Next.js boot — fail fast on missing required vars
  - **Module:** `lib/env.ts`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Missing `NEXT_PUBLIC_STELLAR_NETWORK` throws at startup with a clear message.

- [ ] `#148` `npm run test:release` — full v1 sign-off suite
  - **Module:** `package.json`
  - **Difficulty:** intermediate
  - **Acceptance:** Script runs typecheck + lint + format:check + test + build in sequence; fails fast on first error.

- [ ] `#149` "Open in MCP" header badge when local MCP server is detected
  - **Module:** `components/layout/Navbar.tsx`
  - **Difficulty:** intermediate
  - **Acceptance:** Badge appears when `GET /api/mcp/ping` returns 200; hidden otherwise.

- [ ] `#150` `CHANGELOG.md` tagged with v1.0.0 release note
  - **Module:** `CHANGELOG.md`
  - **Difficulty:** good-first-issue
  - **Acceptance:** Changelog has a dated `## [1.0.0]` section listing all Wave 1.0–1.3 changes.

---

## Wave 2.0 — Reputation as Product Surface (`#151–#180`)

- [ ] `#151` Anchor scorecard card — fill rate, settle time, slippage per anchor
  - **Module:** `components/anchors/ScorecardCard.tsx`
  - **Difficulty:** intermediate

- [ ] `#152` Scorecard integrated into `RateTable` row expansion
  - **Module:** `components/offramp/RateTable.tsx`
  - **Difficulty:** intermediate

- [ ] `#153` Scorecard detail modal on anchor name click
  - **Module:** `components/anchors/ScorecardModal.tsx`
  - **Difficulty:** intermediate

- [ ] `#155` Public leaderboard page at `/anchors`
  - **Module:** `app/anchors/page.tsx`
  - **Difficulty:** intermediate

- [ ] `#157` `GET /api/reputation/leaderboard?corridor` endpoint
  - **Module:** `app/api/reputation/leaderboard/`
  - **Difficulty:** intermediate

- [ ] `#158` `GET /api/reputation/:anchor` endpoint with 7/30/90-day windows
  - **Module:** `app/api/reputation/[anchor]/`
  - **Difficulty:** intermediate

- [ ] `#159` Composite score formula implementation with full test vectors
  - **Module:** `lib/reputation/aggregate.ts`
  - **Difficulty:** hard

- [ ] `#166` "Flag incorrect outcome" button on terminal `StatusTracker` states
  - **Module:** `components/offramp/StatusTracker.tsx`
  - **Difficulty:** good-first-issue

- [ ] `#171` Top-3 anchors summary bar above `RateTable`
  - **Module:** `components/offramp/RateTable.tsx`
  - **Difficulty:** intermediate

- [ ] `#178` Reputation badge in `StatusTracker` on `completed`
  - **Module:** `components/offramp/StatusTracker.tsx`
  - **Difficulty:** good-first-issue

---

## Wave 2.1 — Soroban Oracle Live (`#181–#205`)

- [ ] `#181` Soroban oracle contract — `publish_outcome` with signature verification
  - **Module:** `contracts/oracle/src/lib.rs`
  - **Difficulty:** hard

- [ ] `#182` Soroban oracle contract — `read_outcome` and `read_aggregate`
  - **Module:** `contracts/oracle/src/lib.rs`
  - **Difficulty:** hard

- [ ] `#183` Soroban oracle contract — `dispute` entrypoint
  - **Module:** `contracts/oracle/src/lib.rs`
  - **Difficulty:** hard

- [ ] `#184` Publisher service — signs and submits outcome tuples to Soroban
  - **Module:** `lib/publisher/`
  - **Difficulty:** hard

- [ ] `#189` Publisher service health endpoint `GET /api/publisher/health`
  - **Module:** `app/api/publisher/health/`
  - **Difficulty:** intermediate

- [ ] `#194` Oracle contract deployed to Soroban testnet with e2e test green
  - **Module:** `contracts/oracle/`
  - **Difficulty:** hard

- [ ] `#201` Public TypeScript read SDK `packages/sdk/oracle.ts`
  - **Module:** `packages/sdk/`
  - **Difficulty:** hard

---

## Docs & community (`#D01–#D10`)

- [ ] `#D01` `docs/ORACLE_SPEC.md` — Soroban contract interface and consumer guide
  - **Module:** `docs/`
  - **Difficulty:** good-first-issue

- [ ] `#D02` `docs/FAQ.md` — top 10 user and developer questions
  - **Module:** `docs/`
  - **Difficulty:** good-first-issue

- [ ] `#D03` `docs/BENCHMARKS.md` — corridor latency and quote-to-signed time
  - **Module:** `docs/`
  - **Difficulty:** intermediate

- [ ] `#D04` `docs/ANCHOR_ONBOARDING.md` — self-serve anchor listing guide
  - **Module:** `docs/`
  - **Difficulty:** good-first-issue

- [ ] `#D05` README troubleshooting section — top 5 setup gotchas
  - **Module:** `README.md`
  - **Difficulty:** good-first-issue

- [ ] `#D06` i18n scaffolding — extract hard-coded strings from Navbar and Footer
  - **Module:** `components/layout/`
  - **Difficulty:** intermediate

- [ ] `#D07` `docs/JURISDICTIONAL.md` — money-transmission classification memo
  - **Module:** `docs/`
  - **Difficulty:** intermediate

- [ ] `#D08` Grafana dashboard JSON for anchor latency and success rate
  - **Module:** `docs/observability/`
  - **Difficulty:** hard

- [ ] `#D09` Address-book for NGN bank codes — validation and autocomplete
  - **Module:** `constants/bank-codes.ts`
  - **Difficulty:** intermediate

- [ ] `#D10` `docs/CONTRIBUTOR_LADDER.md` — Triager → Reviewer → Maintainer criteria
  - **Module:** `docs/`
  - **Difficulty:** good-first-issue

---

_Total open issues: 70. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the wave-level scope and release gates._
