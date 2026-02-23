import type {
  MerchantPolicy,
  PolicyCategoryRule,
  CheckEligibilityParams,
  EligibilityResult,
  ItemEligibility,
  CustomerHistory,
} from '../types/index.js';

export interface PolicyEngineConfig {
  defaultReturnWindowDays: number;
  defaultRestockingFeePercent: number;
}

const DEFAULT_CONFIG: PolicyEngineConfig = {
  defaultReturnWindowDays: 30,
  defaultRestockingFeePercent: 0,
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Find the matching category rule for a given category string.
 * Returns null if no rule matches.
 */
export function findMatchingRule(
  rules: PolicyCategoryRule[],
  category: string,
): PolicyCategoryRule | null {
  const normalized = category.toLowerCase().trim();
  return rules.find((r) => r.category.toLowerCase().trim() === normalized) ?? null;
}

/**
 * PolicyEngine evaluates refund eligibility against machine-readable merchant policies.
 *
 * It checks return windows, per-item rules, customer abuse limits, restocking fees,
 * and determines whether a refund can be auto-approved or requires manual review.
 */
export class PolicyEngine {
  private config: PolicyEngineConfig;

  constructor(config?: Partial<PolicyEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  evaluate(
    params: CheckEligibilityParams,
    policy: MerchantPolicy,
    purchaseDate: Date,
    customerHistory?: CustomerHistory,
  ): EligibilityResult {
    const now = new Date();
    const daysElapsed = (now.getTime() - purchaseDate.getTime()) / MS_PER_DAY;

    // --- Per-item eligibility ---
    const perItemEligibility = this.evaluateItems(params, policy, daysElapsed);

    // --- Overall policy summary (use first item's rule or defaults) ---
    const primaryCategory = params.items?.[0]?.category;
    const primaryRule = primaryCategory
      ? findMatchingRule(policy.rules, primaryCategory)
      : null;

    const effectiveWindowDays =
      primaryRule?.returnWindowDays ?? policy.defaultReturnWindowDays;
    const effectiveRestockingPercent =
      primaryRule?.restockingFeePercent ?? policy.defaultRestockingFeePercent;
    const effectiveExchangeOnly = primaryRule?.exchangeOnly ?? false;
    const effectiveFinalSale = primaryRule?.finalSale ?? false;

    const daysRemaining = Math.max(0, Math.ceil(effectiveWindowDays - daysElapsed));
    const withinWindow = daysElapsed <= effectiveWindowDays;

    // --- Customer limits ---
    const resolvedHistory = customerHistory ?? null;
    const customerLimitReached = this.isCustomerLimitReached(
      resolvedHistory,
      policy,
    );

    // --- Determine overall eligibility ---
    const allItemsIneligible =
      perItemEligibility.length > 0 &&
      perItemEligibility.every((item) => !item.eligible);
    const hasNoItems = perItemEligibility.length === 0;

    let overallEligible: boolean;
    if (hasNoItems) {
      // No per-item breakdown: base eligibility on window + limits
      overallEligible = withinWindow && !effectiveFinalSale && !customerLimitReached;
    } else {
      // At least one item must be eligible and customer limits must pass
      overallEligible = !allItemsIneligible && !customerLimitReached;
    }

    // --- Calculate amounts ---
    const requestedAmount = params.amount ?? this.sumItemAmounts(params);
    const eligibleItemsAmount = this.sumEligibleItemAmounts(
      params,
      perItemEligibility,
    );
    const maxRefundAmount =
      perItemEligibility.length > 0 ? eligibleItemsAmount : requestedAmount;

    const totalRestockingFee = perItemEligibility.length > 0
      ? perItemEligibility.reduce((sum, item) => sum + item.restockingFee, 0)
      : Math.round(requestedAmount * (effectiveRestockingPercent / 100));

    const netRefundAmount = overallEligible
      ? Math.max(0, maxRefundAmount - totalRestockingFee)
      : 0;

    // --- Deadline ---
    const deadline = this.calculateDeadline(purchaseDate, effectiveWindowDays);

    // --- Conditions ---
    const conditions = this.gatherConditions(params, policy);

    // --- Auto-approve decision ---
    const riskLevel = this.assessRiskLevel(resolvedHistory);
    const autoApproved =
      overallEligible &&
      netRefundAmount <= policy.globalLimits.autoApproveThreshold &&
      riskLevel !== 'high';

    return {
      eligible: overallEligible,
      policy: {
        returnWindowDays: effectiveWindowDays,
        daysRemaining,
        restockingFeePercent: effectiveRestockingPercent,
        exchangeOnly: effectiveExchangeOnly,
        finalSale: effectiveFinalSale,
      },
      perItemEligibility,
      customerHistory: resolvedHistory,
      maxRefundAmount,
      restockingFee: totalRestockingFee,
      netRefundAmount,
      deadline,
      conditions,
      autoApproved,
    };
  }

  // ---- Private helpers ----

  private evaluateItems(
    params: CheckEligibilityParams,
    policy: MerchantPolicy,
    daysElapsed: number,
  ): ItemEligibility[] {
    if (!params.items || params.items.length === 0) {
      return [];
    }

    return params.items.map((item) => {
      const rule = findMatchingRule(policy.rules, item.category);
      const windowDays = rule?.returnWindowDays ?? policy.defaultReturnWindowDays;
      const restockingPercent =
        rule?.restockingFeePercent ?? policy.defaultRestockingFeePercent;

      // Final sale — not eligible
      if (rule?.finalSale) {
        return {
          sku: item.sku,
          eligible: false,
          reason: 'Item is final sale and cannot be returned',
          restockingFee: 0,
        };
      }

      // Return window expired
      if (daysElapsed > windowDays) {
        return {
          sku: item.sku,
          eligible: false,
          reason: `Return window expired (${windowDays} days)`,
          restockingFee: 0,
        };
      }

      // Exchange only
      if (rule?.exchangeOnly) {
        const itemAmount = item.amount ?? 0;
        const fee = Math.round(itemAmount * (restockingPercent / 100));
        return {
          sku: item.sku,
          eligible: true,
          reason: 'Eligible for exchange only',
          restockingFee: fee,
        };
      }

      // Eligible
      const itemAmount = item.amount ?? 0;
      const fee = Math.round(itemAmount * (restockingPercent / 100));
      return {
        sku: item.sku,
        eligible: true,
        reason: 'Eligible for refund',
        restockingFee: fee,
      };
    });
  }

  private isCustomerLimitReached(
    history: CustomerHistory | null,
    policy: MerchantPolicy,
  ): boolean {
    if (!history) {
      return false;
    }

    if (history.totalReturns30d >= policy.globalLimits.maxReturnsPerCustomer30d) {
      return true;
    }

    if (
      history.totalReturnValue90d >=
      policy.globalLimits.maxReturnValuePerCustomer90d
    ) {
      return true;
    }

    return false;
  }

  private sumItemAmounts(params: CheckEligibilityParams): number {
    if (!params.items) {
      return 0;
    }
    return params.items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  }

  private sumEligibleItemAmounts(
    params: CheckEligibilityParams,
    eligibility: ItemEligibility[],
  ): number {
    if (!params.items) {
      return 0;
    }
    return params.items.reduce((sum, item, index) => {
      if (eligibility[index]?.eligible) {
        return sum + (item.amount ?? 0);
      }
      return sum;
    }, 0);
  }

  private calculateDeadline(
    purchaseDate: Date,
    windowDays: number,
  ): string | null {
    if (windowDays <= 0) {
      return null;
    }
    const deadline = new Date(
      purchaseDate.getTime() + windowDays * MS_PER_DAY,
    );
    return deadline.toISOString();
  }

  private gatherConditions(
    params: CheckEligibilityParams,
    policy: MerchantPolicy,
  ): string[] {
    const conditions: Set<string> = new Set();

    if (!params.items) {
      return [];
    }

    for (const item of params.items) {
      const rule = findMatchingRule(policy.rules, item.category);
      if (rule) {
        for (const condition of rule.conditions) {
          conditions.add(condition);
        }
      }
    }

    return Array.from(conditions);
  }

  private assessRiskLevel(
    history: CustomerHistory | null,
  ): 'low' | 'medium' | 'high' {
    if (!history) {
      return 'low';
    }

    if (history.limitReached) {
      return 'high';
    }

    if (history.totalReturns30d >= 3 || history.totalReturns90d >= 8) {
      return 'medium';
    }

    return 'low';
  }
}
