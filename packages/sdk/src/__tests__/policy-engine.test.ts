import { describe, it, expect } from 'vitest';
import { PolicyEngine, findMatchingRule } from '../engine/policy-engine.js';
import type {
  MerchantPolicy,
  CheckEligibilityParams,
  CustomerHistory,
} from '../types/index.js';

const MOCK_POLICY: MerchantPolicy = {
  id: 'pol_test',
  merchantId: 'merch_test',
  name: 'Test Policy',
  rules: [
    {
      category: 'clothing',
      returnWindowDays: 30,
      restockingFeePercent: 0,
      exchangeOnly: false,
      finalSale: false,
      conditions: ['tags_attached'],
    },
    {
      category: 'electronics',
      returnWindowDays: 15,
      restockingFeePercent: 15,
      exchangeOnly: false,
      finalSale: false,
      conditions: ['original_packaging'],
    },
    {
      category: 'sale',
      finalSale: true,
      returnWindowDays: 0,
      restockingFeePercent: 0,
      exchangeOnly: false,
      conditions: [],
    },
  ],
  globalLimits: {
    maxReturnsPerCustomer30d: 5,
    maxReturnValuePerCustomer90d: 100000,
    autoApproveThreshold: 5000,
  },
  defaultReturnWindowDays: 30,
  defaultRestockingFeePercent: 0,
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

describe('PolicyEngine', () => {
  const engine = new PolicyEngine();

  describe('basic eligible refund', () => {
    it('approves a clothing refund within the 30-day return window', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_001',
        amount: 2500,
        items: [
          { sku: 'SKU-SHIRT', category: 'clothing', quantity: 1, amount: 2500 },
        ],
      };

      const result = engine.evaluate(params, MOCK_POLICY, daysAgo(10));

      expect(result.eligible).toBe(true);
      expect(result.policy.returnWindowDays).toBe(30);
      expect(result.policy.daysRemaining).toBeGreaterThan(0);
      expect(result.policy.restockingFeePercent).toBe(0);
      expect(result.restockingFee).toBe(0);
      expect(result.netRefundAmount).toBe(2500);
      expect(result.maxRefundAmount).toBe(2500);
      expect(result.perItemEligibility).toHaveLength(1);
      expect(result.perItemEligibility[0].eligible).toBe(true);
      expect(result.conditions).toContain('tags_attached');
    });
  });

  describe('return window expired', () => {
    it('rejects a clothing refund after the 30-day window', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_002',
        amount: 3000,
        items: [
          { sku: 'SKU-JACKET', category: 'clothing', quantity: 1, amount: 3000 },
        ],
      };

      const result = engine.evaluate(params, MOCK_POLICY, daysAgo(35));

      expect(result.eligible).toBe(false);
      expect(result.perItemEligibility[0].eligible).toBe(false);
      expect(result.perItemEligibility[0].reason).toContain('expired');
      expect(result.netRefundAmount).toBe(0);
    });
  });

  describe('final sale item', () => {
    it('rejects a sale-category item marked as final sale', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_003',
        amount: 1500,
        items: [
          { sku: 'SKU-SALE-ITEM', category: 'sale', quantity: 1, amount: 1500 },
        ],
      };

      const result = engine.evaluate(params, MOCK_POLICY, daysAgo(1));

      expect(result.eligible).toBe(false);
      expect(result.perItemEligibility[0].eligible).toBe(false);
      expect(result.perItemEligibility[0].reason).toContain('final sale');
      expect(result.netRefundAmount).toBe(0);
    });
  });

  describe('partial eligibility — multi-item order', () => {
    it('marks one item eligible and one final-sale item ineligible', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_004',
        amount: 5000,
        items: [
          { sku: 'SKU-SHIRT', category: 'clothing', quantity: 1, amount: 3000 },
          { sku: 'SKU-SALE', category: 'sale', quantity: 1, amount: 2000 },
        ],
      };

      const result = engine.evaluate(params, MOCK_POLICY, daysAgo(5));

      expect(result.eligible).toBe(true);
      expect(result.perItemEligibility).toHaveLength(2);
      expect(result.perItemEligibility[0].eligible).toBe(true);
      expect(result.perItemEligibility[1].eligible).toBe(false);
      // Only the eligible item's amount counts toward the refund
      expect(result.maxRefundAmount).toBe(3000);
      expect(result.netRefundAmount).toBe(3000);
    });
  });

  describe('restocking fee calculation', () => {
    it('applies a 15% restocking fee on an electronics item', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_005',
        amount: 10000,
        items: [
          { sku: 'SKU-LAPTOP', category: 'electronics', quantity: 1, amount: 10000 },
        ],
      };

      const result = engine.evaluate(params, MOCK_POLICY, daysAgo(5));

      expect(result.eligible).toBe(true);
      expect(result.policy.restockingFeePercent).toBe(15);
      expect(result.restockingFee).toBe(1500); // 15% of 10000
      expect(result.netRefundAmount).toBe(8500); // 10000 - 1500
      expect(result.perItemEligibility[0].restockingFee).toBe(1500);
      expect(result.conditions).toContain('original_packaging');
    });
  });

  describe('customer limit reached', () => {
    it('rejects the refund when customer has exceeded 30-day return count', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_006',
        amount: 2000,
        items: [
          { sku: 'SKU-HAT', category: 'clothing', quantity: 1, amount: 2000 },
        ],
        customerId: 'cust_abuser',
      };

      const customerHistory: CustomerHistory = {
        totalReturns30d: 5,
        totalReturns90d: 12,
        totalReturnValue90d: 50000,
        limitReached: true,
      };

      const result = engine.evaluate(
        params,
        MOCK_POLICY,
        daysAgo(3),
        customerHistory,
      );

      expect(result.eligible).toBe(false);
      expect(result.customerHistory).not.toBeNull();
      expect(result.customerHistory!.limitReached).toBe(true);
      expect(result.netRefundAmount).toBe(0);
    });
  });

  describe('auto-approve under threshold', () => {
    it('auto-approves a small refund under the $50 threshold', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_007',
        amount: 2500,
        items: [
          { sku: 'SKU-SOCKS', category: 'clothing', quantity: 1, amount: 2500 },
        ],
      };

      const result = engine.evaluate(params, MOCK_POLICY, daysAgo(5));

      expect(result.eligible).toBe(true);
      expect(result.autoApproved).toBe(true);
      // Net refund is 2500, which is <= autoApproveThreshold of 5000
      expect(result.netRefundAmount).toBeLessThanOrEqual(
        MOCK_POLICY.globalLimits.autoApproveThreshold,
      );
    });
  });

  describe('requires review over threshold', () => {
    it('does not auto-approve when net amount exceeds autoApproveThreshold', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_008',
        amount: 8000,
        items: [
          { sku: 'SKU-COAT', category: 'clothing', quantity: 1, amount: 8000 },
        ],
      };

      const result = engine.evaluate(params, MOCK_POLICY, daysAgo(5));

      expect(result.eligible).toBe(true);
      expect(result.autoApproved).toBe(false);
      expect(result.netRefundAmount).toBeGreaterThan(
        MOCK_POLICY.globalLimits.autoApproveThreshold,
      );
    });
  });

  describe('exchange-only category', () => {
    it('marks an exchange-only item as eligible with exchange-only reason', () => {
      const exchangePolicy: MerchantPolicy = {
        ...MOCK_POLICY,
        rules: [
          ...MOCK_POLICY.rules,
          {
            category: 'underwear',
            returnWindowDays: 14,
            restockingFeePercent: 0,
            exchangeOnly: true,
            finalSale: false,
            conditions: ['unworn'],
          },
        ],
      };

      const params: CheckEligibilityParams = {
        transactionId: 'txn_009',
        amount: 1500,
        items: [
          { sku: 'SKU-BOXERS', category: 'underwear', quantity: 1, amount: 1500 },
        ],
      };

      const result = engine.evaluate(params, exchangePolicy, daysAgo(7));

      expect(result.eligible).toBe(true);
      expect(result.policy.exchangeOnly).toBe(true);
      expect(result.perItemEligibility[0].eligible).toBe(true);
      expect(result.perItemEligibility[0].reason).toContain('exchange only');
      expect(result.conditions).toContain('unworn');
    });
  });

  describe('default rules when no category match', () => {
    it('uses policy defaults for an unknown category', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_010',
        amount: 4000,
        items: [
          { sku: 'SKU-MYSTERY', category: 'home_goods', quantity: 1, amount: 4000 },
        ],
      };

      const result = engine.evaluate(params, MOCK_POLICY, daysAgo(20));

      expect(result.eligible).toBe(true);
      // Should fall back to policy defaults: 30-day window, 0% restocking
      expect(result.perItemEligibility[0].eligible).toBe(true);
      expect(result.perItemEligibility[0].restockingFee).toBe(0);
      expect(result.netRefundAmount).toBe(4000);
    });

    it('rejects unknown category when past default return window', () => {
      const params: CheckEligibilityParams = {
        transactionId: 'txn_011',
        amount: 4000,
        items: [
          { sku: 'SKU-MYSTERY', category: 'home_goods', quantity: 1, amount: 4000 },
        ],
      };

      const result = engine.evaluate(params, MOCK_POLICY, daysAgo(35));

      expect(result.eligible).toBe(false);
      expect(result.perItemEligibility[0].eligible).toBe(false);
      expect(result.perItemEligibility[0].reason).toContain('expired');
    });
  });
});

describe('findMatchingRule', () => {
  it('returns the matching rule for a known category', () => {
    const rule = findMatchingRule(MOCK_POLICY.rules, 'clothing');
    expect(rule).not.toBeNull();
    expect(rule!.category).toBe('clothing');
    expect(rule!.returnWindowDays).toBe(30);
  });

  it('returns null for an unknown category', () => {
    const rule = findMatchingRule(MOCK_POLICY.rules, 'furniture');
    expect(rule).toBeNull();
  });

  it('performs case-insensitive matching', () => {
    const rule = findMatchingRule(MOCK_POLICY.rules, 'Electronics');
    expect(rule).not.toBeNull();
    expect(rule!.category).toBe('electronics');
  });
});
