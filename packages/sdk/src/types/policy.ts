// --- Basic policy check (v0.1) ---

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

// --- Policy Engine (v0.2) ---

export interface PolicyCategoryRule {
  category: string;
  returnWindowDays: number;
  restockingFeePercent: number;
  exchangeOnly: boolean;
  finalSale: boolean;
  conditions: string[];
}

export interface PolicyGlobalLimits {
  maxReturnsPerCustomer30d: number;
  maxReturnValuePerCustomer90d: number;
  autoApproveThreshold: number;
}

export interface MerchantPolicy {
  id: string;
  merchantId: string;
  name: string;
  rules: PolicyCategoryRule[];
  globalLimits: PolicyGlobalLimits;
  defaultReturnWindowDays: number;
  defaultRestockingFeePercent: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityItem {
  sku: string;
  category: string;
  quantity: number;
  amount?: number;
}

export interface CheckEligibilityParams {
  transactionId: string;
  amount?: number;
  items?: EligibilityItem[];
  customerId?: string;
}

export interface ItemEligibility {
  sku: string;
  eligible: boolean;
  reason: string;
  restockingFee: number;
}

export interface CustomerHistory {
  totalReturns30d: number;
  totalReturns90d: number;
  totalReturnValue90d: number;
  limitReached: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  policy: {
    returnWindowDays: number;
    daysRemaining: number;
    restockingFeePercent: number;
    exchangeOnly: boolean;
    finalSale: boolean;
  };
  perItemEligibility: ItemEligibility[];
  customerHistory: CustomerHistory | null;
  maxRefundAmount: number;
  restockingFee: number;
  netRefundAmount: number;
  deadline: string | null;
  conditions: string[];
  autoApproved: boolean;
}

export interface GetReturnPolicyParams {
  merchantId?: string;
  category?: string;
}
