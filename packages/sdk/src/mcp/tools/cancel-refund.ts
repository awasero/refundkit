import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const cancelRefundTool = {
  name: 'refundkit_cancel_refund',
  description: 'Cancel a pending refund. Only refunds in pending or processing status can be cancelled.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      refundId: { type: 'string', description: 'The refund ID to cancel' },
    },
    required: ['refundId'],
  },
};

const paramsSchema = z.object({
  refundId: z.string(),
});

export async function handleCancelRefund(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.refunds.cancel(parsed.data.refundId);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
