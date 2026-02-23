import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const checkStatusTool = {
  name: 'refundkit_check_refund_status',
  description: 'Check the current status of a refund by its ID.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      refundId: { type: 'string', description: 'The refund ID to check' },
    },
    required: ['refundId'],
  },
};

const paramsSchema = z.object({
  refundId: z.string(),
});

export async function handleCheckStatus(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.refunds.get(parsed.data.refundId);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
