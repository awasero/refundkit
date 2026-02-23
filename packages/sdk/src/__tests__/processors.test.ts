import { describe, it, expect } from 'vitest';
import { ProcessorRouter } from '../processors/router.js';
import type {
  PaymentProcessor,
  RefundParams,
  ProcessorRefundResult,
  ProcessorStatus,
  ProcessorCancelResult,
  TransactionInfo,
} from '../types/processor.js';

function createMockProcessor(
  name: string,
  overrides?: Partial<PaymentProcessor>,
): PaymentProcessor {
  return {
    name,
    processRefund: async (params: RefundParams): Promise<ProcessorRefundResult> => ({
      externalRefundId: `${name}_ref_${params.transactionId}`,
      status: 'completed',
      processedAt: new Date().toISOString(),
    }),
    getRefundStatus: async (externalId: string): Promise<ProcessorStatus> => ({
      externalRefundId: externalId,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    }),
    cancelRefund: async (_externalId: string): Promise<ProcessorCancelResult> => ({
      cancelled: true,
      cancelledAt: new Date().toISOString(),
    }),
    validateTransaction: async (transactionId: string): Promise<TransactionInfo> => ({
      transactionId,
      amount: 1000,
      currency: 'usd',
      processor: name,
      valid: true,
    }),
    ...overrides,
  };
}

describe('ProcessorRouter', () => {
  describe('register and route by name', () => {
    it('routes to a registered processor by explicit name', () => {
      const router = new ProcessorRouter();
      const mockStripe = createMockProcessor('stripe');
      router.register(mockStripe);

      const result = router.route('stripe');

      expect(result).toBe(mockStripe);
      expect(result.name).toBe('stripe');
    });

    it('routes to correct processor when multiple are registered', () => {
      const router = new ProcessorRouter();
      const mockStripe = createMockProcessor('stripe');
      const mockSquare = createMockProcessor('square');
      router.register(mockStripe);
      router.register(mockSquare);

      expect(router.route('stripe')).toBe(mockStripe);
      expect(router.route('square')).toBe(mockSquare);
    });
  });

  describe('route by payment method prefix', () => {
    it('detects Stripe from pm_ prefix', () => {
      const router = new ProcessorRouter();
      const mockStripe = createMockProcessor('stripe');
      router.register(mockStripe);

      const result = router.route(undefined, 'pm_1234567890');

      expect(result).toBe(mockStripe);
    });

    it('detects Stripe from pi_ prefix', () => {
      const router = new ProcessorRouter();
      const mockStripe = createMockProcessor('stripe');
      router.register(mockStripe);

      const result = router.route(undefined, 'pi_1234567890');

      expect(result).toBe(mockStripe);
    });

    it('detects Stripe from ch_ prefix', () => {
      const router = new ProcessorRouter();
      const mockStripe = createMockProcessor('stripe');
      router.register(mockStripe);

      const result = router.route(undefined, 'ch_1234567890');

      expect(result).toBe(mockStripe);
    });

    it('detects Square from long alphanumeric ID', () => {
      const router = new ProcessorRouter();
      const mockSquare = createMockProcessor('square');
      router.register(mockSquare);

      const result = router.route(undefined, 'AbCdEfGhIjKlMnOpQrStUvWx');

      expect(result).toBe(mockSquare);
    });
  });

  describe('fallback to default processor', () => {
    it('uses the first registered processor as default', () => {
      const router = new ProcessorRouter();
      const mockStripe = createMockProcessor('stripe');
      const mockSquare = createMockProcessor('square');
      router.register(mockStripe);
      router.register(mockSquare);

      const result = router.route();

      expect(result).toBe(mockStripe);
    });

    it('allows overriding the default processor', () => {
      const router = new ProcessorRouter();
      const mockStripe = createMockProcessor('stripe');
      const mockSquare = createMockProcessor('square');
      router.register(mockStripe);
      router.register(mockSquare);
      router.setDefault('square');

      const result = router.route();

      expect(result).toBe(mockSquare);
    });
  });

  describe('error when no processor registered', () => {
    it('throws when routing by name to an unregistered processor', () => {
      const router = new ProcessorRouter();

      expect(() => router.route('paypal')).toThrow(
        'Processor "paypal" is not registered',
      );
    });

    it('throws when no processors are registered and no name given', () => {
      const router = new ProcessorRouter();

      expect(() => router.route()).toThrow(
        'No processor available. Register at least one processor.',
      );
    });

    it('throws when setting default to an unregistered processor', () => {
      const router = new ProcessorRouter();

      expect(() => router.setDefault('stripe')).toThrow(
        'Processor "stripe" is not registered',
      );
    });
  });

  describe('split refund across multiple processors', () => {
    it('processes refunds across two processors', async () => {
      const router = new ProcessorRouter();
      const mockStripe = createMockProcessor('stripe');
      const mockSquare = createMockProcessor('square');
      router.register(mockStripe);
      router.register(mockSquare);

      const result = await router.splitRefund({
        orderId: 'order_123',
        splits: [
          { processorName: 'stripe', amount: 3000, paymentMethodId: 'pm_abc' },
          { processorName: 'square', amount: 2000, paymentMethodId: 'sq_xyz' },
        ],
        reason: 'customer_request',
        currency: 'usd',
      });

      expect(result.orderId).toBe('order_123');
      expect(result.splits).toHaveLength(2);
      expect(result.splits[0].processorName).toBe('stripe');
      expect(result.splits[0].result.status).toBe('completed');
      expect(result.splits[1].processorName).toBe('square');
      expect(result.splits[1].result.status).toBe('completed');
      expect(result.totalRefunded).toBe(5000);
      expect(result.allSucceeded).toBe(true);
    });
  });

  describe('split refund handles partial failures', () => {
    it('marks allSucceeded false when one processor fails', async () => {
      const router = new ProcessorRouter();
      const mockStripe = createMockProcessor('stripe');
      const failingSquare = createMockProcessor('square', {
        processRefund: async () => {
          throw new Error('Square API error: 500');
        },
      });
      router.register(mockStripe);
      router.register(failingSquare);

      const result = await router.splitRefund({
        orderId: 'order_456',
        splits: [
          { processorName: 'stripe', amount: 3000, paymentMethodId: 'pm_abc' },
          { processorName: 'square', amount: 2000, paymentMethodId: 'sq_xyz' },
        ],
        reason: 'defective_product',
        currency: 'usd',
      });

      expect(result.orderId).toBe('order_456');
      expect(result.splits).toHaveLength(2);
      expect(result.splits[0].result.status).toBe('completed');
      expect(result.splits[1].result.status).toBe('failed');
      expect(result.splits[1].result.externalRefundId).toBe('');
      expect(result.totalRefunded).toBe(3000);
      expect(result.allSucceeded).toBe(false);
    });

    it('marks allSucceeded false when processor returns failed status', async () => {
      const router = new ProcessorRouter();
      const failedProcessor = createMockProcessor('stripe', {
        processRefund: async (params: RefundParams): Promise<ProcessorRefundResult> => ({
          externalRefundId: `ref_${params.transactionId}`,
          status: 'failed',
          processedAt: new Date().toISOString(),
        }),
      });
      router.register(failedProcessor);

      const result = await router.splitRefund({
        orderId: 'order_789',
        splits: [
          { processorName: 'stripe', amount: 1000, paymentMethodId: 'pm_abc' },
        ],
        reason: 'duplicate_charge',
        currency: 'usd',
      });

      expect(result.allSucceeded).toBe(false);
      expect(result.totalRefunded).toBe(0);
    });
  });

  describe('getAvailableProcessors', () => {
    it('returns metadata for processors that support it', () => {
      const router = new ProcessorRouter();
      const mockWithMetadata = {
        ...createMockProcessor('stripe'),
        getMetadata: () => ({
          name: 'stripe',
          version: '2024-12-18',
          supportedCurrencies: ['usd', 'eur', 'gbp'],
          webhookSupport: true,
        }),
      };
      router.register(mockWithMetadata);

      const processors = router.getAvailableProcessors();

      expect(processors).toHaveLength(1);
      expect(processors[0].name).toBe('stripe');
      expect(processors[0].version).toBe('2024-12-18');
      expect(processors[0].supportedCurrencies).toContain('usd');
    });

    it('returns fallback metadata for processors without getMetadata', () => {
      const router = new ProcessorRouter();
      const mockBasic = createMockProcessor('basic');
      router.register(mockBasic);

      const processors = router.getAvailableProcessors();

      expect(processors).toHaveLength(1);
      expect(processors[0].name).toBe('basic');
      expect(processors[0].version).toBe('unknown');
      expect(processors[0].supportedCurrencies).toEqual([]);
      expect(processors[0].webhookSupport).toBe(false);
    });
  });
});
