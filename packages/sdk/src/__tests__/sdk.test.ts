import { describe, it, expect } from 'vitest';
import { RefundKit, RefundKitError, ErrorCode } from '../index.js';
import { generateApiKey, hashApiKey, isValidApiKeyFormat, getApiKeyEnvironment } from '../utils/crypto.js';
import { createRefundSchema } from '../utils/validation.js';

describe('RefundKit', () => {
  it('throws when no API key provided', () => {
    expect(() => new RefundKit({ apiKey: '' })).toThrow('API key is required');
  });

  it('creates instance with valid API key', () => {
    const rk = new RefundKit({ apiKey: 'rk_test_abc123abc123abc123abc123abc12345' });
    expect(rk.refunds).toBeDefined();
    expect(rk.policies).toBeDefined();
  });
});

describe('API key utilities', () => {
  it('generates live API key with correct format', () => {
    const { key, hash, prefix } = generateApiKey('live');
    expect(key.startsWith('rk_live_')).toBe(true);
    expect(key.length).toBe(8 + 32); // rk_live_ + 32 chars
    expect(hash).toBeTruthy();
    expect(prefix.startsWith('rk_live_')).toBe(true);
  });

  it('generates test API key with correct format', () => {
    const { key } = generateApiKey('test');
    expect(key.startsWith('rk_test_')).toBe(true);
    expect(key.length).toBe(8 + 32);
  });

  it('hashes API key consistently', () => {
    const key = 'rk_test_abc123abc123abc123abc123abc12345';
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex
  });

  it('validates API key format', () => {
    const liveKey = 'rk_live_' + 'a'.repeat(32);
    expect(isValidApiKeyFormat(liveKey)).toBe(true);
    expect(isValidApiKeyFormat('rk_test_abc123abc123abc123abc123abc12345')).toBe(true);
    expect(isValidApiKeyFormat('invalid_key')).toBe(false);
    expect(isValidApiKeyFormat('rk_live_short')).toBe(false);
  });

  it('detects API key environment', () => {
    expect(getApiKeyEnvironment('rk_live_abc')).toBe('live');
    expect(getApiKeyEnvironment('rk_test_abc')).toBe('test');
    expect(getApiKeyEnvironment('invalid')).toBeNull();
  });
});

describe('Validation schemas', () => {
  it('validates createRefund params', () => {
    const valid = createRefundSchema.safeParse({
      transactionId: 'txn_123',
      amount: 2999,
      reason: 'product_not_received',
    });
    expect(valid.success).toBe(true);
  });

  it('rejects invalid createRefund params', () => {
    const invalid = createRefundSchema.safeParse({
      transactionId: '',
      amount: -1,
      reason: 'invalid_reason',
    });
    expect(invalid.success).toBe(false);
  });
});

describe('Error types', () => {
  it('creates RefundKitError with correct properties', () => {
    const err = new RefundKitError('Not found', ErrorCode.NOT_FOUND, 404);
    expect(err.message).toBe('Not found');
    expect(err.code).toBe('not_found');
    expect(err.statusCode).toBe(404);
    expect(err.name).toBe('RefundKitError');
  });
});
