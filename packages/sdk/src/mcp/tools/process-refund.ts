import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const processRefundTool = {
  name: 'refundkit_process_refund',
  description: 'Process a refund for a transaction. Initiates a refund through the configured payment processor.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      transactionId: { type: 'string', description: 'The transaction ID to refund' },
      amount: { type: 'number', description: 'Refund amount in smallest currency unit (e.g., cents)' },
      reason: {
        type: 'string',
        enum: ['product_not_received', 'product_defective', 'wrong_product', 'duplicate_charge', 'subscription_cancelled', 'other'],
        description: 'Reason for the refund',
      },
      currency: { type: 'string', description: 'Three-letter currency code (default: usd)' },
    },
    required: ['transactionId', 'amount', 'reason'],
  },
};

const paramsSchema = z.object({
  transactionId: z.string(),
  amount: z.number(),
  reason: z.enum(['product_not_received', 'product_defective', 'wrong_product', 'duplicate_charge', 'subscription_cancelled', 'other']),
  currency: z.string().optional(),
});

export async function handleProcessRefund(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.refunds.create(parsed.data);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
