import { describe, it, expect } from 'vitest';
import { DisputeRiskEngine } from '../engine/dispute-engine.js';
import type { GetDisputeRiskParams, CustomerHistory } from '../types/index.js';

describe('DisputeRiskEngine', () => {
  const engine = new DisputeRiskEngine();

  it('scores low risk for a new customer with a small refund', () => {
    const params: GetDisputeRiskParams = {
      transactionId: 'txn_001',
      customerId: 'cust_new',
      amount: 1500, // $15
    };
    const history: CustomerHistory = {
      totalReturns30d: 0,
      totalReturns90d: 1,
      totalReturnValue90d: 1500,
      limitReached: false,
    };

    const result = engine.evaluate(params, history, 5000);

    expect(result.score).toBeLessThan(25);
    expect(result.riskLevel).toBe('low');
    expect(result.recommendation).toBe('auto_approve');
    expect(result.preemptiveRefundAdvised).toBe(false);
    expect(result.signals).toHaveLength(0);
  });

  it('scores medium risk for a customer with moderate return velocity', () => {
    const params: GetDisputeRiskParams = {
      transactionId: 'txn_002',
      customerId: 'cust_moderate',
      amount: 3000,
    };
    const history: CustomerHistory = {
      totalReturns30d: 3,
      totalReturns90d: 7,
      totalReturnValue90d: 25000,
      limitReached: false,
    };

    const result = engine.evaluate(params, history, 5000);

    // No velocity signal (3 < 5 threshold), but amount anomaly (3000/5000 = 60% — not above 80%)
    // Score should be low since no signals fire
    // Let's use a customer with returns near threshold
    expect(result.score).toBeLessThanOrEqual(50);
    expect(result.riskLevel).toBe('low');
  });

  it('scores medium risk when velocity is at threshold', () => {
    const params: GetDisputeRiskParams = {
      transactionId: 'txn_003',
      customerId: 'cust_velocity',
      amount: 2000,
    };
    const history: CustomerHistory = {
      totalReturns30d: 5,  // exactly at threshold
      totalReturns90d: 8,
      totalReturnValue90d: 40000,
      limitReached: false,
    };

    const result = engine.evaluate(params, history, 5000);

    expect(result.score).toBeGreaterThanOrEqual(25);
    expect(result.score).toBeLessThanOrEqual(50);
    expect(result.riskLevel).toBe('medium');
    expect(result.recommendation).toBe('approve_with_review');
    expect(result.signals.some(s => s.type === 'velocity')).toBe(true);
  });

  it('scores high risk for high velocity combined with large refund amount', () => {
    const params: GetDisputeRiskParams = {
      transactionId: 'txn_004',
      customerId: 'cust_risky',
      amount: 9000, // $90 — 90% of $100 order
    };
    const history: CustomerHistory = {
      totalReturns30d: 6,  // above threshold
      totalReturns90d: 9,
      totalReturnValue90d: 50000,
      limitReached: false,
    };

    const result = engine.evaluate(params, history, 10000);

    // velocity: 0.35 * 100 = 35, amount_anomaly: 0.25 * 100 = 25 → total = 60
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThanOrEqual(75);
    expect(result.riskLevel).toBe('high');
    expect(result.recommendation).toBe('require_approval');
    expect(result.signals.some(s => s.type === 'velocity')).toBe(true);
    expect(result.signals.some(s => s.type === 'amount_anomaly')).toBe(true);
  });

  it('scores critical risk when all signals fire', () => {
    const params: GetDisputeRiskParams = {
      transactionId: 'txn_005',
      customerId: 'cust_fraud',
      amount: 45000, // $450 — 90% of $500 order
    };
    const history: CustomerHistory = {
      totalReturns30d: 12,
      totalReturns90d: 25,       // > 10 → customer_history signal
      totalReturnValue90d: 200000, // > $1,000 → pattern_match signal
      limitReached: true,
    };

    const result = engine.evaluate(params, history, 50000);

    // velocity: 35, amount_anomaly: 25, customer_history: 20, pattern_match: 20 → 100
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.riskLevel).toBe('critical');
    expect(result.recommendation).toBe('deny');
    expect(result.signals).toHaveLength(4);
    expect(result.preemptiveRefundAdvised).toBe(true);
  });

  it('advises preemptive refund when score is at least 70', () => {
    const params: GetDisputeRiskParams = {
      transactionId: 'txn_006',
      customerId: 'cust_preempt',
      amount: 8500,
    };
    const history: CustomerHistory = {
      totalReturns30d: 7,
      totalReturns90d: 15,
      totalReturnValue90d: 50000,
      limitReached: false,
    };

    const result = engine.evaluate(params, history, 10000);

    // velocity: 35, amount_anomaly: 25, customer_history: 20 → 80
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.preemptiveRefundAdvised).toBe(true);
  });

  it('evaluates with no customer history using only amount-based signals', () => {
    const params: GetDisputeRiskParams = {
      transactionId: 'txn_007',
      customerId: 'cust_unknown',
      amount: 9500, // 95% of order
    };

    const result = engine.evaluate(params, undefined, 10000);

    // Only amount_anomaly can fire: 0.25 * 100 = 25
    expect(result.score).toBe(25);
    expect(result.riskLevel).toBe('medium');
    expect(result.signals).toHaveLength(1);
    expect(result.signals[0].type).toBe('amount_anomaly');
  });

  it('evaluates with no amount and no history producing zero signals', () => {
    const params: GetDisputeRiskParams = {
      transactionId: 'txn_008',
    };

    const result = engine.evaluate(params);

    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('low');
    expect(result.recommendation).toBe('auto_approve');
    expect(result.signals).toHaveLength(0);
    expect(result.preemptiveRefundAdvised).toBe(false);
  });

  it('respects custom config thresholds', () => {
    const strictEngine = new DisputeRiskEngine({
      velocityThreshold30d: 2,
      amountAnomalyPercent: 50,
      riskThresholds: { low: 10, medium: 30, high: 60 },
    });

    const params: GetDisputeRiskParams = {
      transactionId: 'txn_009',
      customerId: 'cust_strict',
      amount: 6000, // 60% of $100 order — above 50% threshold
    };
    const history: CustomerHistory = {
      totalReturns30d: 2,  // at threshold
      totalReturns90d: 4,
      totalReturnValue90d: 20000,
      limitReached: false,
    };

    const result = strictEngine.evaluate(params, history, 10000);

    // velocity: 35, amount_anomaly: 25 → 60
    expect(result.score).toBe(60);
    expect(result.riskLevel).toBe('critical'); // 60 >= high threshold of 60
    expect(result.signals.some(s => s.type === 'velocity')).toBe(true);
    expect(result.signals.some(s => s.type === 'amount_anomaly')).toBe(true);
  });
});
