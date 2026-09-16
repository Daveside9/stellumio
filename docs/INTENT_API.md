# Intent API

> Schema, signing rules, replay protection, and example usage for the
> Stellumio intent primitive.

---

## 1. What is an intent?

An **intent** is the user's signed, canonicalized statement of purpose:

> _"Withdraw $100 USDC to NGN bank account XYZ, at or better than ₦1,510 per
> USDC, before 2026-04-23T19:00Z."_

It is the atomic unit the router uses to route and execute an off-ramp. The
intent is committed to before any anchor sees it — the user signs the outcome
they want, not the anchor they want to use.

---

## 2. Schema

```ts
interface Intent {
  version: 1;
  nonce: string;          // 128-bit random hex — replay protection
  account: string;        // user's Stellar public key (G…)
  corridor: string;       // e.g. "usdc-ngn"
  sellAsset: {
    code: string;         // "USDC"
    issuer: string;       // Circle's canonical USDC issuer on Stellar
  };
  sellAmount: string;     // decimal string e.g. "100.00"
  buyAsset: {
    code: string;         // fiat code e.g. "NGN"
  };
  minReceive: string;     // minimum fiat amount to accept — floor on delivery
  deliveryHint: {
    type: 'bank' | 'mobile_money' | 'cash_pickup';
    countryCode: string;  // ISO 3166-1 alpha-2
  };
  deadline: string;       // RFC3339 — intent expires at this time
  preferences?: {
    allowSplit: boolean;  // default: true
    maxAnchors: number;   // default: 2
    preferAnchorIds?: string[];
  };
}

interface SignedIntent {
  intent: Intent;
  intentHash: string;   // sha-256 over canonical JSON (hex)
  signature: string;    // ed25519 over intentHash, by account (base64)
}
```

---

## 3. Canonicalization

Before hashing, the intent object is serialized to canonical JSON:

1. Keys are sorted lexicographically at every level (recursive).
2. No trailing whitespace or newlines.
3. UTF-8 encoding.
4. Numbers are serialized as strings (already the case for amounts).
5. The `preferences` field is included even if default values.

See [`docs/CANONICAL_JSON.md`](CANONICAL_JSON.md) for the full specification
and test vectors.

---

## 4. Signing

The `intentHash` is signed using the ed25519 key associated with the user's
Stellar account (`account` field). In the browser this is done via Freighter:

```ts
import { signMessage } from '@stellar/freighter-api';

const hash = await sha256(canonicalize(intent)); // hex string
const { signedMessage } = await signMessage(hash, { networkPassphrase: Networks.PUBLIC });

const signedIntent: SignedIntent = {
  intent,
  intentHash: hash,
  signature: signedMessage,
};
```

---

## 5. Replay protection

The `nonce` field is a 128-bit random value generated fresh for every intent:

```ts
function generateNonce(): string {
  return crypto.getRandomValues(new Uint8Array(16))
    .reduce((acc, b) => acc + b.toString(16).padStart(2, '0'), '');
}
```

The server rejects any intent whose `(account, nonce)` pair has been seen
before. Nonces are stored for 24 hours after the intent `deadline`.

---

## 6. Submitting an intent

```
POST /api/intent/offramp
Content-Type: application/json

{
  "intent": { ... },
  "intentHash": "abc123...",
  "signature": "base64..."
}
```

**Response — 200 OK:**
```json
{
  "planId": "plan_01J...",
  "anchor": "moneygram",
  "quotedRate": "1512.50",
  "quotedAmount": "151250.00",
  "expiresAt": "2026-04-23T18:45:00Z"
}
```

**Error codes:**

| Code                  | Meaning                                      |
| --------------------- | -------------------------------------------- |
| `INVALID_SIGNATURE`   | Signature does not verify against account    |
| `EXPIRED_INTENT`      | `deadline` is in the past                   |
| `REPLAY_DETECTED`     | `(account, nonce)` already seen              |
| `NO_ROUTE`            | No anchor can satisfy `minReceive`           |
| `VALIDATION_ERROR`    | Schema validation failed                     |

---

## 7. TypeScript example (full flow)

```ts
import { buildIntent, signIntent, submitIntent } from '@stellumio/sdk';

const intent = buildIntent({
  account: publicKey,
  corridor: 'usdc-ngn',
  sellAmount: '100',
  minReceive: '149000',
  deliveryHint: { type: 'bank', countryCode: 'NG' },
  deadlineSeconds: 300,
});

const signed = await signIntent(intent); // prompts Freighter
const plan = await submitIntent(signed);

console.log(`Routing to ${plan.anchor} at ₦${plan.quotedRate}/USDC`);
```

---

## 8. curl example

```bash
curl -X POST https://stellumio.vercel.app/api/intent/offramp \
  -H "Content-Type: application/json" \
  -d '{
    "intent": {
      "version": 1,
      "nonce": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
      "account": "GABC...",
      "corridor": "usdc-ngn",
      "sellAsset": { "code": "USDC", "issuer": "GA5Z..." },
      "sellAmount": "100.00",
      "buyAsset": { "code": "NGN" },
      "minReceive": "149000.00",
      "deliveryHint": { "type": "bank", "countryCode": "NG" },
      "deadline": "2026-04-23T19:00:00Z",
      "preferences": { "allowSplit": true, "maxAnchors": 2 }
    },
    "intentHash": "sha256hexhere",
    "signature": "base64sighere"
  }'
```
