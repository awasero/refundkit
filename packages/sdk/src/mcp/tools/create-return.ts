import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const createReturnTool = {
  name: 'refundkit_create_return',
  description: 'Create a return request for a refund. Generates an RMA number and initiates the return process.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      refundId: { type: 'string', description: 'The refund ID to create a return for' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sku: { type: 'string', description: 'Product SKU' },
            quantity: { type: 'number', description: 'Quantity to return' },
            reason: { type: 'string', description: 'Reason for returning this item' },
          },
          required: ['sku', 'quantity', 'reason'],
        },
        description: 'Items to return',
      },
      method: {
        type: 'string',
        enum: ['mail', 'in_store', 'pickup'],
        description: 'Return method (default: mail)',
      },
      customerNotes: { type: 'string', description: 'Optional notes from the customer' },
    },
    required: ['refundId', 'items'],
  },
};

const paramsSchema = z.object({
  refundId: z.string(),
  items: z.array(z.object({
    sku: z.string(),
    quantity: z.number(),
    reason: z.string(),
  })),
  method: z.enum(['mail', 'in_store', 'pickup']).optional(),
  customerNotes: z.string().optional(),
});

export async function handleCreateReturn(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { data, error } = await rk.returns.create(parsed.data);
  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
