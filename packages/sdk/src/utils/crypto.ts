import { randomBytes, createHash } from 'node:crypto';

export function generateApiKey(environment: 'live' | 'test'): {
  key: string;
  hash: string;
  prefix: string;
} {
  const prefix = `rk_${environment}_`;
  const random = randomBytes(24).toString('base64url').slice(0, 32);
  const key = `${prefix}${random}`;
  const hash = hashApiKey(key);
  return { key, hash, prefix: key.slice(0, prefix.length + 8) };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function isValidApiKeyFormat(key: string): boolean {
  return /^rk_(live|test)_[A-Za-z0-9_-]{32}$/.test(key);
}

export function getApiKeyEnvironment(key: string): 'live' | 'test' | null {
  if (key.startsWith('rk_live_')) return 'live';
  if (key.startsWith('rk_test_')) return 'test';
  return null;
}
