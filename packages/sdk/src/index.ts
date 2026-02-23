import { HttpClient } from './client.js';
import { RefundsResource } from './resources/refunds.js';
import { PoliciesResource } from './resources/policies.js';
import { ReturnsResource } from './resources/returns.js';
import { DisputesResource } from './resources/disputes.js';
import { ApprovalsResource } from './resources/approvals.js';
import { StoreCreditResource } from './resources/store-credit.js';
import type { RefundKitConfig } from './types/config.js';

export class RefundKit {
  readonly refunds: RefundsResource;
  readonly policies: PoliciesResource;
  readonly returns: ReturnsResource;
  readonly disputes: DisputesResource;
  readonly approvals: ApprovalsResource;
  readonly storeCredit: StoreCreditResource;

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
    this.returns = new ReturnsResource(client);
    this.disputes = new DisputesResource(client);
    this.approvals = new ApprovalsResource(client);
    this.storeCredit = new StoreCreditResource(client);
  }
}

export default RefundKit;

// --- Type exports ---

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
  PolicyCategoryRule,
  PolicyGlobalLimits,
  MerchantPolicy,
  EligibilityItem,
  CheckEligibilityParams,
  ItemEligibility,
  CustomerHistory,
  EligibilityResult,
  GetReturnPolicyParams,
  Return,
  ReturnStatus,
  ReturnMethod,
  ReturnItem,
  ReturnItemReason,
  ReturnShipment,
  CreateReturnParams,
  ListReturnsParams,
  DisputeRisk,
  RiskLevel,
  DisputeSignal,
  SignalType,
  DisputeRecommendation,
  GetDisputeRiskParams,
  ApprovalRequest,
  ApprovalStatus,
  ApprovalTrigger,
  ApprovalThreshold,
  ListApprovalsParams,
  ApprovalDecision,
  StoreCredit,
  StoreCreditStatus,
  CreditType,
  IssueStoreCreditParams,
  WebhookEventType,
  WebhookEvent,
  WebhookConfig,
  PaymentProcessor,
  ProcessorConfig,
  RefundParams,
  ProcessorRefundResult,
  ProcessorStatus,
  ProcessorCancelResult,
  TransactionInfo,
  ProcessorMetadata,
  ProcessorCapabilities,
  SplitRefundParams,
  SplitRefundResult,
} from './types/index.js';

export { RefundKitError, ErrorCode } from './errors/index.js';
export type { ApiResponse } from './errors/index.js';

export { StripeProcessor } from './processors/index.js';
export { SquareProcessor } from './processors/index.js';
export { ProcessorRouter } from './processors/index.js';

export { generateApiKey, hashApiKey, isValidApiKeyFormat, getApiKeyEnvironment } from './utils/crypto.js';
export { generateRmaNumber, isValidRmaFormat } from './utils/rma.js';

export { PolicyEngine, findMatchingRule } from './engine/index.js';
export type { PolicyEngineConfig } from './engine/index.js';
export { DisputeRiskEngine } from './engine/index.js';
export type { DisputeEngineConfig } from './engine/index.js';
export { ApprovalEngine } from './engine/index.js';
export type { ApprovalDecisionResult } from './engine/index.js';
export { canTransition, getNextStates, isTerminalState } from './engine/index.js';

export { WebhookEmitter, signPayload, verifySignature, createSignedPayload, isTimestampValid } from './webhooks/index.js';
export type { WebhookEndpoint, EmitResult, DeliveryResult, DeliveryConfig } from './webhooks/index.js';
