/**
 * Nonce generation for intent replay protection.
 *
 * Each intent must carry a fresh 128-bit random nonce.
 * The server rejects any (account, nonce) pair it has seen before,
 * within a 24-hour window after the intent deadline.
 */

/**
 * Generates a cryptographically random 128-bit nonce as a lowercase hex string.
 * Output is always exactly 32 hex characters.
 */
export function generateIntentNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
