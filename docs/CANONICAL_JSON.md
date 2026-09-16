# Canonical JSON Specification

> The canonicalization rules Stellumio uses when hashing intent objects.
> Every component that hashes or verifies an intent must implement these
> rules identically.

---

## Rules

1. **Recursive key sort** — object keys are sorted lexicographically
   (Unicode code point order) at every level of nesting.
2. **No whitespace** — no spaces or newlines outside of string values.
3. **UTF-8 encoding** — the output is UTF-8 bytes before hashing.
4. **String numbers** — monetary amounts (`sellAmount`, `minReceive`) are
   already strings in the schema; they pass through unchanged.
5. **No undefined / null omission** — all fields present in the schema
   are included, even if their value is the type default.
6. **Boolean literals** — `true` / `false` lowercase, no quotes.

---

## Reference implementation (TypeScript)

```ts
export function canonicalize(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalize).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(
    (k) => JSON.stringify(k) + ':' + canonicalize((obj as Record<string, unknown>)[k])
  );
  return '{' + pairs.join(',') + '}';
}
```

---

## Test vectors

### Vector 1 — simple intent (abbreviated)

Input:
```json
{
  "version": 1,
  "nonce": "aabbccdd",
  "account": "GABC",
  "corridor": "usdc-ngn"
}
```

Canonical output (no whitespace, keys sorted):
```
{"account":"GABC","corridor":"usdc-ngn","nonce":"aabbccdd","version":1}
```

SHA-256 (hex):
```
e3b4f1a29c8d7e6f5b4c3a2d1e0f9c8b7a6d5e4f3c2b1a0d9e8f7c6b5a4d3e2
```
*(illustrative — compute from the actual canonical string)*

### Vector 2 — nested preferences

Input:
```json
{
  "preferences": { "maxAnchors": 2, "allowSplit": true },
  "version": 1
}
```

Canonical output:
```
{"preferences":{"allowSplit":true,"maxAnchors":2},"version":1}
```

Note: `allowSplit` sorts before `maxAnchors`; `preferences` sorts before `version`.

---

## Hash function

```ts
export async function sha256hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashIntent(intent: Intent): Promise<string> {
  return sha256hex(canonicalize(intent));
}
```

---

## Interoperability

Any implementation that produces the same canonical string from the same
input object is compatible. Known-good implementations:

| Language   | Library / approach                              |
| ---------- | ----------------------------------------------- |
| TypeScript | `canonicalize()` above + `crypto.subtle`        |
| Rust       | `serde_json` with `BTreeMap` (sorts by default) |
| Python     | `json.dumps(obj, sort_keys=True, separators=(',', ':'))` |

If you are implementing a new consumer, run it against the test vectors
above and open a PR adding your language to the table.
