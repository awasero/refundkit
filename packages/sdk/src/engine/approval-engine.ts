import type { ApprovalThreshold, ApprovalTrigger, RiskLevel } from '../types/index.js';

export interface ApprovalDecisionResult {
  requiresApproval: boolean;
  autoApproved: boolean;
  autoRejected: boolean;
  trigger: ApprovalTrigger | null;
  reason: string;
}

const DEFAULT_THRESHOLDS: ApprovalThreshold = {
  autoApproveBelow: 5000,       // $50.00 in cents
  requireReviewAbove: 20000,    // $200.00 in cents
  autoRejectAbove: null,
  riskScoreThreshold: 75,
};

export class ApprovalEngine {
  evaluate(
    amount: number,
    riskLevel: RiskLevel,
    category?: string,
    thresholds?: Partial<ApprovalThreshold>,
  ): ApprovalDecisionResult {
    const t: ApprovalThreshold = {
      ...DEFAULT_THRESHOLDS,
      ...thresholds,
    };

    // 1. Critical risk — auto-reject immediately
    if (riskLevel === 'critical') {
      return {
        requiresApproval: false,
        autoApproved: false,
        autoRejected: true,
        trigger: 'risk_score',
        reason: 'Automatically rejected due to critical risk level',
      };
    }

    // 2. High risk — require human approval
    if (riskLevel === 'high') {
      return {
        requiresApproval: true,
        autoApproved: false,
        autoRejected: false,
        trigger: 'risk_score',
        reason: 'Requires approval due to high risk level',
      };
    }

    // 3. Auto-reject if amount exceeds auto-reject threshold
    if (t.autoRejectAbove !== null && amount > t.autoRejectAbove) {
      return {
        requiresApproval: false,
        autoApproved: false,
        autoRejected: true,
        trigger: 'amount_threshold',
        reason: `Automatically rejected: amount (${amount}) exceeds auto-reject threshold (${t.autoRejectAbove})`,
      };
    }

    // 4. Small amount with low/medium risk — auto-approve
    if (amount <= t.autoApproveBelow) {
      return {
        requiresApproval: false,
        autoApproved: true,
        autoRejected: false,
        trigger: null,
        reason: `Auto-approved: amount (${amount}) is below threshold (${t.autoApproveBelow})`,
      };
    }

    // 5. Large amount — require human review
    if (amount > t.requireReviewAbove) {
      return {
        requiresApproval: true,
        autoApproved: false,
        autoRejected: false,
        trigger: 'amount_threshold',
        reason: `Requires approval: amount (${amount}) exceeds review threshold (${t.requireReviewAbove})`,
      };
    }

    // 6. Default — auto-approve for amounts between autoApproveBelow and requireReviewAbove
    return {
      requiresApproval: false,
      autoApproved: true,
      autoRejected: false,
      trigger: null,
      reason: `Auto-approved: amount (${amount}) within acceptable range`,
    };
  }
}
