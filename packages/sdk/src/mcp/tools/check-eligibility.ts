import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const checkEligibilityTool = {
  name: 'refundkit_check_eligibility',
  description: 'Check if a transaction is eligible for refund based on merchant policy rules.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      transactionId: { type: 'string', description: 'The transaction ID to check eligibility for' },
      amount: { type: 'number', description: 'Optional refund amount to check against policy limits' },
      customerId: { type: 'string', description: 'Optional customer ID for customer-specific policy checks' },
    },
    required: ['transactionId'],
  },
};

const paramsSchema = z.object({
  transactionId: z.string(),
  amount: z.number().optional(),
  customerId: z.string().optional(),
});

export async function handleCheckEligibility(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.policies.check(parsed.data);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
