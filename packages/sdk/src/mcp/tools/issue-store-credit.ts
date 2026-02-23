import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const issueStoreCreditTool = {
  name: 'refundkit_issue_store_credit',
  description: 'Issue store credit to a customer as an alternative to a cash refund.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: { type: 'string', description: 'The customer ID to issue credit to' },
      amount: { type: 'number', description: 'Credit amount in smallest currency unit (e.g., cents)' },
      creditType: {
        type: 'string',
        enum: ['refund_conversion', 'goodwill', 'exchange_difference', 'promotional'],
        description: 'Type of store credit being issued',
      },
      currency: { type: 'string', description: 'Three-letter currency code (default: usd)' },
      expiresInDays: { type: 'number', description: 'Number of days until the credit expires' },
      refundId: { type: 'string', description: 'Optional associated refund ID' },
    },
    required: ['customerId', 'amount', 'creditType'],
  },
};

const paramsSchema = z.object({
  customerId: z.string(),
  amount: z.number(),
  creditType: z.enum(['refund_conversion', 'goodwill', 'exchange_difference', 'promotional']),
  currency: z.string().optional(),
  expiresInDays: z.number().optional(),
  refundId: z.string().optional(),
});

export async function handleIssueStoreCredit(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.storeCredit.issue(parsed.data);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
