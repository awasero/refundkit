# RefundKit — Execution Plan

> Agent-native refund orchestration SDK. From basic CRUD to full refund intelligence.

---

## Current State (v0.1)

What exists today:

- **SDK (`@refundkit/sdk`)**: `RefundKit` class with `refunds.create/get/list/cancel` and `policies.check`. Five MCP tools (`refundkit_process_refund`, `refundkit_check_refund_status`, `refundkit_list_refunds`, `refundkit_get_policy`, `refundkit_cancel_refund`). A single `StripeProcessor` adapter implementing the `PaymentProcessor` interface. Basic types (`Refund`, `RefundStatus`, `RefundReason`, `RefundPolicy`, `CreateRefundParams`, `ListRefundsParams`). Simple `HttpClient`, error handling with `RefundKitError` + `ErrorCode`. Zod validation for inputs. Dual build via tsup (ESM + CJS).
- **App (`@refundkit/app`)**: Next.js dashboard backed by Supabase with 7 migration files covering `organizations`, `users_organizations`, `api_keys`, `processor_connections`, `refunds`, `refund_events`, and `api_logs`.
- **Website (`@refundkit/website`)**: Marketing site with docs, blog, and landing pages.

**Limitations**: Single payment processor (Stripe). No return lifecycle. No policy engine beyond simple checks. No fraud scoring. No approval workflows. No webhook delivery. No remote MCP server.

---

## Target State (v1.0)

The full vision:

- **12 MCP tools**: `check_eligibility`, `initiate_refund`, `get_refund_status`, `list_refunds`, `get_return_policy`, `create_return`, `cancel_refund`, `get_dispute_risk`, `split_refund`, `issue_store_credit`, `track_return`, `approve_refund`
- **Machine-readable policy engine**: JSON schema rules with return windows, restocking fees, category rules, per-customer limits, and auto-approve thresholds
- **Return lifecycle management**: RMA generation, shipment tracking, receipt confirmation, store credit issuance
- **Fraud & dispute prevention**: Risk scoring, velocity checks, pattern detection, pre-emptive refund recommendations
- **Human-in-the-loop approval workflows**: Configurable amount-based, risk-based, and category-based thresholds
- **Multi-processor support**: Stripe + Square (MVP), PayPal (v2), Adyen (v3), with auto-routing
- **Webhook system**: Event-driven notifications with HMAC-SHA256 signatures and retry logic
- **Remote MCP server**: OAuth 2.0 authentication at `mcp.refundkit.dev`
- **REST API**: OpenAPI 3.1 spec at `api.refundkit.dev/v1`
- **Dashboard upgrades**: Analytics, approval queue, policy management UI, return tracking, dispute flagging

---

## Architecture Overview

RefundKit uses a 3-layer architecture that separates AI agent integrations from core business logic and external providers.

### Layer 1: AI Agents & Protocols

The consumption layer. AI agents interact with RefundKit through standardized protocols.

- **Shopping Agents** — Autonomous agents that handle purchases and returns on behalf of consumers
- **Agent Frameworks** — LangChain, CrewAI, Google ADK, and other orchestration frameworks
- **Commerce Protocols** — Standardized agent-commerce communication protocols
- **Support Agents** — AI customer service agents handling refund requests

These connect to RefundKit via the MCP Server (stdio or SSE transport), the TypeScript SDK, or the REST API.

### Layer 2: RefundKit Core Engine

The brain. All business logic lives here.

**Entry Points:**
- **MCP Server** — 12 tools for agent interaction (stdio for local, SSE for remote)
- **TypeScript SDK** — Programmatic access for Node.js/TypeScript applications
- **REST API** — HTTP endpoints for any language or platform

**Core Engines:**
- **Policy Engine** — Evaluates JSON schema rules to determine refund/return eligibility
- **Refund Router** — Routes refund operations to the correct payment processor
- **Return Lifecycle** — Manages the full RMA workflow from request to completion
- **Fraud & Disputes** — Scores risk, detects patterns, recommends pre-emptive action

**Shared Data Layer:**
- **Supabase (PostgreSQL)** — All persistent state: refunds, returns, policies, approvals, audit logs
- **Row Level Security** — Organization-scoped data isolation
- **Realtime Subscriptions** — Live updates for dashboard and webhooks

### Layer 3: Payment & Returns Providers

The external integrations. RefundKit abstracts these behind uniform interfaces.

- **Payment Processors** — Stripe (v0.1), Square (v0.4), PayPal (v2), Adyen (v3)
- **Returns Platforms** — Loop, Returnly, Narvar (future)
- **Commerce Platforms** — Shopify, WooCommerce, BigCommerce (future)
- **Logistics & Fraud** — Shipping carriers, Sift, Signifyd (future)

---

## Phase 1: SDK Type System & Core Interfaces

**Goal**: Expand the type system to support the full domain model. Every subsequent phase depends on these types being correct and complete.

**Duration**: 2-3 days

**Documentation**: Update SDK Types reference in `documentation.md`

### Steps

#### 1.1 Expand RefundReason enum

Add new reasons that reflect real-world agent-initiated refund scenarios:

- `agent_error` — Agent made a mistake during the transaction
- `price_change` — Price dropped after purchase
- `sizing_issue` — Wrong size (common in apparel)
- `item_not_as_described` — Product doesn't match listing
- `order_cancelled` — Order cancelled before fulfillment
- `return_window_closing` — Agent proactively initiating before window expires

#### 1.2 Add Return types

Define the complete return domain model:

```typescript
interface Return {
  id: string;
  organizationId: string;
  refundId?: string;
  rmaNumber: string;
  status: ReturnStatus;
  items: ReturnItem[];
  shipment?: ReturnShipment;
  createdAt: string;
  updatedAt: string;
}

type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'label_generated'
  | 'shipped'
  | 'received'
  | 'inspected'
  | 'completed'
  | 'cancelled';

interface ReturnItem {
  productId: string;
  name: string;
  quantity: number;
  reason: RefundReason;
  condition?: 'new' | 'used' | 'damaged';
}

interface ReturnShipment {
  carrier: string;
  trackingNumber: string;
  labelUrl?: string;
  shippedAt?: string;
  receivedAt?: string;
}

interface CreateReturnParams {
  refundId?: string;
  items: ReturnItem[];
  reason: RefundReason;
  customerEmail?: string;
  metadata?: Record<string, unknown>;
}
```

#### 1.3 Add Policy types

Define the machine-readable policy schema:

```typescript
interface ReturnPolicy {
  id: string;
  organizationId: string;
  name: string;
  returnWindowDays: number;
  restockingFeePercent: number;
  finalSale: boolean;
  exchangeOnly: boolean;
  categoryRules: CategoryRule[];
  perCustomerLimits: CustomerLimitRule;
  autoApproveThreshold: number; // Amount in cents
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryRule {
  category: string;
  returnWindowDays?: number;
  restockingFeePercent?: number;
  finalSale?: boolean;
  exchangeOnly?: boolean;
}

interface CustomerLimitRule {
  maxReturnsPerPeriod: number;
  periodDays: number;
  maxRefundAmountPerPeriod: number; // In cents
}
```

#### 1.4 Add Dispute types

```typescript
interface DisputeRisk {
  refundId: string;
  riskLevel: RiskLevel;
  score: number; // 0-100
  signals: DisputeSignal[];
  recommendation: 'proceed' | 'review' | 'block' | 'preempt';
  evaluatedAt: string;
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface DisputeSignal {
  type: string;
  description: string;
  weight: number;
  data?: Record<string, unknown>;
}

interface FraudScore {
  customerId: string;
  overallScore: number;
  velocityScore: number;
  amountAnomalyScore: number;
  patternScore: number;
  lastEvaluated: string;
}
```

#### 1.5 Add Approval types

```typescript
interface ApprovalRequest {
  id: string;
  refundId: string;
  organizationId: string;
  status: ApprovalStatus;
  thresholdRule: string;
  amount: number;
  currency: string;
  riskScore?: number;
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
}

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

interface ApprovalThreshold {
  name: string;
  condition: 'amount' | 'risk' | 'category';
  autoApproveBelow: number;
  requireReviewAbove: number;
  autoRejectAbove?: number;
}

interface ApprovalDecision {
  approvalId: string;
  decision: 'approve' | 'reject' | 'escalate';
  reason?: string;
  decidedBy: string;
}
```

#### 1.6 Add StoreCredit types

```typescript
interface StoreCreditIssuance {
  id: string;
  organizationId: string;
  customerId: string;
  refundId?: string;
  returnId?: string;
  amount: number;
  currency: string;
  creditType: CreditType;
  expiresAt?: string;
  redeemedAmount: number;
  createdAt: string;
}

type CreditType = 'full_refund' | 'partial_refund' | 'exchange_difference' | 'goodwill';
```

#### 1.7 Update Refund type

Add relation fields to the existing `Refund` interface:

```typescript
// Add to existing Refund interface:
returnId?: string;
approvalId?: string;
disputeRiskScore?: number;
splitFrom?: string;        // ID of parent refund if this is a split
storeCreditId?: string;
```

#### 1.8 Add Webhook event types

```typescript
type WebhookEventType =
  | 'refund.initiated'
  | 'refund.approved'
  | 'refund.processing'
  | 'refund.completed'
  | 'refund.failed'
  | 'refund.cancelled'
  | 'return.created'
  | 'return.shipped'
  | 'return.received'
  | 'return.completed'
  | 'approval.pending'
  | 'approval.decided';

interface WebhookPayload<T = unknown> {
  id: string;
  type: WebhookEventType;
  data: T;
  organizationId: string;
  createdAt: string;
}

interface WebhookConfig {
  url: string;
  events: WebhookEventType[];
  secret: string;
  active: boolean;
}
```

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/sdk/src/types/return.ts` | NEW | Return, ReturnStatus, ReturnItem, RMA, CreateReturnParams, ReturnShipment |
| `packages/sdk/src/types/policy.ts` | EXPAND | ReturnPolicy with JSON schema, CategoryRule, CustomerLimitRule |
| `packages/sdk/src/types/dispute.ts` | NEW | DisputeRisk, RiskLevel, DisputeSignal, FraudScore |
| `packages/sdk/src/types/approval.ts` | NEW | ApprovalRequest, ApprovalStatus, ApprovalThreshold, ApprovalDecision |
| `packages/sdk/src/types/store-credit.ts` | NEW | StoreCreditIssuance, CreditType |
| `packages/sdk/src/types/webhook.ts` | NEW | WebhookEventType, WebhookPayload, WebhookConfig |
| `packages/sdk/src/types/refund.ts` | EXPAND | Add returnId, approvalId, disputeRiskScore, splitFrom, storeCreditId |
| `packages/sdk/src/types/index.ts` | UPDATE | Re-export all new type modules |

### Doc Update

Add "Return Types", "Policy Schema", "Dispute Types", "Approval Types", "Store Credit Types", and "Webhook Types" sections to `documentation.md` with type definitions and usage examples.

---

## Phase 2: Policy Engine

**Goal**: Machine-readable policy evaluation with JSON schema rules. The policy engine is the decision-making core — it determines whether a refund or return is eligible, what fees apply, and whether auto-approval is possible.

**Duration**: 3-4 days

**Documentation**: Update Policy Engine reference in `documentation.md`

### Steps

#### 2.1 Design the PolicyRule JSON schema

Define a composable rule system where each rule has conditions, actions, and a priority. Rules are evaluated in priority order; the first matching rule determines the outcome.

```typescript
interface PolicyRule {
  id: string;
  name: string;
  priority: number; // Lower = higher priority
  conditions: PolicyCondition[];
  actions: PolicyAction;
}

interface PolicyCondition {
  field: string;       // e.g., 'order.created_at', 'item.category', 'customer.return_count'
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'between';
  value: unknown;
}

interface PolicyAction {
  eligible: boolean;
  restockingFeePercent?: number;
  maxRefundPercent?: number;
  requireApproval?: boolean;
  storeCredit Only?: boolean;
  message: string;
}
```

#### 2.2 Create PolicyEngine class

```typescript
class PolicyEngine {
  constructor(private rules: PolicyRule[]);
  evaluate(context: EligibilityContext): EligibilityResult;
}

interface EligibilityContext {
  orderId: string;
  orderDate: string;
  items: Array<{ productId: string; category: string; amount: number }>;
  customerId: string;
  customerReturnHistory: { count: number; totalAmount: number; periodDays: number };
  requestedAmount: number;
  reason: RefundReason;
}

interface EligibilityResult {
  eligible: boolean;
  reason: string;
  restockingFee?: number;
  maxRefundAmount?: number;
  requiresApproval: boolean;
  storeCreditOnly: boolean;
  matchedRule?: string;
}
```

#### 2.3 Implement rule evaluators

Create individual evaluator functions, each responsible for one type of check:

- **Return window evaluator** — Checks if the request is within the allowed return window (order date + `returnWindowDays`). Accounts for category-specific overrides.
- **Restocking fee calculator** — Determines the applicable restocking fee percentage. Category rules override the default.
- **Category rules evaluator** — Matches item categories against category-specific rules (final sale, exchange only, custom windows).
- **Customer history limits evaluator** — Checks customer's return count and total refund amount against per-customer limits within the configured period.
- **Final sale detection** — Checks if any items are marked as final sale (no returns allowed).

Each evaluator returns a partial result. The engine merges them with a "most restrictive wins" strategy.

#### 2.4 Add Zod schemas for policy validation

Validate all policy configurations and eligibility requests at the boundary using Zod schemas. This ensures:

- Policy rules have valid condition operators
- All required fields are present
- Numeric values are within acceptable ranges
- Category names match the configured taxonomy

#### 2.5 Create PolicyResource with expanded methods

Expand the existing `policies` resource to include:

- `checkEligibility(params: EligibilityContext): Promise<EligibilityResult>` — Full eligibility evaluation
- `getPolicy(policyId: string): Promise<ReturnPolicy>` — Retrieve a specific policy
- `listPolicies(params?: ListPoliciesParams): Promise<ReturnPolicy[]>` — List organization policies

#### 2.6 Add policy engine tests

Test cases to cover:

- **Eligible**: Order within return window, under customer limits, no final sale items
- **Ineligible — window expired**: Order past the return window
- **Ineligible — customer limits**: Customer exceeded max returns per period
- **Ineligible — final sale**: Item marked as final sale
- **Partial — restocking fee**: Eligible but with restocking fee applied
- **Category override**: Category-specific rule overrides organization default
- **Auto-approve**: Amount below auto-approve threshold
- **Edge case**: Order placed exactly on the return window boundary
- **Edge case**: Multiple items with mixed categories (some eligible, some not)

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/sdk/src/engine/policy-engine.ts` | NEW | PolicyEngine class with evaluate() method |
| `packages/sdk/src/engine/rules/return-window.ts` | NEW | Return window evaluator |
| `packages/sdk/src/engine/rules/restocking-fee.ts` | NEW | Restocking fee calculator |
| `packages/sdk/src/engine/rules/category-rules.ts` | NEW | Category-specific rule evaluator |
| `packages/sdk/src/engine/rules/customer-limits.ts` | NEW | Customer history limits evaluator |
| `packages/sdk/src/engine/rules/final-sale.ts` | NEW | Final sale detection |
| `packages/sdk/src/engine/rules/index.ts` | NEW | Re-exports all evaluators |
| `packages/sdk/src/resources/policies.ts` | EXPAND | Add checkEligibility, getPolicy, listPolicies |
| `packages/sdk/src/utils/validation.ts` | EXPAND | Zod schemas for policy configs |
| `packages/sdk/src/__tests__/policy-engine.test.ts` | NEW | Full test suite for policy engine |

### Doc Update

Add "Policy Engine" section to `documentation.md` with:
- JSON schema examples for common policies (30-day return window, 15% restocking fee, electronics final sale)
- Rule evaluation flow diagram
- Configuration guide for setting up policies
- Code examples showing `checkEligibility` usage

---

## Phase 3: Return Lifecycle Management

**Goal**: Full RMA workflow from creation to store credit/refund. This phase adds physical return tracking — the bridge between a refund decision and the actual money movement.

**Duration**: 3-4 days

**Documentation**: Update Returns reference in `documentation.md`

### Steps

#### 3.1 Create ReturnsResource

Implement the full returns resource with CRUD operations:

```typescript
class ReturnsResource {
  create(params: CreateReturnParams): Promise<Return>;
  get(returnId: string): Promise<Return>;
  list(params?: ListReturnsParams): Promise<Return[]>;
  updateStatus(returnId: string, status: ReturnStatus, data?: Partial<ReturnShipment>): Promise<Return>;
  cancel(returnId: string, reason?: string): Promise<Return>;
}
```

#### 3.2 Implement RMA number generation

Format: `RMA-{ORG_PREFIX}-{TIMESTAMP}-{RANDOM}`

- `ORG_PREFIX`: First 4 characters of the organization's slug (uppercase)
- `TIMESTAMP`: Unix timestamp in seconds (base36 encoded for compactness)
- `RANDOM`: 6 random alphanumeric characters

Example: `RMA-ACME-2N4K8F-X7B3QM`

Requirements:
- Globally unique
- Human-readable and dictatable over the phone
- Sortable by creation time
- Contains no ambiguous characters (0/O, 1/I/l)

#### 3.3 Add return status state machine

Define valid state transitions:

```
requested → approved → label_generated → shipped → received → inspected → completed
    ↓           ↓
cancelled   cancelled
```

- `requested` → `approved`: Return request accepted (manual or auto-approved)
- `approved` → `label_generated`: Shipping label created
- `label_generated` → `shipped`: Customer shipped the item (tracking detected)
- `shipped` → `received`: Warehouse received the package
- `received` → `inspected`: Item inspected for condition
- `inspected` → `completed`: Return finalized, refund/credit issued
- `requested` → `cancelled`: Return cancelled before approval
- `approved` → `cancelled`: Return cancelled after approval but before shipping

Invalid transitions throw a `RefundKitError` with `ErrorCode.INVALID_STATE_TRANSITION`.

#### 3.4 Create store credit issuance logic

When a return completes and the policy specifies store credit instead of a refund:

1. Calculate credit amount (order amount minus restocking fee)
2. Create `StoreCreditIssuance` record
3. Set expiration date if configured
4. Return the credit details to the agent

Store credits are tracked separately from refunds. They have their own lifecycle (issued → partially redeemed → fully redeemed → expired).

#### 3.5 Connect return completion to refund triggering

When a return reaches the `completed` state:

1. Check if a refund should be issued (vs. store credit)
2. If refund: automatically initiate the refund through the existing `refunds.create` flow
3. Link the refund to the return via `returnId`
4. Emit `return.completed` and `refund.initiated` webhook events

This creates a clean separation: returns handle the physical goods flow, refunds handle the money flow.

#### 3.6 Add return lifecycle tests

- Create a return and verify RMA generation
- Walk through the full state machine (requested → completed)
- Test invalid state transitions
- Test store credit issuance on completion
- Test automatic refund triggering on completion
- Test cancellation at various states

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/sdk/src/resources/returns.ts` | NEW | ReturnsResource with create, get, list, updateStatus, cancel |
| `packages/sdk/src/resources/store-credit.ts` | NEW | StoreCreditResource with issue, get, list, redeem |
| `packages/sdk/src/utils/rma.ts` | NEW | RMA number generation utility |
| `packages/sdk/src/utils/state-machine.ts` | NEW | Generic state machine with transition validation |
| `packages/sdk/src/__tests__/returns.test.ts` | NEW | Return lifecycle tests |
| `packages/sdk/src/__tests__/rma.test.ts` | NEW | RMA generation tests |

### Doc Update

Add "Returns" section to `documentation.md` with:
- Lifecycle diagram showing all states and transitions
- RMA generation format and examples
- Store credit vs. refund flow decision tree
- Code examples for creating and tracking returns

---

## Phase 4: Fraud & Dispute Prevention

**Goal**: Risk scoring, velocity checks, and pre-emptive chargeback prevention. This engine runs before every refund to assess whether the transaction is legitimate or potentially fraudulent.

**Duration**: 3-4 days

**Documentation**: Update Fraud & Disputes reference in `documentation.md`

### Steps

#### 4.1 Create DisputeRiskEngine

```typescript
class DisputeRiskEngine {
  score(context: RiskContext): Promise<DisputeRisk>;
  getCustomerScore(customerId: string): Promise<FraudScore>;
}

interface RiskContext {
  customerId: string;
  refundAmount: number;
  orderAmount: number;
  orderDate: string;
  reason: RefundReason;
  itemCategory?: string;
  agentId?: string;
}
```

The engine evaluates multiple signals and produces a composite risk score (0-100). Each signal contributes a weighted component to the final score.

#### 4.2 Implement risk signals

Each signal is an independent evaluator that returns a score and description:

- **Velocity signal** — Returns per customer per period. Thresholds: 1-2/month = normal, 3-4/month = elevated, 5+/month = high risk. Configurable per organization.
- **Amount anomaly signal** — Compares refund amount to customer's historical average. A refund 3x the average triggers a signal. Also flags refunds that are suspiciously close to the order amount (possible "use and return" pattern).
- **Pattern matching signal** — Detects repeated patterns: same item returned 3+ times, same category returned frequently, returns always at the end of the return window, returns clustered around sales/promotions.
- **Agent audit trail signal** — Evaluates the agent interaction: was there a conversation before the refund? Did the agent follow the expected flow? Was the refund reason consistent with the conversation? Missing or suspicious audit trails increase risk.

#### 4.3 Add configurable risk thresholds

Organizations configure their own risk tolerance:

```typescript
interface RiskThresholds {
  low: { maxScore: 25; action: 'auto_approve' };
  medium: { maxScore: 50; action: 'flag_for_review' };
  high: { maxScore: 75; action: 'require_approval' };
  critical: { maxScore: 100; action: 'block' };
}
```

The engine maps the composite score to a risk level, and the risk level determines the recommended action.

#### 4.4 Implement pre-emptive refund recommendation logic

When the engine detects a high risk of chargeback (based on customer behavior patterns), it can recommend a pre-emptive refund:

- Customer has filed chargebacks before
- Customer is showing signs of escalation (multiple support contacts)
- The cost of a chargeback ($15-25 fee + time) exceeds the refund amount

This is a recommendation only — the agent or human operator makes the final decision.

#### 4.5 Create DisputesResource

```typescript
class DisputesResource {
  getRisk(params: RiskContext): Promise<DisputeRisk>;
  flag(refundId: string, reason: string): Promise<void>;
  preempt(refundId: string, recommendation: string): Promise<DisputeRisk>;
}
```

#### 4.6 Add fraud engine tests

- Test individual signals in isolation
- Test composite scoring with multiple signals
- Test threshold mapping (score → risk level → recommendation)
- Test pre-emptive refund recommendations
- Test edge cases: new customer (no history), very old orders, zero-amount refunds

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/sdk/src/engine/dispute-engine.ts` | NEW | DisputeRiskEngine with score() and getCustomerScore() |
| `packages/sdk/src/engine/signals/velocity.ts` | NEW | Velocity signal evaluator |
| `packages/sdk/src/engine/signals/amount-anomaly.ts` | NEW | Amount anomaly signal evaluator |
| `packages/sdk/src/engine/signals/pattern-match.ts` | NEW | Pattern matching signal evaluator |
| `packages/sdk/src/engine/signals/agent-audit.ts` | NEW | Agent audit trail signal evaluator |
| `packages/sdk/src/engine/signals/index.ts` | NEW | Re-exports all signal evaluators |
| `packages/sdk/src/resources/disputes.ts` | NEW | DisputesResource with getRisk, flag, preempt |
| `packages/sdk/src/__tests__/dispute-engine.test.ts` | NEW | Fraud engine test suite |

### Doc Update

Add "Fraud & Disputes" section to `documentation.md` with:
- Risk scoring model explanation (0-100 composite score)
- Signal types with descriptions and weight ranges
- Threshold configuration guide
- Pre-emptive refund logic and when to use it

---

## Phase 5: Approval Workflows

**Goal**: Human-in-the-loop approval with configurable thresholds. High-value or high-risk refunds require human review before processing.

**Duration**: 2-3 days

**Documentation**: Update Approval Workflows reference in `documentation.md`

### Steps

#### 5.1 Create ApprovalEngine

```typescript
class ApprovalEngine {
  evaluate(context: ApprovalContext): ApprovalDecisionResult;
}

interface ApprovalContext {
  refundId: string;
  amount: number;
  currency: string;
  riskScore?: number;
  category?: string;
  customerId: string;
}

interface ApprovalDecisionResult {
  action: 'auto_approve' | 'queue_for_review' | 'auto_reject';
  reason: string;
  matchedThreshold?: string;
}
```

The engine evaluates the context against configured thresholds and returns a decision. If the action is `queue_for_review`, an `ApprovalRequest` is created in the database.

#### 5.2 Define configurable thresholds

Three types of thresholds, evaluated in priority order:

**Amount-based** (default):
- Below $50: Auto-approve
- $50-$200: Queue for review
- Above $500: Escalate to manager

**Risk-based** (requires Phase 4):
- Risk score 0-25: Auto-approve
- Risk score 26-50: Queue for review
- Risk score 51-75: Escalate
- Risk score 76-100: Auto-reject

**Category-based**:
- Electronics > $100: Always require review
- Final sale items: Always reject
- Consumables: Auto-approve up to $25

Organizations configure their own threshold matrix. Multiple threshold types can be combined (amount AND risk must both pass for auto-approve).

#### 5.3 Create ApprovalsResource

```typescript
class ApprovalsResource {
  listPending(params?: ListApprovalsParams): Promise<ApprovalRequest[]>;
  approve(approvalId: string, decision: ApprovalDecision): Promise<ApprovalRequest>;
  reject(approvalId: string, decision: ApprovalDecision): Promise<ApprovalRequest>;
  escalate(approvalId: string, reason: string): Promise<ApprovalRequest>;
}
```

#### 5.4 Integrate approval gate into refund initiation flow

Modify the `refunds.create` flow:

1. Run policy engine (Phase 2) to check eligibility
2. Run dispute risk engine (Phase 4) to get risk score
3. Run approval engine to determine if approval is needed
4. If `auto_approve` → proceed to refund processing
5. If `queue_for_review` → create `ApprovalRequest`, set refund status to `pending_approval`, return the pending refund
6. If `auto_reject` → reject the refund with reason

When an approval decision is made (via dashboard or API), the refund automatically resumes processing.

#### 5.5 Add approval workflow tests

- Test auto-approve for low amount, low risk
- Test queue for review for medium amount
- Test auto-reject for high risk
- Test threshold combination (amount + risk)
- Test approval → refund resumption
- Test rejection → refund cancellation
- Test escalation flow

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/sdk/src/engine/approval-engine.ts` | NEW | ApprovalEngine with evaluate() method |
| `packages/sdk/src/resources/approvals.ts` | NEW | ApprovalsResource with CRUD + decision methods |
| `packages/sdk/src/resources/refunds.ts` | UPDATE | Integrate approval gate into create flow |
| `packages/sdk/src/__tests__/approval-engine.test.ts` | NEW | Approval workflow test suite |

### Doc Update

Add "Approval Workflows" section to `documentation.md` with:
- Threshold configuration examples
- Workflow diagram (create → evaluate → approve/reject → process)
- Dashboard integration guide
- Code examples for programmatic approval

---

## Phase 6: Expanded MCP Server (5 → 12 tools)

**Goal**: Full MCP tool coverage for all agent operations. This is the primary interface for AI agents.

**Duration**: 3-4 days

**Documentation**: Update MCP Tools reference in `documentation.md`

### Steps

#### 6.1 Refactor existing 5 tools

Update the existing tools to use the new resource methods and types from Phases 1-5:

- `refundkit_process_refund` → `refundkit_initiate_refund` (rename + add approval gate integration)
- `refundkit_check_refund_status` → `refundkit_get_refund_status` (rename for consistency)
- `refundkit_list_refunds` — Update to include new fields (returnId, approvalId, etc.)
- `refundkit_get_policy` → `refundkit_get_return_policy` (rename + use expanded policy types)
- `refundkit_cancel_refund` — No changes needed

#### 6.2 Add `check_eligibility` tool

```typescript
// Tool: refundkit_check_eligibility
// Description: Check if a refund or return is eligible based on the merchant's policy
// Input: { orderId, items, customerId, reason }
// Output: { eligible, reason, restockingFee, maxRefundAmount, requiresApproval }
```

Integrates with the Policy Engine (Phase 2). This should be the first tool an agent calls before initiating a refund.

#### 6.3 Add `get_return_policy` tool

```typescript
// Tool: refundkit_get_return_policy
// Description: Get the full return policy for a merchant, including category-specific rules
// Input: { policyId? } (optional, defaults to org's active policy)
// Output: { returnWindowDays, restockingFeePercent, categoryRules, ... }
```

#### 6.4 Add `create_return` tool

```typescript
// Tool: refundkit_create_return
// Description: Create a return (RMA) for physical goods that need to be shipped back
// Input: { refundId?, items, reason, customerEmail? }
// Output: { returnId, rmaNumber, status, instructions }
```

#### 6.5 Add `track_return` tool

```typescript
// Tool: refundkit_track_return
// Description: Track the status of a return shipment
// Input: { returnId }
// Output: { status, shipment, estimatedDelivery, nextSteps }
```

#### 6.6 Add `get_dispute_risk` tool

```typescript
// Tool: refundkit_get_dispute_risk
// Description: Assess the fraud/dispute risk of a refund before processing
// Input: { customerId, refundAmount, orderAmount, orderDate, reason }
// Output: { riskLevel, score, signals, recommendation }
```

#### 6.7 Add `issue_store_credit` tool

```typescript
// Tool: refundkit_issue_store_credit
// Description: Issue store credit instead of a monetary refund
// Input: { customerId, amount, currency, reason, expiresInDays? }
// Output: { creditId, amount, currency, expiresAt }
```

#### 6.8 Add `approve_refund` tool

```typescript
// Tool: refundkit_approve_refund
// Description: Approve or reject a refund that requires human review
// Input: { approvalId, decision: 'approve' | 'reject', reason? }
// Output: { approvalId, status, refundId, refundStatus }
```

Note: This tool is typically used by human operators through agent interfaces, not by autonomous agents. The tool should have explicit permission scoping.

#### 6.9 Update tool naming convention

All tools follow the pattern `refundkit_{action}_{noun}`:

| # | Tool Name | Category |
|---|-----------|----------|
| 1 | `refundkit_check_eligibility` | Policy |
| 2 | `refundkit_initiate_refund` | Refunds |
| 3 | `refundkit_get_refund_status` | Refunds |
| 4 | `refundkit_list_refunds` | Refunds |
| 5 | `refundkit_cancel_refund` | Refunds |
| 6 | `refundkit_split_refund` | Refunds |
| 7 | `refundkit_get_return_policy` | Policy |
| 8 | `refundkit_create_return` | Returns |
| 9 | `refundkit_track_return` | Returns |
| 10 | `refundkit_get_dispute_risk` | Disputes |
| 11 | `refundkit_issue_store_credit` | Credits |
| 12 | `refundkit_approve_refund` | Approvals |

#### 6.10 Add MCP tool tests

Test each tool independently:
- Valid input → expected output
- Invalid input → Zod validation error
- Missing required fields → clear error message
- Tool descriptions are clear and unambiguous for LLM consumption

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/sdk/src/mcp/tools/check-eligibility.ts` | NEW | check_eligibility tool definition |
| `packages/sdk/src/mcp/tools/create-return.ts` | NEW | create_return tool definition |
| `packages/sdk/src/mcp/tools/track-return.ts` | NEW | track_return tool definition |
| `packages/sdk/src/mcp/tools/get-dispute-risk.ts` | NEW | get_dispute_risk tool definition |
| `packages/sdk/src/mcp/tools/issue-store-credit.ts` | NEW | issue_store_credit tool definition |
| `packages/sdk/src/mcp/tools/approve-refund.ts` | NEW | approve_refund tool definition |
| `packages/sdk/src/mcp/tools/split-refund.ts` | NEW | split_refund tool definition |
| `packages/sdk/src/mcp/server.ts` | UPDATE | Register all 12 tools |
| `packages/sdk/src/__tests__/mcp.test.ts` | NEW | MCP tool test suite |

### Doc Update

Add "MCP Server Tools" section to `documentation.md` with:
- All 12 tools with input schemas, output formats, and descriptions
- Example agent conversations showing tool usage
- Tool permission scoping guide
- Error handling patterns for agents

---

## Phase 7: Multi-Processor Support (Square MVP)

**Goal**: Abstract the processor interface and add Square as the second payment provider. This validates the processor adapter pattern and enables auto-routing.

**Duration**: 2-3 days

**Documentation**: Update Processors reference in `documentation.md`

### Steps

#### 7.1 Refactor PaymentProcessor interface

Expand the existing interface to accommodate processor-specific capabilities:

```typescript
interface PaymentProcessor {
  name: string;

  // Core operations
  createRefund(params: ProcessorRefundParams): Promise<ProcessorRefundResult>;
  getRefund(processorRefundId: string): Promise<ProcessorRefundResult>;
  cancelRefund(processorRefundId: string): Promise<ProcessorRefundResult>;

  // Capabilities
  supportsSplitRefund(): boolean;
  supportsPartialRefund(): boolean;
  supportsStoreCredit(): boolean;

  // Metadata
  getProcessorMetadata(): ProcessorMetadata;
}

interface ProcessorMetadata {
  name: string;
  version: string;
  supportedCurrencies: string[];
  maxRefundAmount?: number;
  webhookSupport: boolean;
}
```

#### 7.2 Create SquareProcessor adapter

Implement the `PaymentProcessor` interface for Square:

- Use Square's Refunds API
- Handle Square-specific error codes and map to `ErrorCode`
- Support Square's idempotency keys
- Handle Square's async refund processing model

#### 7.3 Implement processor auto-routing

Create a `ProcessorRouter` that determines which processor to use:

```typescript
class ProcessorRouter {
  route(paymentMethodId: string): PaymentProcessor;
  routeByProcessor(processorName: string): PaymentProcessor;
  getAvailableProcessors(): ProcessorMetadata[];
}
```

Routing logic:
1. If a `processorName` is explicitly provided, use that processor
2. If a `paymentMethodId` is provided, detect the processor from the payment method prefix (`pm_` → Stripe, Square payment IDs start differently)
3. If neither, use the organization's default processor

#### 7.4 Add split-refund support

For multi-merchant orders where a single order was paid across multiple processors:

```typescript
interface SplitRefundParams {
  orderId: string;
  splits: Array<{
    processorName: string;
    amount: number;
    paymentMethodId: string;
  }>;
  reason: RefundReason;
}
```

The router creates individual refunds for each split, tracks them as a group (linked via `splitFrom`), and reports the aggregate status.

#### 7.5 Add processor tests

- Test StripeProcessor with mocked Stripe API
- Test SquareProcessor with mocked Square API
- Test ProcessorRouter routing logic
- Test split-refund across multiple processors
- Test error handling and retry for processor-specific failures

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/sdk/src/processors/square.ts` | NEW | SquareProcessor adapter |
| `packages/sdk/src/processors/router.ts` | NEW | ProcessorRouter with auto-routing |
| `packages/sdk/src/processors/base.ts` | EXPAND | Expanded PaymentProcessor interface |
| `packages/sdk/src/processors/stripe.ts` | UPDATE | Conform to expanded interface |
| `packages/sdk/src/__tests__/processors.test.ts` | NEW | Processor adapter tests |
| `packages/sdk/src/__tests__/router.test.ts` | NEW | Processor router tests |

### Doc Update

Add "Processors" section to `documentation.md` with:
- Adapter pattern explanation
- Routing logic diagram
- Guide for adding custom processors
- Split-refund usage examples

---

## Phase 8: Webhook System

**Goal**: Event-driven refund lifecycle notifications. External systems can subscribe to webhook events and react to refund state changes in real-time.

**Duration**: 2-3 days

**Documentation**: Update Webhooks reference in `documentation.md`

### Steps

#### 8.1 Define webhook event types

Complete event taxonomy covering all lifecycle stages:

| Event | Trigger |
|-------|---------|
| `refund.initiated` | Refund created (may be pending approval) |
| `refund.approved` | Refund approved (manual or auto) |
| `refund.processing` | Refund sent to payment processor |
| `refund.completed` | Refund successfully processed |
| `refund.failed` | Refund failed at the processor |
| `refund.cancelled` | Refund cancelled before completion |
| `return.created` | Return/RMA created |
| `return.shipped` | Customer shipped the return |
| `return.received` | Warehouse received the return |
| `return.completed` | Return fully processed |
| `approval.pending` | Refund queued for human review |
| `approval.decided` | Approval decision made (approve/reject/escalate) |

#### 8.2 Create WebhookEmitter class

```typescript
class WebhookEmitter {
  emit(event: WebhookEventType, data: unknown, organizationId: string): Promise<void>;
  registerEndpoint(config: WebhookConfig): Promise<void>;
  removeEndpoint(endpointId: string): Promise<void>;
  listEndpoints(organizationId: string): Promise<WebhookConfig[]>;
}
```

The emitter is called from resource methods (refunds, returns, approvals) whenever a state change occurs. It fans out to all registered endpoints that subscribe to that event type.

#### 8.3 Implement webhook signature verification

Every webhook payload is signed with HMAC-SHA256:

```typescript
function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = signPayload(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

The signature is sent in the `X-RefundKit-Signature` header. The timestamp is included in the payload to prevent replay attacks.

#### 8.4 Create webhook delivery with retry logic

Delivery strategy:

1. First attempt: Immediate
2. Retry 1: 5 seconds
3. Retry 2: 30 seconds
4. Retry 3: 5 minutes
5. Retry 4: 30 minutes
6. Retry 5: 2 hours
7. After 5 failures: Mark endpoint as failing, alert the organization

HTTP response handling:
- `2xx`: Success, delivery confirmed
- `4xx` (except 429): Permanent failure, do not retry
- `429`: Rate limited, retry with longer backoff
- `5xx`: Temporary failure, retry
- Timeout (10 seconds): Retry

#### 8.5 Add webhook event logging

Every webhook delivery attempt is logged in the `api_logs` table with:
- Event type
- Endpoint URL
- Response status code
- Response time
- Retry count
- Delivery status (delivered, failed, retrying)

#### 8.6 Add webhook tests

- Test event emission for all event types
- Test signature generation and verification
- Test retry logic with failing endpoints
- Test fan-out to multiple endpoints
- Test event filtering (endpoint only receives subscribed events)
- Test replay attack prevention (stale timestamps)

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/sdk/src/webhooks/emitter.ts` | NEW | WebhookEmitter class with delivery logic |
| `packages/sdk/src/webhooks/signature.ts` | NEW | HMAC-SHA256 signature generation and verification |
| `packages/sdk/src/webhooks/delivery.ts` | NEW | Retry logic with exponential backoff |
| `packages/sdk/src/webhooks/types.ts` | NEW | Webhook-specific types (may overlap with Phase 1) |
| `packages/sdk/src/__tests__/webhooks.test.ts` | NEW | Webhook system test suite |

### Doc Update

Add "Webhooks" section to `documentation.md` with:
- Event types table with descriptions and payload examples
- Signature verification guide (with code samples in multiple languages)
- Retry policy explanation
- Best practices for webhook consumers

---

## Phase 9: Database Schema Expansion

**Goal**: Add database tables for all new domain models. This phase creates the Supabase migrations that back the SDK's expanded capabilities.

**Duration**: 2-3 days

**Documentation**: Update Database Schema reference in `documentation.md`

### Steps

#### 9.1 Create policies migration

```sql
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  return_window_days INTEGER NOT NULL DEFAULT 30,
  restocking_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  final_sale BOOLEAN NOT NULL DEFAULT false,
  exchange_only BOOLEAN NOT NULL DEFAULT false,
  category_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  per_customer_limits JSONB,
  auto_approve_threshold INTEGER, -- Amount in cents
  rules JSONB NOT NULL DEFAULT '[]'::jsonb, -- PolicyRule[]
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_policies_org_id ON policies(organization_id);
CREATE INDEX idx_policies_active ON policies(organization_id, active);
```

#### 9.2 Create returns migration

```sql
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  refund_id UUID REFERENCES refunds(id),
  rma_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'requested',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipment JSONB,
  customer_email TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_returns_org_id ON returns(organization_id);
CREATE INDEX idx_returns_refund_id ON returns(refund_id);
CREATE INDEX idx_returns_rma ON returns(rma_number);
CREATE INDEX idx_returns_status ON returns(organization_id, status);
```

#### 9.3 Create approvals migration

```sql
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  refund_id UUID NOT NULL REFERENCES refunds(id),
  status TEXT NOT NULL DEFAULT 'pending',
  threshold_rule TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  risk_score INTEGER,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  decision_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approvals_org_id ON approvals(organization_id);
CREATE INDEX idx_approvals_refund_id ON approvals(refund_id);
CREATE INDEX idx_approvals_status ON approvals(organization_id, status);
CREATE INDEX idx_approvals_pending ON approvals(organization_id) WHERE status = 'pending';
```

#### 9.4 Create store_credits migration

```sql
CREATE TABLE store_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  refund_id UUID REFERENCES refunds(id),
  return_id UUID REFERENCES returns(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  credit_type TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  redeemed_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_store_credits_org_id ON store_credits(organization_id);
CREATE INDEX idx_store_credits_customer ON store_credits(organization_id, customer_id);
```

#### 9.5 Create dispute_signals migration

```sql
CREATE TABLE dispute_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  refund_id UUID NOT NULL REFERENCES refunds(id),
  risk_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendation TEXT NOT NULL,
  flagged BOOLEAN NOT NULL DEFAULT false,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dispute_signals_refund ON dispute_signals(refund_id);
CREATE INDEX idx_dispute_signals_flagged ON dispute_signals(organization_id) WHERE flagged = true;
CREATE INDEX idx_dispute_signals_risk ON dispute_signals(organization_id, risk_level);
```

#### 9.6 Update refunds table

```sql
ALTER TABLE refunds
  ADD COLUMN return_id UUID REFERENCES returns(id),
  ADD COLUMN approval_id UUID REFERENCES approvals(id),
  ADD COLUMN dispute_risk_score INTEGER,
  ADD COLUMN split_from_id UUID REFERENCES refunds(id),
  ADD COLUMN store_credit_id UUID REFERENCES store_credits(id);

CREATE INDEX idx_refunds_return_id ON refunds(return_id);
CREATE INDEX idx_refunds_approval_id ON refunds(approval_id);
CREATE INDEX idx_refunds_split_from ON refunds(split_from_id);
```

#### 9.7 Add RLS policies for all new tables

Every new table needs Row Level Security policies that scope data to the authenticated organization:

```sql
-- Example for policies table
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's policies"
  ON policies FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's policies"
  ON policies FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users_organizations
    WHERE user_id = auth.uid()
  ));
```

Repeat for `returns`, `approvals`, `store_credits`, and `dispute_signals`.

#### 9.8 Add indexes for common queries

Ensure all foreign keys and common filter columns are indexed (covered in individual migrations above). Additionally:

- Composite index on `refunds(organization_id, status, created_at)` for dashboard queries
- Composite index on `returns(organization_id, status, created_at)` for return tracking
- GIN index on `policies.rules` for JSON query performance
- GIN index on `dispute_signals.signals` for signal analysis

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/app/supabase/migrations/20240101000007_create_policies.sql` | NEW | Policies table with indexes |
| `packages/app/supabase/migrations/20240101000008_create_returns.sql` | NEW | Returns table with indexes |
| `packages/app/supabase/migrations/20240101000009_create_approvals.sql` | NEW | Approvals table with indexes |
| `packages/app/supabase/migrations/20240101000010_create_store_credits.sql` | NEW | Store credits table with indexes |
| `packages/app/supabase/migrations/20240101000011_create_dispute_signals.sql` | NEW | Dispute signals table with indexes |
| `packages/app/supabase/migrations/20240101000012_update_refunds_relations.sql` | NEW | Add relation columns to refunds |

**Note**: Migration file naming should follow the existing convention in the repo. The timestamps above are placeholders — use the actual next available timestamp when creating the files.

### Doc Update

Add "Database Schema" section to `documentation.md` with:
- Table definitions and column descriptions
- Entity-relationship diagram
- RLS policy explanations
- Index strategy rationale

---

## Phase 10: API Routes Expansion

**Goal**: REST API endpoints for all new resources, following the existing `{ data, error }` response shape convention.

**Duration**: 3-4 days

**Documentation**: Update API Reference in `documentation.md`

### Steps

#### 10.1 Add `POST /v1/returns` and `GET /v1/returns`

- `POST /v1/returns` — Create a new return (RMA). Request body validated with Zod.
- `GET /v1/returns` — List returns for the authenticated organization. Supports pagination, status filter, date range.

#### 10.2 Add `GET /v1/returns/:id`

Retrieve a single return by ID. Includes items, shipment tracking, and linked refund.

#### 10.3 Add `POST /v1/returns/:id/cancel`

Cancel a return. Only valid for returns in `requested` or `approved` status.

#### 10.4 Add `POST /v1/eligibility/check`

Check refund/return eligibility. Request body includes order details, customer info, and reason. Returns eligibility result from the Policy Engine.

#### 10.5 Add `GET /v1/policies/:id`

Retrieve a specific policy with full rule definitions.

#### 10.6 Add `POST /v1/disputes/risk`

Assess dispute risk for a potential refund. Returns risk score, level, signals, and recommendation.

#### 10.7 Add `GET /v1/approvals` and `POST /v1/approvals`

- `GET /v1/approvals` — List approval requests. Filter by status (`pending`, `approved`, `rejected`).
- `POST /v1/approvals/:id/decide` — Submit an approval decision (approve, reject, escalate).

#### 10.8 Add `POST /v1/store-credits`

Issue store credit to a customer. Returns the credit details.

#### 10.9 Add `POST /v1/webhooks/configure`

Register or update a webhook endpoint. Request body includes URL, subscribed events, and secret.

#### 10.10 Update existing refund routes

Add new fields to refund responses (returnId, approvalId, disputeRiskScore, splitFrom, storeCreditId). Update `POST /v1/refunds` to integrate the approval gate.

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/app/src/app/api/v1/returns/route.ts` | NEW | POST + GET /v1/returns |
| `packages/app/src/app/api/v1/returns/[id]/route.ts` | NEW | GET /v1/returns/:id |
| `packages/app/src/app/api/v1/returns/[id]/cancel/route.ts` | NEW | POST /v1/returns/:id/cancel |
| `packages/app/src/app/api/v1/eligibility/check/route.ts` | NEW | POST /v1/eligibility/check |
| `packages/app/src/app/api/v1/policies/[id]/route.ts` | NEW | GET /v1/policies/:id |
| `packages/app/src/app/api/v1/disputes/risk/route.ts` | NEW | POST /v1/disputes/risk |
| `packages/app/src/app/api/v1/approvals/route.ts` | NEW | GET /v1/approvals |
| `packages/app/src/app/api/v1/approvals/[id]/decide/route.ts` | NEW | POST /v1/approvals/:id/decide |
| `packages/app/src/app/api/v1/store-credits/route.ts` | NEW | POST /v1/store-credits |
| `packages/app/src/app/api/v1/webhooks/configure/route.ts` | NEW | POST /v1/webhooks/configure |
| `packages/app/src/app/api/v1/refunds/route.ts` | UPDATE | Add new fields, approval gate |
| `packages/app/src/app/api/v1/refunds/[id]/route.ts` | UPDATE | Add new fields to response |

### Doc Update

Add full API Reference to `documentation.md` with:
- All new endpoints with HTTP method, path, request/response schemas
- Authentication requirements (API key or Supabase JWT)
- curl examples for every endpoint
- Error response codes and messages
- Rate limiting information

---

## Phase 11: Dashboard Upgrades

**Goal**: Analytics, approval queue, policy management, return tracking, and dispute flagging in the Next.js dashboard.

**Duration**: 4-5 days

**Documentation**: Update Dashboard Guide in `documentation.md`

### Steps

#### 11.1 Add approval queue page (`/approvals`)

- Table of pending approval requests with columns: Refund ID, Amount, Risk Score, Reason, Requested At
- Approve/Reject/Escalate action buttons per row
- Bulk approve for low-risk items
- Filter by status, amount range, risk level
- Real-time updates via Supabase realtime subscription

#### 11.2 Add policy management page (`/policies`)

- List of organization policies with active/inactive toggle
- Policy editor with JSON schema form (built with shadcn/ui form components)
- Fields: return window, restocking fee, final sale toggle, category rules (add/remove)
- Policy preview: "What would happen if..." simulator
- Save and activate/deactivate policies

#### 11.3 Add returns page (`/returns`)

- Table of returns with columns: RMA Number, Status, Items, Customer, Created At
- Return detail view with lifecycle timeline (visual state machine)
- Status update actions (mark as received, inspected, completed)
- Link to associated refund
- Shipment tracking integration

#### 11.4 Add dispute risk page (`/disputes`)

- Table of flagged transactions with columns: Refund ID, Risk Score, Risk Level, Signals, Recommendation
- Drill-down view showing individual signals with explanations
- Action buttons: Accept Risk, Block, Pre-empt (issue refund proactively)
- Risk distribution chart (how many low/medium/high/critical)

#### 11.5 Upgrade overview page with new analytics

Expand the dashboard home page with:

- **Return rate**: Percentage of orders that result in returns, trend over time
- **Chargeback prevention savings**: Estimated savings from pre-emptive refunds
- **Approval queue depth**: Number of pending approvals, average wait time
- **Processor breakdown**: Refund volume by processor (Stripe vs. Square)
- **Top refund reasons**: Breakdown by reason category

#### 11.6 Add recharts charts

Install and configure recharts for:

- Refund volume over time (line chart, daily/weekly/monthly)
- Return rate trend (area chart)
- Processor breakdown (pie chart)
- Risk score distribution (histogram)
- Approval decision breakdown (bar chart: auto-approved, manually approved, rejected)

#### 11.7 Add real-time updates

Use Supabase realtime subscriptions for:

- Approval queue: New items appear instantly
- Refund status changes: Dashboard updates without page refresh
- Return status changes: Lifecycle timeline updates in real-time
- Analytics counters: Live counts on the overview page

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/app/src/app/(dashboard)/approvals/page.tsx` | NEW | Approval queue page |
| `packages/app/src/app/(dashboard)/approvals/[id]/page.tsx` | NEW | Approval detail page |
| `packages/app/src/app/(dashboard)/policies/page.tsx` | NEW | Policy management page |
| `packages/app/src/app/(dashboard)/policies/[id]/page.tsx` | NEW | Policy editor page |
| `packages/app/src/app/(dashboard)/returns/page.tsx` | NEW | Returns list page |
| `packages/app/src/app/(dashboard)/returns/[id]/page.tsx` | NEW | Return detail with lifecycle timeline |
| `packages/app/src/app/(dashboard)/disputes/page.tsx` | NEW | Dispute risk page |
| `packages/app/src/app/(dashboard)/disputes/[id]/page.tsx` | NEW | Dispute detail page |
| `packages/app/src/app/(dashboard)/page.tsx` | UPDATE | Add new analytics widgets |
| `packages/app/src/components/dashboard/sidebar.tsx` | UPDATE | Add Approvals, Policies, Returns, Disputes nav items |
| `packages/app/src/components/charts/refund-volume.tsx` | NEW | Refund volume line chart |
| `packages/app/src/components/charts/return-rate.tsx` | NEW | Return rate area chart |
| `packages/app/src/components/charts/processor-breakdown.tsx` | NEW | Processor pie chart |
| `packages/app/src/components/charts/risk-distribution.tsx` | NEW | Risk score histogram |
| `packages/app/src/components/charts/approval-breakdown.tsx` | NEW | Approval decision bar chart |
| `packages/app/src/hooks/use-realtime.ts` | NEW | Supabase realtime subscription hook |

### Doc Update

Add "Dashboard" section to `documentation.md` with:
- Page descriptions and purpose
- Configuration options
- How to read analytics

---

## Phase 12: Remote MCP Server & OAuth

**Goal**: Hosted MCP server at `mcp.refundkit.dev` with OAuth 2.0 authentication. This enables any agent framework to connect to RefundKit without running a local MCP server.

**Duration**: 3-4 days

**Documentation**: Update MCP Server Setup reference in `documentation.md`

### Steps

#### 12.1 Set up remote MCP server using SSE transport

The remote MCP server uses Server-Sent Events (SSE) for the transport layer:

- Single HTTP endpoint at `mcp.refundkit.dev` that accepts SSE connections
- Each connection is authenticated and scoped to an organization
- Tool calls are received as SSE events and processed server-side
- Results are streamed back as SSE events

#### 12.2 Implement OAuth 2.0 authentication flow

Support the OAuth 2.0 Authorization Code flow:

1. Agent framework redirects user to `mcp.refundkit.dev/oauth/authorize`
2. User authenticates via Supabase Auth
3. User grants permission to the agent framework
4. Redirect back with authorization code
5. Agent framework exchanges code for access token at `mcp.refundkit.dev/oauth/token`
6. Access token is used in the SSE connection header

Token management:
- Access tokens expire in 1 hour
- Refresh tokens expire in 30 days
- Revocation endpoint at `mcp.refundkit.dev/oauth/revoke`

#### 12.3 Create `mcp.refundkit.dev` endpoint in app

This can be a subdomain routing to the same Next.js app, or a separate deployment. Initial implementation uses the same app with path-based routing: `app.refundkit.dev/api/mcp/`.

#### 12.4 Add tool permission scoping

Not all tools should be available to all agents. Permission scoping allows organizations to control which tools are exposed:

- **Read-only scope**: `refundkit_get_refund_status`, `refundkit_list_refunds`, `refundkit_check_eligibility`, `refundkit_get_return_policy`, `refundkit_track_return`, `refundkit_get_dispute_risk`
- **Read-write scope**: All read-only tools + `refundkit_initiate_refund`, `refundkit_create_return`, `refundkit_cancel_refund`, `refundkit_split_refund`, `refundkit_issue_store_credit`
- **Admin scope**: All tools + `refundkit_approve_refund`

Scopes are configured per OAuth client and enforced at the MCP server level.

#### 12.5 Add rate limiting for MCP tool calls

Per-organization rate limits:

- Free tier: 100 tool calls/minute
- Pro tier: 1,000 tool calls/minute
- Enterprise tier: 10,000 tool calls/minute

Rate limit headers are included in SSE responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

#### 12.6 Update MCP configuration docs

Provide configuration examples for popular agent frameworks:

**Claude Desktop (`claude_desktop_config.json`)**:
```json
{
  "mcpServers": {
    "refundkit": {
      "url": "https://mcp.refundkit.dev",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

**LangChain**:
```python
from langchain_mcp import MCPToolkit
toolkit = MCPToolkit(server_url="https://mcp.refundkit.dev", token="<token>")
```

**CrewAI, Google ADK, OpenAI** — similar configuration patterns.

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/app/src/app/api/mcp/sse/route.ts` | NEW | SSE endpoint for remote MCP |
| `packages/app/src/app/api/mcp/oauth/authorize/route.ts` | NEW | OAuth authorization endpoint |
| `packages/app/src/app/api/mcp/oauth/token/route.ts` | NEW | OAuth token exchange endpoint |
| `packages/app/src/app/api/mcp/oauth/revoke/route.ts` | NEW | OAuth token revocation endpoint |
| `packages/sdk/src/mcp/remote.ts` | NEW | Remote MCP server setup with SSE |
| `packages/sdk/src/mcp/oauth.ts` | NEW | OAuth 2.0 client implementation |
| `packages/sdk/src/mcp/permissions.ts` | NEW | Tool permission scoping |
| `packages/sdk/src/mcp/rate-limiter.ts` | NEW | Rate limiting middleware |

### Doc Update

Add "MCP Server Setup" section to `documentation.md` with:
- Remote vs. local MCP server comparison
- OAuth 2.0 flow diagram
- Configuration for Claude, OpenAI, LangChain, CrewAI, Google ADK
- Tool permission scoping guide
- Rate limiting tiers

---

## Phase 13: Website Documentation Sync

**Goal**: Sync the `documentation.md` single source of truth to the website's MDX documentation pages. Update marketing content to reflect expanded capabilities.

**Duration**: 2-3 days

### Steps

#### 13.1 Update all existing docs MDX files

Review and update every existing docs page to reflect changes from Phases 1-12. Ensure code examples use the new API, types, and tool names.

#### 13.2 Create new docs pages

| Page | Path | Content |
|------|------|---------|
| Returns | `/docs/returns` | Return lifecycle, RMA, state machine |
| Eligibility | `/docs/eligibility` | Policy engine, eligibility checks |
| Disputes | `/docs/disputes` | Fraud scoring, risk signals, prevention |
| Approvals | `/docs/approvals` | Approval workflows, thresholds, dashboard |
| Store Credit | `/docs/store-credit` | Credit issuance, types, expiration |
| Webhooks | `/docs/webhooks` | Event types, signatures, retry policy |
| Processors | `/docs/processors` | Multi-processor, routing, custom adapters |

#### 13.3 Update API reference pages

Add all new REST API endpoints with:
- Interactive request/response examples
- Authentication requirements
- Error codes and troubleshooting

#### 13.4 Update MCP tools docs

Document all 12 MCP tools with:
- Input schemas
- Output formats
- Example agent conversations
- Best practices for tool selection

#### 13.5 Add architecture diagram page

Create a visual architecture page at `/docs/architecture` with the 3-layer diagram (can use the existing JSX diagram component from the marketing site).

#### 13.6 Update blog with new capability posts

- "Introducing the Policy Engine: Machine-Readable Return Policies for AI Agents"
- "Fraud Prevention for Agent-Initiated Refunds"
- "Human-in-the-Loop: Approval Workflows for High-Value Refunds"
- "Multi-Processor Support: Stripe + Square and Beyond"

#### 13.7 Update pricing page

Add new features to pricing tiers:
- **Free**: 5 MCP tools, Stripe only, 100 refunds/month
- **Pro**: 12 MCP tools, Stripe + Square, policy engine, 10,000 refunds/month
- **Enterprise**: All features, custom processors, dedicated MCP server, unlimited

### Files

| File | Action | Description |
|------|--------|-------------|
| `packages/website/content/docs/*.mdx` | UPDATE | Sync all existing docs with documentation.md |
| `packages/website/content/docs/returns.mdx` | NEW | Returns documentation |
| `packages/website/content/docs/eligibility.mdx` | NEW | Eligibility/policy documentation |
| `packages/website/content/docs/disputes.mdx` | NEW | Disputes documentation |
| `packages/website/content/docs/approvals.mdx` | NEW | Approvals documentation |
| `packages/website/content/docs/store-credit.mdx` | NEW | Store credit documentation |
| `packages/website/content/docs/webhooks.mdx` | NEW | Webhooks documentation |
| `packages/website/content/docs/processors.mdx` | NEW | Processors documentation |
| `packages/website/content/docs/architecture.mdx` | NEW | Architecture diagram page |
| `packages/website/content/blog/*.mdx` | NEW | Blog posts for new features |
| `packages/website/src/app/pricing/page.tsx` | UPDATE | Updated pricing tiers |

---

## Versioning & Release Strategy

| Version | Scope | Phases | Target |
|---------|-------|--------|--------|
| **v0.1** | Basic CRUD, 5 MCP tools, Stripe only | Current | Done |
| **v0.2** | Type system, Policy Engine, Returns | 1, 2, 3 | Week 1-2 |
| **v0.3** | Fraud prevention, Approval workflows | 4, 5 | Week 2-3 |
| **v0.4** | 12 MCP tools, Square processor | 6, 7 | Week 3-4 |
| **v0.5** | Webhooks, Database schema, API routes | 8, 9, 10 | Week 4-5 |
| **v0.9** | Dashboard upgrades, Remote MCP + OAuth | 11, 12 | Week 5-7 |
| **v1.0** | Documentation sync, polish, launch | 13 | Week 7-8 |

### Semantic Versioning Rules

- **Patch** (0.x.1): Bug fixes, documentation updates, test additions
- **Minor** (0.x.0): New features, new MCP tools, new processors
- **Major** (1.0.0): First stable release with all 12 tools, full API, remote MCP

### Release Checklist (per version)

1. All tests passing (`pnpm test`)
2. Lint clean (`pnpm lint`)
3. Documentation updated in `documentation.md`
4. Website docs synced
5. CHANGELOG.md updated
6. npm package published (`@refundkit/sdk`)
7. GitHub release created with release notes

---

## Documentation Rule

**CRITICAL**: No code changes without documentation updates. Every phase in this plan lists specific doc updates. These are not optional — they are part of the definition of done for each phase.

### Single Source of Truth

The `documentation.md` file in the repo root is the canonical documentation. All other documentation (website MDX files, README sections, API references) is derived from it. When in doubt, `documentation.md` wins.

### Documentation Workflow

1. Before coding: Review the doc update requirements for the phase
2. During coding: Update `documentation.md` as you implement
3. After coding: Verify documentation matches the implementation
4. Before merging: Ensure `documentation.md` changes are included in the PR

---

## Testing Strategy

### Unit Tests

- **Policy Engine**: All rule evaluators, composite evaluation, edge cases
- **Dispute Engine**: All risk signals, composite scoring, threshold mapping
- **Approval Engine**: All threshold types, combined thresholds, decision flow
- **RMA Generator**: Uniqueness, format validation, no ambiguous characters
- **State Machine**: Valid transitions, invalid transitions, terminal states
- **Webhook Signature**: Generation, verification, replay prevention

### Integration Tests

- **Processor Adapters**: StripeProcessor and SquareProcessor with mocked APIs
- **Processor Router**: Auto-routing, split-refund across processors
- **Webhook Delivery**: HTTP delivery, retry logic, signature inclusion
- **Database Operations**: CRUD for all new tables, RLS policy enforcement

### MCP Tool Tests

- All 12 tools with valid inputs
- All 12 tools with invalid inputs (Zod validation)
- Tool descriptions are clear and parseable by LLMs
- Tool input/output schemas are JSON Schema compliant

### API Route Tests

- All endpoints with valid requests
- All endpoints with invalid requests (400 errors)
- Authentication enforcement (401 for missing/invalid keys)
- Authorization enforcement (403 for wrong organization)
- Rate limiting (429 responses)

### End-to-End Tests

Critical flows tested end-to-end:

1. **Happy path**: `check_eligibility` → `initiate_refund` → `approve_refund` → refund completed → webhook delivered
2. **Return flow**: `check_eligibility` → `create_return` → `track_return` → return completed → refund auto-initiated
3. **Fraud prevention**: `get_dispute_risk` → high risk detected → refund blocked
4. **Store credit**: `check_eligibility` → `issue_store_credit` → credit issued
5. **Split refund**: `split_refund` → multiple processor refunds → all completed

### Test Infrastructure

- **Framework**: Vitest (already configured)
- **Mocking**: MSW for HTTP mocking, vi.fn() for unit mocks
- **Fixtures**: Shared test fixtures for common entities (refunds, returns, policies)
- **Coverage target**: 80% line coverage, 90% for engine modules

---

## Dependency Summary

The following diagram shows phase dependencies. A phase cannot start until its dependencies are complete.

```
Phase 1 (Types)
  ├── Phase 2 (Policy Engine) ← depends on policy types
  │     └── Phase 5 (Approvals) ← depends on policy engine
  ├── Phase 3 (Returns) ← depends on return types
  ├── Phase 4 (Fraud) ← depends on dispute types
  └── Phase 8 (Webhooks) ← depends on event types

Phase 2 + 3 + 4 + 5
  └── Phase 6 (MCP Tools) ← depends on all resources

Phase 6
  └── Phase 7 (Multi-Processor) ← depends on refund routing

Phase 1-8
  └── Phase 9 (Database) ← can run in parallel but needs type definitions
  └── Phase 10 (API Routes) ← depends on resources + database

Phase 9 + 10
  └── Phase 11 (Dashboard) ← depends on API routes + database

Phase 6
  └── Phase 12 (Remote MCP) ← depends on MCP server

Phase 1-12
  └── Phase 13 (Docs Sync) ← depends on everything being built
```

**Parallelization opportunities**:
- Phases 2, 3, 4 can run in parallel after Phase 1
- Phase 8 (Webhooks) can run in parallel with Phases 2-5
- Phase 9 (Database) can start as soon as types are defined (Phase 1)
- Phase 7 (Multi-Processor) can run in parallel with Phase 6 if the interface is defined first
