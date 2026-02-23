import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  signPayload,
  verifySignature,
  createSignedPayload,
  isTimestampValid,
} from '../webhooks/signature.js';
import { isRetryable } from '../webhooks/delivery.js';
import { WebhookEmitter } from '../webhooks/emitter.js';
import type { WebhookEndpoint } from '../webhooks/emitter.js';

// --- Signature tests ---

describe('signPayload', () => {
  it('produces a hex string', () => {
    const sig = signPayload('test-payload', 'secret');
    expect(sig).toMatch(/^[a-f0-9]+$/);
  });

  it('same input produces same signature', () => {
    const sig1 = signPayload('payload', 'secret');
    const sig2 = signPayload('payload', 'secret');
    expect(sig1).toBe(sig2);
  });

  it('different secrets produce different signatures', () => {
    const sig1 = signPayload('payload', 'secret-a');
    const sig2 = signPayload('payload', 'secret-b');
    expect(sig1).not.toBe(sig2);
  });
});

describe('verifySignature', () => {
  it('returns true for valid signature', () => {
    const payload = '{"event":"test"}';
    const secret = 'whsec_test';
    const sig = signPayload(payload, secret);
    expect(verifySignature(payload, sig, secret)).toBe(true);
  });

  it('returns false for tampered payload', () => {
    const secret = 'whsec_test';
    const sig = signPayload('{"event":"test"}', secret);
    expect(verifySignature('{"event":"tampered"}', sig, secret)).toBe(false);
  });

  it('returns false for wrong secret', () => {
    const payload = '{"event":"test"}';
    const sig = signPayload(payload, 'correct-secret');
    expect(verifySignature(payload, sig, 'wrong-secret')).toBe(false);
  });
});

describe('createSignedPayload', () => {
  it('includes timestamp in the payload', () => {
    const result = createSignedPayload({ type: 'refund.completed' }, 'secret');
    const parsed = JSON.parse(result.payload);
    expect(parsed.timestamp).toBeTypeOf('number');
    expect(result.timestamp).toBeTypeOf('number');
    expect(parsed.timestamp).toBe(result.timestamp);
  });

  it('produces a valid signature for the payload', () => {
    const secret = 'whsec_test123';
    const result = createSignedPayload({ type: 'refund.completed' }, secret);
    expect(verifySignature(result.payload, result.signature, secret)).toBe(true);
  });
});

// --- Timestamp validation tests ---

describe('isTimestampValid', () => {
  it('current timestamp is valid', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isTimestampValid(now)).toBe(true);
  });

  it('timestamp 4 minutes ago is valid (within 5min tolerance)', () => {
    const fourMinutesAgo = Math.floor(Date.now() / 1000) - 240;
    expect(isTimestampValid(fourMinutesAgo)).toBe(true);
  });

  it('timestamp 6 minutes ago is invalid (outside tolerance)', () => {
    const sixMinutesAgo = Math.floor(Date.now() / 1000) - 360;
    expect(isTimestampValid(sixMinutesAgo)).toBe(false);
  });

  it('custom tolerance works', () => {
    const twoMinutesAgo = Math.floor(Date.now() / 1000) - 120;
    expect(isTimestampValid(twoMinutesAgo, 60)).toBe(false);
    expect(isTimestampValid(twoMinutesAgo, 180)).toBe(true);
  });
});

// --- Delivery retryability tests ---

describe('isRetryable', () => {
  it('returns false for 200', () => {
    expect(isRetryable(200)).toBe(false);
  });

  it('returns false for 400', () => {
    expect(isRetryable(400)).toBe(false);
  });

  it('returns true for 429', () => {
    expect(isRetryable(429)).toBe(true);
  });

  it('returns true for 500', () => {
    expect(isRetryable(500)).toBe(true);
  });

  it('returns true for 503', () => {
    expect(isRetryable(503)).toBe(true);
  });
});

// --- WebhookEmitter tests ---

describe('WebhookEmitter', () => {
  const testDeliveryConfig = { maxRetries: 0, timeoutMs: 1000, retryDelays: [] as number[] };

  const makeEndpoint = (overrides: Partial<WebhookEndpoint> = {}): WebhookEndpoint => ({
    id: 'ep_1',
    organizationId: 'org_1',
    url: 'https://example.com/webhook',
    events: ['refund.completed'],
    secret: 'whsec_test',
    active: true,
    failureCount: 0,
    lastDeliveredAt: null,
    ...overrides,
  });

  let originalFetch: typeof global.fetch;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalFetch = global.fetch;
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('registers and lists endpoints', () => {
    const emitter = new WebhookEmitter({ deliveryConfig: testDeliveryConfig });
    const endpoint = makeEndpoint();
    emitter.registerEndpoint(endpoint);

    const listed = emitter.listEndpoints('org_1');
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe('ep_1');
  });

  it('removes an endpoint', () => {
    const emitter = new WebhookEmitter({ deliveryConfig: testDeliveryConfig });
    emitter.registerEndpoint(makeEndpoint());
    emitter.removeEndpoint('ep_1');

    expect(emitter.listEndpoints('org_1')).toHaveLength(0);
  });

  it('emits event to matching endpoint', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const emitter = new WebhookEmitter({ deliveryConfig: testDeliveryConfig });
    emitter.registerEndpoint(makeEndpoint());

    const result = await emitter.emit('refund.completed', { refundId: 'rf_123' }, 'org_1');

    expect(result.eventId).toMatch(/^evt_/);
    expect(result.deliveries).toHaveLength(1);
    expect(result.deliveries[0].result.success).toBe(true);
    expect(result.deliveries[0].result.statusCode).toBe(200);
    expect(mockFetch).toHaveBeenCalledOnce();

    // Verify the fetch was called with proper headers
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://example.com/webhook');
    expect(options.method).toBe('POST');
    expect(options.headers['X-RefundKit-Signature']).toBeDefined();
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('does not send to endpoints that do not subscribe to the event type', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const emitter = new WebhookEmitter({ deliveryConfig: testDeliveryConfig });
    emitter.registerEndpoint(makeEndpoint({ events: ['return.created'] }));

    const result = await emitter.emit('refund.completed', { refundId: 'rf_123' }, 'org_1');

    expect(result.deliveries).toHaveLength(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not send to inactive endpoints', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const emitter = new WebhookEmitter({ deliveryConfig: testDeliveryConfig });
    emitter.registerEndpoint(makeEndpoint({ active: false }));

    const result = await emitter.emit('refund.completed', { refundId: 'rf_123' }, 'org_1');

    expect(result.deliveries).toHaveLength(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not send to endpoints in different organizations', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const emitter = new WebhookEmitter({ deliveryConfig: testDeliveryConfig });
    emitter.registerEndpoint(makeEndpoint({ organizationId: 'org_2' }));

    const result = await emitter.emit('refund.completed', { refundId: 'rf_123' }, 'org_1');

    expect(result.deliveries).toHaveLength(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls onDelivery callback when provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const onDelivery = vi.fn();
    const emitter = new WebhookEmitter({ deliveryConfig: testDeliveryConfig, onDelivery });
    emitter.registerEndpoint(makeEndpoint());

    await emitter.emit('refund.completed', { refundId: 'rf_123' }, 'org_1');

    expect(onDelivery).toHaveBeenCalledOnce();
    expect(onDelivery).toHaveBeenCalledWith('ep_1', 'refund.completed', expect.objectContaining({ success: true }));
  });

  it('fans out to multiple matching endpoints', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const emitter = new WebhookEmitter({ deliveryConfig: testDeliveryConfig });
    emitter.registerEndpoint(makeEndpoint({ id: 'ep_1', url: 'https://example.com/hook1' }));
    emitter.registerEndpoint(makeEndpoint({ id: 'ep_2', url: 'https://example.com/hook2' }));

    const result = await emitter.emit('refund.completed', { refundId: 'rf_123' }, 'org_1');

    expect(result.deliveries).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
