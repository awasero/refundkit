export interface RefundPolicy {
  eligible: boolean;
  reason: string;
  maxAmount: number | null;
  deadline: string | null;
  conditions: string[];
}

export interface CheckPolicyParams {
  transactionId: string;
  amount?: number;
}
