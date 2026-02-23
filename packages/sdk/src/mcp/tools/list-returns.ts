import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const listReturnsTool = {
  name: 'refundkit_list_returns',
  description: 'List return requests with optional status filter.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      status: { type: 'string', description: 'Filter by return status' },
      limit: { type: 'number', description: 'Max results to return (default: 25)' },
      offset: { type: 'number', description: 'Offset for pagination (default: 0)' },
    },
  },
};

const paramsSchema = z.object({
  status: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export async function handleListReturns(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.returns.list(parsed.data);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
