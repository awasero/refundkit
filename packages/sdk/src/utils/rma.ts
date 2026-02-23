import { randomBytes } from 'node:crypto';

/**
 * Generate a unique RMA (Return Merchandise Authorization) number.
 * Format: RMA-YYYYMMDD-XXXXXX (6 random uppercase alphanumeric chars)
 */
export function generateRmaNumber(): string {
  const date = new Date();
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const random = randomBytes(8)
    .toString('hex')
    .slice(0, 6)
    .toUpperCase();
  return `RMA-${dateStr}-${random}`;
}

/**
 * Validate an RMA number format.
 */
export function isValidRmaFormat(rma: string): boolean {
  return /^RMA-\d{8}-[A-Z0-9]{6}$/.test(rma);
}
