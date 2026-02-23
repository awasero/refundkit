export type WebhookEventType =
  | 'refund.initiated'
  | 'refund.approved'
  | 'refund.processing'
  | 'refund.completed'
  | 'refund.failed'
  | 'refund.cancelled'
  | 'return.created'
  | 'return.approved'
  | 'return.shipped'
  | 'return.received'
  | 'return.inspected'
  | 'return.completed'
  | 'approval.pending'
  | 'approval.decided'
  | 'dispute.risk_flagged'
  | 'store_credit.issued'
  | 'store_credit.redeemed';

export interface WebhookEvent<T = Record<string, unknown>> {
  id: string;
  type: WebhookEventType;
  created: string;
  data: T;
}

export interface WebhookConfig {
  url: string;
  events: WebhookEventType[];
  secret: string;
  active: boolean;
}
