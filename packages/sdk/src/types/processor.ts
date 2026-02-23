export interface ProcessorConfig {
  name: string;
  credentials: Record<string, string>;
}

export interface RefundParams {
  transactionId: string;
  amount: number;
  currency: string;
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessorRefundResult {
  externalRefundId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt: string;
}

export interface ProcessorStatus {
  externalRefundId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  updatedAt: string;
}

export interface ProcessorCancelResult {
  cancelled: boolean;
  cancelledAt: string | null;
}

export interface TransactionInfo {
  transactionId: string;
  amount: number;
  currency: string;
  processor: string;
  valid: boolean;
}

export interface PaymentProcessor {
  name: string;
  processRefund(params: RefundParams): Promise<ProcessorRefundResult>;
  getRefundStatus(externalId: string): Promise<ProcessorStatus>;
  cancelRefund(externalId: string): Promise<ProcessorCancelResult>;
  validateTransaction(transactionId: string): Promise<TransactionInfo>;
}

export interface ProcessorMetadata {
  name: string;
  version: string;
  supportedCurrencies: string[];
  maxRefundAmount?: number;
  webhookSupport: boolean;
}

export interface ProcessorCapabilities {
  splitRefund: boolean;
  partialRefund: boolean;
  storeCredit: boolean;
  asyncProcessing: boolean;
}

export interface SplitRefundParams {
  orderId: string;
  splits: Array<{
    processorName: string;
    amount: number;
    paymentMethodId: string;
  }>;
  reason: string;
  currency: string;
}

export interface SplitRefundResult {
  orderId: string;
  splits: Array<{
    processorName: string;
    result: ProcessorRefundResult;
  }>;
  totalRefunded: number;
  allSucceeded: boolean;
}
