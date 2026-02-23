export type RefundStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type RefundReason =
  | 'product_not_received'
  | 'product_defective'
  | 'wrong_product'
  | 'duplicate_charge'
  | 'subscription_cancelled'
  | 'other';

export type RefundInitiatedBy = 'api' | 'dashboard' | 'mcp';

export interface Refund {
  id: string;
  organizationId: string;
  externalRefundId: string | null;
  transactionId: string;
  amount: number;
  currency: string;
  reason: RefundReason;
  status: RefundStatus;
  processor: string;
  metadata: Record<string, unknown> | null;
  initiatedBy: RefundInitiatedBy;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRefundParams {
  transactionId: string;
  amount: number;
  currency?: string;
  reason: RefundReason;
  processor?: string;
  metadata?: Record<string, unknown>;
}

export interface ListRefundsParams {
  status?: RefundStatus;
  processor?: string;
  limit?: number;
  offset?: number;
}
