import type {
  PaymentProcessor,
  RefundParams,
  ProcessorRefundResult,
  ProcessorStatus,
  ProcessorCancelResult,
  TransactionInfo,
  ProcessorMetadata,
  ProcessorCapabilities,
} from '../types/processor.js';

export class SquareProcessor implements PaymentProcessor {
  readonly name = 'square';
  private readonly accessToken: string;
  private readonly environment: 'sandbox' | 'production';
  private readonly baseUrl: string;

  constructor(config: { accessToken: string; environment?: 'sandbox' | 'production' }) {
    this.accessToken = config.accessToken;
    this.environment = config.environment ?? 'sandbox';
    this.baseUrl = this.environment === 'production'
      ? 'https://connect.squareup.com/v2'
      : 'https://connect.squareupsandbox.com/v2';
  }

  async processRefund(params: RefundParams): Promise<ProcessorRefundResult> {
    const idempotencyKey = `rk_${params.transactionId}_${Date.now()}`;
    const response = await fetch(`${this.baseUrl}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        payment_id: params.transactionId,
        amount_money: {
          amount: params.amount,
          currency: params.currency.toUpperCase(),
        },
        reason: params.reason,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { errors?: Array<{ detail: string }> };
      throw new Error(error.errors?.[0]?.detail ?? `Square API error: ${response.status}`);
    }

    const data = await response.json() as { refund: { id: string; status: string } };
    return {
      externalRefundId: data.refund.id,
      status: this.mapStatus(data.refund.status),
      processedAt: new Date().toISOString(),
    };
  }

  async getRefundStatus(externalId: string): Promise<ProcessorStatus> {
    const response = await fetch(`${this.baseUrl}/refunds/${externalId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Square-Version': '2024-01-18',
      },
    });

    if (!response.ok) {
      throw new Error(`Square API error: ${response.status}`);
    }

    const data = await response.json() as { refund: { id: string; status: string } };
    return {
      externalRefundId: data.refund.id,
      status: this.mapStatus(data.refund.status),
      updatedAt: new Date().toISOString(),
    };
  }

  async cancelRefund(_externalId: string): Promise<ProcessorCancelResult> {
    // Square doesn't support cancelling refunds once initiated
    return {
      cancelled: false,
      cancelledAt: null,
    };
  }

  async validateTransaction(transactionId: string): Promise<TransactionInfo> {
    const response = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Square-Version': '2024-01-18',
      },
    });

    if (!response.ok) {
      throw new Error(`Square API error: ${response.status}`);
    }

    const data = await response.json() as {
      payment: { id: string; amount_money: { amount: number; currency: string }; status: string };
    };
    return {
      transactionId: data.payment.id,
      amount: data.payment.amount_money.amount,
      currency: data.payment.amount_money.currency.toLowerCase(),
      processor: 'square',
      valid: data.payment.status === 'COMPLETED',
    };
  }

  getMetadata(): ProcessorMetadata {
    return {
      name: 'square',
      version: '2024-01-18',
      supportedCurrencies: ['usd', 'cad', 'gbp', 'eur', 'aud', 'jpy'],
      webhookSupport: true,
    };
  }

  getCapabilities(): ProcessorCapabilities {
    return {
      splitRefund: false,
      partialRefund: true,
      storeCredit: false,
      asyncProcessing: true,
    };
  }

  private mapStatus(status: string): ProcessorRefundResult['status'] {
    switch (status) {
      case 'COMPLETED': return 'completed';
      case 'PENDING': return 'processing';
      case 'REJECTED':
      case 'FAILED': return 'failed';
      default: return 'pending';
    }
  }
}
