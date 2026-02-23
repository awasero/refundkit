export type { RefundKitConfig } from './config.js';
export { DEFAULT_BASE_URL, DEFAULT_TIMEOUT } from './config.js';

export type {
  Refund,
  RefundStatus,
  RefundReason,
  RefundInitiatedBy,
  CreateRefundParams,
  ListRefundsParams,
} from './refund.js';

export type {
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
} from './policy.js';

export type {
  ReturnStatus,
  ReturnMethod,
  ReturnItemReason,
  ReturnItem,
  ReturnShipment,
  Return,
  CreateReturnParams,
  ListReturnsParams,
} from './return.js';

export type {
  RiskLevel,
  SignalType,
  DisputeSignal,
  DisputeRecommendation,
  DisputeRisk,
  GetDisputeRiskParams,
} from './dispute.js';

export type {
  ApprovalStatus,
  ApprovalTrigger,
  ApprovalThreshold,
  ApprovalRequest,
  ListApprovalsParams,
  ApprovalDecision,
} from './approval.js';

export type {
  CreditType,
  StoreCreditStatus,
  StoreCredit,
  IssueStoreCreditParams,
} from './store-credit.js';

export type {
  WebhookEventType,
  WebhookEvent,
  WebhookConfig,
} from './webhook.js';

export type {
  ProcessorConfig,
  RefundParams,
  ProcessorRefundResult,
  ProcessorStatus,
  ProcessorCancelResult,
  TransactionInfo,
  PaymentProcessor,
  ProcessorMetadata,
  ProcessorCapabilities,
  SplitRefundParams,
  SplitRefundResult,
} from './processor.js';
