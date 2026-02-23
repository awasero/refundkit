import type {
  PaymentProcessor,
  ProcessorMetadata,
  RefundParams,
  ProcessorRefundResult,
  SplitRefundParams,
  SplitRefundResult,
} from '../types/processor.js';

export class ProcessorRouter {
  private readonly processors = new Map<string, PaymentProcessor>();
  private defaultProcessor: string | null = null;

  register(processor: PaymentProcessor): void {
    this.processors.set(processor.name, processor);
    if (!this.defaultProcessor) {
      this.defaultProcessor = processor.name;
    }
  }

  setDefault(processorName: string): void {
    if (!this.processors.has(processorName)) {
      throw new Error(`Processor "${processorName}" is not registered`);
    }
    this.defaultProcessor = processorName;
  }

  route(processorName?: string, paymentMethodId?: string): PaymentProcessor {
    // Explicit processor name
    if (processorName) {
      const processor = this.processors.get(processorName);
      if (!processor) {
        throw new Error(`Processor "${processorName}" is not registered`);
      }
      return processor;
    }

    // Detect from payment method ID prefix
    if (paymentMethodId) {
      const detected = this.detectProcessor(paymentMethodId);
      if (detected) return detected;
    }

    // Fallback to default
    if (this.defaultProcessor) {
      return this.processors.get(this.defaultProcessor)!;
    }

    throw new Error('No processor available. Register at least one processor.');
  }

  async splitRefund(params: SplitRefundParams): Promise<SplitRefundResult> {
    const results: SplitRefundResult['splits'] = [];
    let totalRefunded = 0;
    let allSucceeded = true;

    for (const split of params.splits) {
      const processor = this.route(split.processorName);
      try {
        const result = await processor.processRefund({
          transactionId: split.paymentMethodId,
          amount: split.amount,
          currency: params.currency,
          reason: params.reason,
        });
        results.push({ processorName: split.processorName, result });
        if (result.status === 'completed' || result.status === 'processing') {
          totalRefunded += split.amount;
        } else {
          allSucceeded = false;
        }
      } catch {
        allSucceeded = false;
        results.push({
          processorName: split.processorName,
          result: {
            externalRefundId: '',
            status: 'failed',
            processedAt: new Date().toISOString(),
          },
        });
      }
    }

    return {
      orderId: params.orderId,
      splits: results,
      totalRefunded,
      allSucceeded,
    };
  }

  getAvailableProcessors(): ProcessorMetadata[] {
    return Array.from(this.processors.values()).map((p) => {
      if ('getMetadata' in p && typeof (p as any).getMetadata === 'function') {
        return (p as any).getMetadata() as ProcessorMetadata;
      }
      return {
        name: p.name,
        version: 'unknown',
        supportedCurrencies: [],
        webhookSupport: false,
      };
    });
  }

  private detectProcessor(paymentMethodId: string): PaymentProcessor | null {
    // Stripe payment methods: pm_, pi_, ch_, re_
    if (/^(pm_|pi_|ch_|re_)/.test(paymentMethodId)) {
      return this.processors.get('stripe') ?? null;
    }
    // Square payment IDs are UUIDs or start with specific patterns
    if (/^[A-Za-z0-9]{20,}$/.test(paymentMethodId) && this.processors.has('square')) {
      return this.processors.get('square') ?? null;
    }
    return null;
  }
}
