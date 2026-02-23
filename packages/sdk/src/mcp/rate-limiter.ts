export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMIT_TIERS: Record<string, RateLimitConfig> = {
  free: { maxRequests: 100, windowMs: 60_000 },
  pro: { maxRequests: 1_000, windowMs: 60_000 },
  enterprise: { maxRequests: 10_000, windowMs: 60_000 },
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private entries = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if a request is allowed. Returns rate limit info.
   */
  check(key: string): {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    let entry = this.entries.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + this.config.windowMs };
      this.entries.set(key, entry);
    }

    entry.count++;

    const allowed = entry.count <= this.config.maxRequests;
    return {
      allowed,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetAt: entry.resetAt,
    };
  }

  /**
   * Clean up expired entries to prevent memory leaks.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      if (now >= entry.resetAt) {
        this.entries.delete(key);
      }
    }
  }
}
