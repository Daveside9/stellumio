# Threat Model

> Adversaries, attack vectors, and mitigations for the Stellumio system.
> Updated alongside every wave that changes the trust boundary.

---

## Scope

This document covers:
- The Next.js web app (UI + API routes)
- The intent router and SEP-10/24/38 client libraries
- The reputation oracle (Soroban contract + publisher worker)
- The MCP server

Out of scope: user device security, anchor-side security, Stellar network
consensus security.

---

## Assets at risk

| Asset                  | Owner      | Value                                              |
| ---------------------- | ---------- | -------------------------------------------------- |
| User private key       | User       | Can sign and submit arbitrary transactions         |
| User USDC balance      | User       | Financial loss if stolen or misdirected            |
| Reputation oracle data | Public     | Integrity — fabricated data misleads the router   |
| Publisher signing key  | Stellumio  | Can write fabricated outcomes to the oracle        |
| SEP-10 JWT             | Per-session | Can initiate a withdrawal on behalf of the user   |

---

## Threat actors

| Actor               | Motivation                        | Capability                        |
| ------------------- | --------------------------------- | --------------------------------- |
| Malicious anchor    | Inflate reputation score          | Control SEP-38/24 responses       |
| Network attacker    | MITM quotes or transactions       | Intercept HTTPS (requires CA)     |
| Rogue publisher     | Write false reputation outcomes   | Compromise publisher signing key  |
| Malicious agent     | Drain user wallet autonomously    | Control MCP tool invocation       |
| Phishing attacker   | Steal user signature              | Trick user into signing bad XDR   |

---

## Threat vectors and mitigations

### T1 — Malicious anchor inflating its own reputation

**Attack:** Anchor returns favourable rates, then fails to deliver.

**Mitigation:**
- Outcomes are user-witnessed (SEP-24 `/transaction` response + Stellar ledger).
- The anchor cannot write its own outcomes — only the whitelisted publisher can.
- Synthetic probes run nightly to detect anchors that fail on small amounts.
- `fill_rate` directly penalises repeated failures in the composite score.

### T2 — MITM on anchor HTTPS endpoints

**Attack:** Attacker intercepts SEP-38 quote responses and substitutes a
lower rate.

**Mitigation:**
- All anchor endpoints use HTTPS; certificate pinning is not implemented
  (browser constraint), but TLS validation is enforced.
- SEP-10 challenge includes the anchor's signing key; a MITM that cannot
  produce a valid challenge response from the anchor's key will fail
  authentication.
- The user sees the quoted rate before signing — they can abort.

### T3 — Replay attack on SEP-10 JWT

**Attack:** Attacker captures a JWT and replays it to initiate a second
withdrawal.

**Mitigation:**
- JWTs are scoped to a single anchor domain and tab session.
- JWTs are never persisted to storage.
- SEP-10 JWTs are short-lived (anchor-controlled TTL, typically 24h).
- The withdrawal is signed by the user's wallet — a replay produces a
  duplicate transaction that the Stellar network will reject (sequence number).

### T4 — Publisher key compromise

**Attack:** Attacker obtains the publisher signing key and writes fabricated
outcomes to the oracle.

**Mitigation:**
- Publisher key is stored in an environment secret, never in the repo.
- The Soroban contract verifies the publisher signature on every write.
- A compromised publisher can be removed from the whitelist by the admin
  multisig without upgrading the contract.
- Quarterly key rotation is documented in `docs/ORACLE_SPEC.md`.
- All published outcomes are publicly readable — fabricated outcomes with
  no corresponding Stellar transaction can be detected and disputed.

### T5 — Malicious agent draining a wallet

**Attack:** An AI agent using the MCP server autonomously submits intents
without the user's knowledge.

**Mitigation:**
- `submit_signed_intent` requires a valid ed25519 signature over the intent
  hash from the user's wallet. No held keys = no autonomous spend.
- Every MCP tool invocation is logged to an append-only local log.
- Per-caller rate limits prevent a runaway agent from hammering anchors.

### T6 — Phishing via crafted XDR

**Attack:** Attacker tricks the user into signing a malicious payment XDR
disguised as a legitimate withdrawal.

**Mitigation:**
- The withdrawal XDR is constructed by `buildWithdrawPayment` from the
  anchor's `memo` and `receiving_address` returned by SEP-24.
- Freighter displays the full transaction details before signing.
- Network is pinned to mainnet — a testnet XDR will be rejected at the
  `network_passphrase` assertion.

### T7 — Corrupt or stale rate fabrication

**Attack:** A bug or deliberate manipulation causes the app to display a
fabricated or zero rate, leading the user to sign at a bad rate.

**Mitigation:**
- Issue `#005` (closed): fail closed — if an anchor endpoint fails, render
  "unavailable", never a fabricated rate.
- Issue `#001` (closed): Cowrie exchange rate is asserted > 0 in the unit
  test suite; CI blocks regressions.
- SEP-38 firm quotes (v1.1) bind the anchor to the displayed rate.

---

## Residual risks

| Risk                        | Residual likelihood | Notes                                      |
| --------------------------- | ------------------- | ------------------------------------------ |
| Anchor exit scam            | Low                 | Reputation oracle makes history permanent  |
| Stellar network outage      | Very low            | Outside our control                        |
| Freighter extension exploit | Low                 | Outside our control; user device security  |
| Smart contract bug          | Medium (pre-audit)  | Soroban audit planned for v2.1             |
