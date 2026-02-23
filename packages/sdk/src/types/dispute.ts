export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type SignalType =
  | 'velocity'
  | 'amount_anomaly'
  | 'pattern_match'
  | 'customer_history'
  | 'agent_audit'
  | 'geographic'
  | 'time_based';

export interface DisputeSignal {
  type: SignalType;
  description: string;
  weight: number;
}

export type DisputeRecommendation =
  | 'auto_approve'
  | 'approve_with_review'
  | 'require_approval'
  | 'deny'
  | 'preemptive_refund';

export interface DisputeRisk {
  transactionId: string;
  customerId: string | null;
  riskLevel: RiskLevel;
  score: number;
  signals: DisputeSignal[];
  recommendation: DisputeRecommendation;
  preemptiveRefundAdvised: boolean;
  evaluatedAt: string;
}

export interface GetDisputeRiskParams {
  transactionId: string;
  customerId?: string;
  amount?: number;
}
