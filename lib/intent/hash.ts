/**
 * SHA-256 hashing for the intent canonicalization pipeline.
 *
 * Uses the Web Crypto API (available in browsers and Node 20+).
 * Returns a lowercase hex string — 64 characters.
 */

import { canonicalizeIntent } from './canonical';
import type { Intent } from '@/types';

/**
 * Returns a hex-encoded SHA-256 digest of the given string.
 */
export async function sha256hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashes an Intent to its canonical SHA-256 hex string.
 *
 * This is the value the user signs and the publisher writes to the oracle.
 */
export async function hashIntent(intent: Intent): Promise<string> {
  return sha256hex(canonicalizeIntent(intent));
}
