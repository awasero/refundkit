import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sign a webhook payload with HMAC-SHA256.
 */
export function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify a webhook signature. Uses timing-safe comparison.
 */
export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = signPayload(payload, secret);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Create a signed webhook payload with timestamp for replay protection.
 */
export function createSignedPayload(
  event: Record<string, unknown>,
  secret: string,
): { payload: string; signature: string; timestamp: number } {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ ...event, timestamp });
  const signature = signPayload(payload, secret);
  return { payload, signature, timestamp };
}

/**
 * Verify that a webhook is not a replay attack.
 * Rejects payloads older than the tolerance window (default: 5 minutes).
 */
export function isTimestampValid(timestamp: number, toleranceSeconds = 300): boolean {
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - timestamp) <= toleranceSeconds;
}
