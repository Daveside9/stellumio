# Non-Custody Manifesto

> Stellumio's custody boundary — what we touch, what we never touch, and
> the technical mechanisms that enforce the boundary.

---

## The one-sentence version

Stellumio is a **router and oracle** — we route your intent to the best
anchor and record the outcome on-chain. We never hold your keys, your USDC,
or your fiat.

---

## What Stellumio does

1. **Aggregates quotes** from Stellar anchors via SEP-38.
2. **Routes your intent** to the anchor with the best net landed value.
3. **Initiates the SEP-24 flow** — the anchor's hosted UI handles KYC.
4. **Constructs the payment transaction** — a USDC send from your account to
   the anchor's receiving address.
5. **Records the outcome** — quote vs delivered rate, settlement latency,
   success/failure — on the Soroban reputation oracle.

---

## What Stellumio never does

| Action                              | Why it never happens                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| Hold your private key               | Signing happens exclusively in Freighter or your wallet    |
| Hold your USDC in transit           | Payment goes directly: your account → anchor's address     |
| Hold fiat                           | Fiat settlement is between anchor and your bank/MNO        |
| Approve transactions on your behalf | Every on-chain action requires your explicit signature     |
| Store JWTs beyond the session       | SEP-10 JWTs are in-memory, tab-scoped, never persisted     |

---

## Technical enforcement

### Signing

All transactions are signed by the user's Freighter wallet. The app
calls `signTransaction(xdr, { networkPassphrase })` and receives the signed
XDR back. The private key never leaves the wallet extension.

### Payment flow

```
User's Stellar account
        │
        │  USDC payment (user-signed)
        ▼
Anchor's receiving address
        │
        │  Fiat settlement (anchor → bank/MNO)
        ▼
User's bank account / mobile wallet
```

There is no Stellumio account in this chain. The anchor's receiving address
comes directly from the SEP-24 `/transactions/withdraw/interactive` response.

### JWT handling

SEP-10 JWTs are cached in JavaScript module scope (in-memory), keyed by
anchor domain. They are:

- Never written to `localStorage`, `sessionStorage`, or `IndexedDB`
- Never sent to a Stellumio server
- Discarded when the browser tab closes

---

## Regulatory note

Because Stellumio never takes custody of user funds or fiat:

- We are not a money services business (MSB) under US FinCEN guidance.
- We are not a virtual asset service provider (VASP) under FATF standards.
- We are infrastructure — equivalent to a wallet UI or a block explorer.

This analysis is documented in full in [`docs/JURISDICTIONAL.md`](JURISDICTIONAL.md).
It is not legal advice. If you are building on Stellumio primitives in a
regulated context, consult your own counsel.

---

## What this means for you

If an anchor fails to deliver your fiat:

- Stellumio records the failure in the reputation oracle.
- The composite score penalises that anchor going forward.
- The dispute process (see [`docs/ANCHOR_REPUTATION.md`](ANCHOR_REPUTATION.md))
  allows the failure to be formally flagged.

But Stellumio cannot refund you — we never had your funds. The anchor took
custody under SEP-24; the anchor is the counterparty for the fiat leg. The
reputation oracle exists precisely to make this counterparty risk visible
before you sign.
