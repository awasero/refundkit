import type {
  DisputeRisk,
  RiskLevel,
  DisputeSignal,
  DisputeRecommendation,
  GetDisputeRiskParams,
  CustomerHistory,
} from '../types/index.js';

export interface DisputeEngineConfig {
  /** Max returns in 30 days before flagging (default: 5) */
  velocityThreshold30d: number;
  /** Flag if refund > X% of order value (default: 80) */
  amountAnomalyPercent: number;
  /** Score boundaries for risk levels */
  riskThresholds: { low: number; medium: number; high: number };
}

const DEFAULT_CONFIG: DisputeEngineConfig = {
  velocityThreshold30d: 5,
  amountAnomalyPercent: 80,
  riskThresholds: { low: 25, medium: 50, high: 75 },
};

const GLOBAL_RETURN_VALUE_THRESHOLD = 100_000; // cents — $1,000

export class DisputeRiskEngine {
  private readonly config: DisputeEngineConfig;

  constructor(config?: Partial<DisputeEngineConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      riskThresholds: {
        ...DEFAULT_CONFIG.riskThresholds,
        ...config?.riskThresholds,
      },
    };
  }

  evaluate(
    params: GetDisputeRiskParams,
    customerHistory?: CustomerHistory,
    orderAmount?: number,
  ): DisputeRisk {
    const signals: DisputeSignal[] = this.buildSignals(params, customerHistory, orderAmount);
    const score = this.calculateScore(signals);
    const riskLevel = this.mapScoreToRiskLevel(score);
    const recommendation = this.mapRiskToRecommendation(riskLevel);
    const preemptiveRefundAdvised = score >= 70;

    return {
      transactionId: params.transactionId,
      customerId: params.customerId ?? null,
      riskLevel,
      score,
      signals,
      recommendation,
      preemptiveRefundAdvised,
      evaluatedAt: new Date().toISOString(),
    };
  }

  private buildSignals(
    params: GetDisputeRiskParams,
    customerHistory?: CustomerHistory,
    orderAmount?: number,
  ): DisputeSignal[] {
    const signals: DisputeSignal[] = [];

    // 1. Velocity check — high return frequency in last 30 days
    if (customerHistory && customerHistory.totalReturns30d >= this.config.velocityThreshold30d) {
      signals.push({
        type: 'velocity',
        description: `Customer has ${customerHistory.totalReturns30d} returns in the last 30 days (threshold: ${this.config.velocityThreshold30d})`,
        weight: 0.35,
      });
    }

    // 2. Amount anomaly — refund is disproportionately large relative to order
    if (
      params.amount !== undefined &&
      orderAmount !== undefined &&
      orderAmount > 0 &&
      (params.amount / orderAmount) > (this.config.amountAnomalyPercent / 100)
    ) {
      const percent = Math.round((params.amount / orderAmount) * 100);
      signals.push({
        type: 'amount_anomaly',
        description: `Refund amount is ${percent}% of order value (threshold: ${this.config.amountAnomalyPercent}%)`,
        weight: 0.25,
      });
    }

    // 3. Customer history — high return count in 90 days
    if (customerHistory && customerHistory.totalReturns90d > 10) {
      signals.push({
        type: 'customer_history',
        description: `Customer has ${customerHistory.totalReturns90d} returns in the last 90 days`,
        weight: 0.2,
      });
    }

    // 4. Pattern match — total return value exceeds global limits
    if (customerHistory && customerHistory.totalReturnValue90d > GLOBAL_RETURN_VALUE_THRESHOLD) {
      signals.push({
        type: 'pattern_match',
        description: `Total return value ($${(customerHistory.totalReturnValue90d / 100).toFixed(2)}) exceeds threshold ($${(GLOBAL_RETURN_VALUE_THRESHOLD / 100).toFixed(2)})`,
        weight: 0.2,
      });
    }

    return signals;
  }

  private calculateScore(signals: DisputeSignal[]): number {
    const raw = signals.reduce((sum, signal) => sum + signal.weight * 100, 0);
    return Math.min(Math.round(raw), 100);
  }

  private mapScoreToRiskLevel(score: number): RiskLevel {
    const { low, medium, high } = this.config.riskThresholds;

    if (score >= high) return 'critical';
    if (score >= medium) return 'high';
    if (score >= low) return 'medium';
    return 'low';
  }

  private mapRiskToRecommendation(riskLevel: RiskLevel): DisputeRecommendation {
    switch (riskLevel) {
      case 'low':
        return 'auto_approve';
      case 'medium':
        return 'approve_with_review';
      case 'high':
        return 'require_approval';
      case 'critical':
        return 'deny';
    }
  }
}
