import Stripe from 'stripe';
import type {
  PaymentProcessor,
  RefundParams,
  ProcessorRefundResult,
  ProcessorStatus,
  ProcessorCancelResult,
  TransactionInfo,
} from '../types/processor.js';

export class StripeProcessor implements PaymentProcessor {
  readonly name = 'stripe';
  private readonly client: Stripe;

  constructor(secretKey: string) {
    this.client = new Stripe(secretKey);
  }

  async processRefund(params: RefundParams): Promise<ProcessorRefundResult> {
    const refund = await this.client.refunds.create({
      charge: params.transactionId,
      amount: params.amount,
      reason: this.mapReason(params.reason),
      metadata: params.metadata as Stripe.MetadataParam,
    });

    return {
      externalRefundId: refund.id,
      status: this.mapStatus(refund.status),
      processedAt: new Date().toISOString(),
    };
  }

  async getRefundStatus(externalId: string): Promise<ProcessorStatus> {
    const refund = await this.client.refunds.retrieve(externalId);
    return {
      externalRefundId: refund.id,
      status: this.mapStatus(refund.status),
      updatedAt: new Date().toISOString(),
    };
  }

  async cancelRefund(externalId: string): Promise<ProcessorCancelResult> {
    const refund = await this.client.refunds.cancel(externalId);
    return {
      cancelled: refund.status === 'canceled',
      cancelledAt: refund.status === 'canceled' ? new Date().toISOString() : null,
    };
  }

  async validateTransaction(transactionId: string): Promise<TransactionInfo> {
    const charge = await this.client.charges.retrieve(transactionId);
    return {
      transactionId: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      processor: 'stripe',
      valid: charge.paid && !charge.refunded,
    };
  }

  private mapReason(reason: string): Stripe.RefundCreateParams.Reason | undefined {
    const mapping: Record<string, Stripe.RefundCreateParams.Reason> = {
      duplicate_charge: 'duplicate',
      product_not_received: 'requested_by_customer',
      product_defective: 'requested_by_customer',
      wrong_product: 'requested_by_customer',
    };
    return mapping[reason];
  }

  private mapStatus(status: string | null): ProcessorRefundResult['status'] {
    switch (status) {
      case 'succeeded':
        return 'completed';
      case 'pending':
        return 'processing';
      case 'failed':
        return 'failed';
      case 'canceled':
        return 'failed';
      default:
        return 'pending';
    }
  }
}
