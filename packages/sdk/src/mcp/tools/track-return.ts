import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const trackReturnTool = {
  name: 'refundkit_track_return',
  description: 'Track the shipment status of a return.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      returnId: { type: 'string', description: 'The return ID to track' },
    },
    required: ['returnId'],
  },
};

const paramsSchema = z.object({
  returnId: z.string(),
});

export async function handleTrackReturn(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.returns.trackShipment(parsed.data.returnId);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
