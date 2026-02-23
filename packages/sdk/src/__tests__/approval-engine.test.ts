import { describe, it, expect } from 'vitest';
import { ApprovalEngine } from '../engine/approval-engine.js';

describe('ApprovalEngine', () => {
  const engine = new ApprovalEngine();

  it('auto-approves a small amount with low risk', () => {
    const result = engine.evaluate(1000, 'low'); // $10

    expect(result.autoApproved).toBe(true);
    expect(result.requiresApproval).toBe(false);
    expect(result.autoRejected).toBe(false);
    expect(result.trigger).toBeNull();
  });

  it('auto-approves a medium amount under threshold with low risk', () => {
    const result = engine.evaluate(4000, 'low'); // $40 — under $50 autoApproveBelow

    expect(result.autoApproved).toBe(true);
    expect(result.requiresApproval).toBe(false);
    expect(result.autoRejected).toBe(false);
    expect(result.trigger).toBeNull();
  });

  it('requires review for a large amount with low risk', () => {
    const result = engine.evaluate(25000, 'low'); // $250 — above $200 requireReviewAbove

    expect(result.requiresApproval).toBe(true);
    expect(result.autoApproved).toBe(false);
    expect(result.autoRejected).toBe(false);
    expect(result.trigger).toBe('amount_threshold');
  });

  it('requires approval for any amount when risk is high', () => {
    const result = engine.evaluate(1000, 'high'); // $10, high risk

    expect(result.requiresApproval).toBe(true);
    expect(result.autoApproved).toBe(false);
    expect(result.autoRejected).toBe(false);
    expect(result.trigger).toBe('risk_score');
  });

  it('auto-rejects when risk is critical', () => {
    const result = engine.evaluate(500, 'critical'); // $5, critical risk

    expect(result.autoRejected).toBe(true);
    expect(result.autoApproved).toBe(false);
    expect(result.requiresApproval).toBe(false);
    expect(result.trigger).toBe('risk_score');
  });

  it('uses custom thresholds to override defaults', () => {
    const customThresholds = {
      autoApproveBelow: 10000,   // $100
      requireReviewAbove: 50000, // $500
    };

    // $80 — would require review with defaults, but auto-approves with custom threshold
    const result = engine.evaluate(8000, 'low', undefined, customThresholds);

    expect(result.autoApproved).toBe(true);
    expect(result.requiresApproval).toBe(false);
    expect(result.trigger).toBeNull();
  });

  it('accepts category parameter for future category-based triggers', () => {
    const result = engine.evaluate(1000, 'low', 'electronics');

    // Category is accepted but does not yet affect logic
    expect(result.autoApproved).toBe(true);
    expect(result.requiresApproval).toBe(false);
    expect(result.trigger).toBeNull();
    expect(result.reason).toBeTruthy();
  });

  it('auto-approves amounts between autoApproveBelow and requireReviewAbove', () => {
    const result = engine.evaluate(10000, 'low'); // $100 — between $50 and $200

    expect(result.autoApproved).toBe(true);
    expect(result.requiresApproval).toBe(false);
    expect(result.autoRejected).toBe(false);
    expect(result.trigger).toBeNull();
  });

  it('auto-rejects when amount exceeds custom autoRejectAbove threshold', () => {
    const customThresholds = {
      autoRejectAbove: 100000, // $1,000
    };

    const result = engine.evaluate(150000, 'low', undefined, customThresholds); // $1,500

    expect(result.autoRejected).toBe(true);
    expect(result.autoApproved).toBe(false);
    expect(result.trigger).toBe('amount_threshold');
  });

  it('critical risk overrides amount even if amount is small', () => {
    const result = engine.evaluate(100, 'critical'); // $1, critical risk

    expect(result.autoRejected).toBe(true);
    expect(result.autoApproved).toBe(false);
    expect(result.requiresApproval).toBe(false);
    expect(result.trigger).toBe('risk_score');
    expect(result.reason).toContain('critical');
  });

  it('high risk overrides auto-approve threshold', () => {
    const result = engine.evaluate(100, 'high'); // $1, high risk

    expect(result.requiresApproval).toBe(true);
    expect(result.autoApproved).toBe(false);
    expect(result.trigger).toBe('risk_score');
  });
});
