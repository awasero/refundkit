export type CreditType = 'refund_conversion' | 'goodwill' | 'exchange_difference' | 'promotional';

export type StoreCreditStatus = 'active' | 'partially_redeemed' | 'fully_redeemed' | 'expired' | 'revoked';

export interface StoreCredit {
  id: string;
  organizationId: string;
  customerId: string;
  refundId: string | null;
  returnId: string | null;
  amount: number;
  currency: string;
  redeemedAmount: number;
  remainingAmount: number;
  creditType: CreditType;
  status: StoreCreditStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueStoreCreditParams {
  customerId: string;
  amount: number;
  currency?: string;
  creditType: CreditType;
  refundId?: string;
  returnId?: string;
  expiresInDays?: number;
  metadata?: Record<string, unknown>;
}
