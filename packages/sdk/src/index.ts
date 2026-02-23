import { HttpClient } from './client.js';
import { RefundsResource } from './resources/refunds.js';
import { PoliciesResource } from './resources/policies.js';
import type { RefundKitConfig } from './types/config.js';

export class RefundKit {
  readonly refunds: RefundsResource;
  readonly policies: PoliciesResource;

  constructor(config: RefundKitConfig) {
    if (!config.apiKey) {
      throw new Error(
        'API key is required. Get yours at https://app.refundkit.dev/api-keys',
      );
    }

    const client = new HttpClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      timeout: config.timeout,
    });

    this.refunds = new RefundsResource(client);
    this.policies = new PoliciesResource(client);
  }
}

export default RefundKit;

export type {
  RefundKitConfig,
  Refund,
  RefundStatus,
  RefundReason,
  RefundInitiatedBy,
  CreateRefundParams,
  ListRefundsParams,
  RefundPolicy,
  CheckPolicyParams,
  PaymentProcessor,
  ProcessorConfig,
  RefundParams,
  ProcessorRefundResult,
  ProcessorStatus,
  ProcessorCancelResult,
  TransactionInfo,
} from './types/index.js';

export { RefundKitError, ErrorCode } from './errors/index.js';
export type { ApiResponse } from './errors/index.js';

export { StripeProcessor } from './processors/index.js';

export { generateApiKey, hashApiKey, isValidApiKeyFormat, getApiKeyEnvironment } from './utils/crypto.js';
