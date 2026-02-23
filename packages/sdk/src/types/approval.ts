export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';

export type ApprovalTrigger = 'amount_threshold' | 'risk_score' | 'category_rule' | 'customer_limit' | 'manual';

export interface ApprovalThreshold {
  autoApproveBelow: number;
  requireReviewAbove: number;
  autoRejectAbove: number | null;
  riskScoreThreshold: number;
}

export interface ApprovalRequest {
  id: string;
  organizationId: string;
  refundId: string;
  trigger: ApprovalTrigger;
  status: ApprovalStatus;
  amount: number;
  currency: string;
  riskScore: number | null;
  decidedBy: string | null;
  decidedAt: string | null;
  reason: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListApprovalsParams {
  status?: ApprovalStatus;
  limit?: number;
  offset?: number;
}

export interface ApprovalDecision {
  approved: boolean;
  reason?: string;
}
