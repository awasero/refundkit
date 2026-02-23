import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const getDisputeRiskTool = {
  name: 'refundkit_get_dispute_risk',
  description: 'Assess the dispute/chargeback risk for a transaction. Returns risk score, signals, and recommendation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      transactionId: { type: 'string', description: 'The transaction ID to assess risk for' },
    },
    required: ['transactionId'],
  },
};

const paramsSchema = z.object({
  transactionId: z.string(),
});

export async function handleGetDisputeRisk(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.disputes.getRisk(parsed.data);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
