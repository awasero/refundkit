import { z } from 'zod';

export const createRefundSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('usd'),
  reason: z.enum([
    'product_not_received',
    'product_defective',
    'wrong_product',
    'duplicate_charge',
    'subscription_cancelled',
    'other',
  ]),
  processor: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const listRefundsSchema = z.object({
  status: z
    .enum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
    .optional(),
  processor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().min(0).default(0),
});

export const checkPolicySchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  amount: z.number().positive().optional(),
});
