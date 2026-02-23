import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const listRefundsTool = {
  name: 'refundkit_list_refunds',
  description: 'List refunds with optional filters for status, processor, and pagination.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        description: 'Filter by refund status',
      },
      processor: { type: 'string', description: 'Filter by payment processor' },
      limit: { type: 'number', description: 'Max results to return (default: 25)' },
      offset: { type: 'number', description: 'Offset for pagination (default: 0)' },
    },
  },
};

const paramsSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
  processor: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export async function handleListRefunds(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.refunds.list(parsed.data);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
