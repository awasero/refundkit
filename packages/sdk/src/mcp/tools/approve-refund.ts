import { z } from 'zod';
import type { RefundKit } from '../../index.js';

export const approveRefundTool = {
  name: 'refundkit_approve_refund',
  description: 'Approve or reject a pending refund approval request.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      approvalId: { type: 'string', description: 'The approval request ID' },
      decision: {
        type: 'string',
        enum: ['approve', 'reject'],
        description: 'Whether to approve or reject the refund',
      },
      reason: { type: 'string', description: 'Optional reason for the decision' },
    },
    required: ['approvalId', 'decision'],
  },
};

const paramsSchema = z.object({
  approvalId: z.string(),
  decision: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

export async function handleApproveRefund(
  rk: RefundKit,
  args: Record<string, unknown>,
) {
  const parsed = paramsSchema.safeParse(args);
  if (!parsed.success) {
    return { content: [{ type: 'text' as const, text: `Validation error: ${parsed.error.issues[0].message}` }], isError: true };
  }

  const { approvalId, decision, reason } = parsed.data;

  const { data, error } = decision === 'approve'
    ? await rk.approvals.approve(approvalId, reason)
    : await rk.approvals.reject(approvalId, reason || 'Rejected');

  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
