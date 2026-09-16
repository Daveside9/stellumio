/**
 * Canonical JSON serialization for intent hashing.
 *
 * Rules (see docs/CANONICAL_JSON.md):
 *   1. Keys sorted lexicographically at every level of nesting.
 *   2. No whitespace outside string values.
 *   3. UTF-8 encoding (handled by TextEncoder downstream).
 *   4. All schema fields included — no optional omission.
 */

import type { Intent } from '@/types';

/**
 * Recursively canonicalizes any JSON-serializable value.
 * Exported for testing and use in non-intent contexts.
 */
export function canonicalize(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalize).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(
    (k) =>
      JSON.stringify(k) +
      ':' +
      canonicalize((obj as Record<string, unknown>)[k])
  );
  return '{' + pairs.join(',') + '}';
}

/**
 * Serializes an Intent to its canonical JSON string.
 * This string is the input to the SHA-256 hash function.
 */
export function canonicalizeIntent(intent: Intent): string {
  return canonicalize(intent as unknown);
}
