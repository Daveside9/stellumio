# Anchor Reputation — Scoring Methodology

> How Stellumio scores anchors, what data feeds the score, how disputes work,
> and what anchors can do to improve their standing.

---

## 1. Why reputation matters

A rate aggregator without a reputation layer is a headline-rate page. The
cheapest rate on paper means nothing if the anchor that quoted it fails to
fill 30% of orders. Stellumio's reputation layer converts raw outcome data
into a single comparable signal — the **composite score** — that the router
uses to rank anchors by expected net landed value, not quoted rate.

---

## 2. Data sources

Every completed, refunded, or errored intent produces an **outcome tuple**
written to the Soroban reputation oracle:

```
(intent_hash, anchor_id, corridor, quoted_rate, delivered_rate,
 quoted_amount, delivered_amount, settle_seconds, outcome, timestamp)
```

Sources in priority order:

1. **Organic outcomes** — real user intents that reach a terminal state.
   Highest weight. User-witnessed and on-ledger.
2. **Synthetic probes** — nightly $1 USDC off-ramps run by the probe service
   against every live corridor. Lower weight (0.3×). Bootstrap coverage
   before organic volume arrives.

---

## 3. Metrics

| Metric          | Definition                                                      | Unit    |
| --------------- | --------------------------------------------------------------- | ------- |
| `fill_rate`     | Fraction of intents that reached `completed` (not refunded/errored) | 0–1 |
| `settle_p50`    | Median seconds from `pending_anchor` → `completed`              | seconds |
| `slippage_p50`  | Median of `(quoted_rate − delivered_rate) / quoted_rate`        | 0–1     |
| `n`             | Total outcomes in the window                                    | count   |

Windows: **7-day**, **30-day**, **90-day**. The router uses 30-day by default.
Windows with `n < 5` are marked `insufficient_data` and excluded from routing.

---

## 4. Composite score formula

```
composite = 0.4 × fill_score
          + 0.3 × slippage_score
          + 0.3 × settle_score
```

Where each component is normalised to [0, 1]:

```
fill_score     = clamp(fill_rate, 0, 1)
slippage_score = clamp(1 − slippage_p50 / 0.05, 0, 1)   // 5% ceiling
settle_score   = clamp(1 − settle_p50 / 300, 0, 1)       // 5-minute ceiling
```

Anchors with `n < 5` receive a composite of `null` — the router treats them
as unscored and places them below all scored anchors.

---

## 5. Dispute process

Any party (user, anchor, third-party observer) may file a dispute against a
specific outcome tuple within **14 days** of the outcome timestamp.

### Filing a dispute

Use the "Flag incorrect outcome" button on the `StatusTracker` completed
state, or open a GitHub issue using the `dispute` template with:

- `intent_hash` of the disputed outcome
- Which field is incorrect (`delivered_rate`, `delivered_amount`, `settle_seconds`, `outcome`)
- Evidence (Stellar Expert transaction link, bank statement, anchor support ticket)

### Resolution

1. The maintainer reviews the on-chain evidence within **5 business days**.
2. If the dispute is upheld, the outcome is marked `disputed: true` in the
   oracle. It remains in the dataset but is excluded from scoring.
3. If the dispute is rejected, the reason is documented in the issue and the
   outcome stands.
4. Either party may appeal by providing additional on-chain evidence.

Disputes cannot retroactively alter delivered amounts — the Stellar ledger
is the source of truth. A dispute can only flag a recording error (e.g.,
the wrong `settle_seconds` was written because of a clock skew bug).

---

## 6. Anchor self-improvement

Anchors that want to improve their score should focus on:

1. **Fill rate** — honour every SEP-38 firm quote you issue. Do not issue
   quotes you cannot fill.
2. **Settlement latency** — reduce the time between `pending_anchor` and
   the fiat landing. This is the single highest-weight latency signal.
3. **Slippage** — deliver the quoted rate. If your spread is variable,
   widen the quote rather than delivering less than promised.

We publish per-anchor scorecards at `/anchors/:id` so anchors can monitor
their own standing in real time.
