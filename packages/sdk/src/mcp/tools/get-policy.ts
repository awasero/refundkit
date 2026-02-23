import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const getPolicyTool = {
  name: 'refundkit_get_policy',
  description: 'Get the refund policy for a specific transaction. Returns eligibility, conditions, and deadlines.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      transactionId: { type: 'string', description: 'The transaction ID to check policy for' },
      amount: { type: 'number', description: 'Optional refund amount to check against policy' },
    },
    required: ['transactionId'],
  },
};

const paramsSchema = z.object({
  transactionId: z.string(),
  amount: z.number().optional(),
});

export async function handleGetPolicy(
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
