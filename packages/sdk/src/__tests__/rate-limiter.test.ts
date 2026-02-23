import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter, RATE_LIMIT_TIERS } from '../mcp/rate-limiter.js';

describe('RateLimiter', () => {
  it('allows requests within limit', () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 60_000 });

    expect(limiter.check('org_1').allowed).toBe(true);
    expect(limiter.check('org_1').allowed).toBe(true);
    expect(limiter.check('org_1').allowed).toBe(true);
  });

  it('blocks requests over limit', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60_000 });

    limiter.check('org_1');
    limiter.check('org_1');
    const result = limiter.check('org_1');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks remaining correctly', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60_000 });

    expect(limiter.check('org_1').remaining).toBe(4);
    expect(limiter.check('org_1').remaining).toBe(3);
    expect(limiter.check('org_1').remaining).toBe(2);
  });

  it('isolates keys from each other', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60_000 });

    limiter.check('org_1');
    limiter.check('org_1');

    expect(limiter.check('org_1').allowed).toBe(false);
    expect(limiter.check('org_2').allowed).toBe(true);
  });

  it('resets after window expires', () => {
    vi.useFakeTimers();
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1_000 });

    limiter.check('org_1');
    expect(limiter.check('org_1').allowed).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(limiter.check('org_1').allowed).toBe(true);

    vi.useRealTimers();
  });

  it('returns correct limit info', () => {
    const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60_000 });
    const result = limiter.check('org_1');

    expect(result.limit).toBe(100);
    expect(result.remaining).toBe(99);
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it('cleanup removes expired entries', () => {
    vi.useFakeTimers();
    const limiter = new RateLimiter({ maxRequests: 10, windowMs: 1_000 });

    limiter.check('org_1');
    limiter.check('org_2');

    vi.advanceTimersByTime(1_001);
    limiter.cleanup();

    // After cleanup, new window should start fresh
    expect(limiter.check('org_1').remaining).toBe(9);

    vi.useRealTimers();
  });

  it('tier configs are properly defined', () => {
    expect(RATE_LIMIT_TIERS.free.maxRequests).toBe(100);
    expect(RATE_LIMIT_TIERS.pro.maxRequests).toBe(1_000);
    expect(RATE_LIMIT_TIERS.enterprise.maxRequests).toBe(10_000);
  });
});
