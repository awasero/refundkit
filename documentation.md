# RefundKit Documentation

> Agent-native refund orchestration for AI agents. Single API call to evaluate eligibility, initiate refunds, coordinate returns, and prevent chargebacks across any payment provider.

---

## Table of Contents

- [Overview](#overview)
  - [What is RefundKit?](#what-is-refundkit)
  - [Architecture](#architecture)
  - [Who is RefundKit for?](#who-is-refundkit-for)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
- [Authentication](#authentication)
  - [API Key Types](#api-key-types)
  - [SDK Authentication](#sdk-authentication)
  - [REST API Authentication](#rest-api-authentication)
  - [MCP Server Authentication](#mcp-server-authentication)
  - [Dashboard Authentication](#dashboard-authentication)
  - [API Key Security](#api-key-security)
- [SDK Reference](#sdk-reference)
  - [Refunds](#refunds)
  - [Policies](#policies)
  - [Returns](#returns--v02)
  - [Disputes](#disputes--v03)
  - [Approvals](#approvals--v03)
  - [Store Credit](#store-credit--v02)
- [MCP Server](#mcp-server)
  - [Overview](#overview-1)
  - [Setup](#setup)
  - [Tools Reference](#tools-reference)
- [Policy Engine](#policy-engine--v02)
  - [Overview](#overview-2)
  - [Policy Schema](#policy-schema)
  - [Evaluation Flow](#evaluation-flow)
- [Webhooks](#webhooks--v05)
  - [Event Types](#event-types)
  - [Webhook Payload](#webhook-payload)
  - [Signature Verification](#signature-verification)
- [Processors](#processors)
  - [Supported Processors](#supported-processors)
  - [Stripe Processor](#stripe-processor)
  - [Custom Processors](#custom-processors)
- [Error Handling](#error-handling)
  - [Error Response Format](#error-response-format)
  - [Error Codes](#error-codes)
  - [Retry Strategy](#retry-strategy)
- [REST API Reference](#rest-api-reference)
  - [Base URL](#base-url)
  - [Request Format](#request-format)
  - [Response Format](#response-format)
  - [Endpoints](#endpoints)
- [Database Schema](#database-schema)
  - [Current Tables (v0.1)](#current-tables-v01)
  - [Planned Tables](#planned-tables)
- [Dashboard](#dashboard)
  - [Pages](#pages)
- [Testing](#testing)
  - [Test Mode](#test-mode)
  - [Running SDK Tests](#running-sdk-tests)
- [Changelog](#changelog)

---

## Overview

### What is RefundKit?

RefundKit is an agent-native refund orchestration SDK that sits between AI shopping agents and the fragmented ecosystem of payment processors, returns platforms, and merchant policies. It gives any AI agent a single API call to:

- **Check eligibility** against machine-readable merchant policies
- **Initiate refunds** across any payment processor (Stripe today, Square, PayPal, and Adyen planned)
- **Coordinate returns** with RMA generation, shipment tracking, and inspection workflows
- **Prevent chargebacks** through proactive risk scoring and pre-emptive refund recommendations
- **Enforce approval workflows** with configurable thresholds for human review

RefundKit exposes three interfaces to AI agents:

1. **MCP Server** -- Model Context Protocol tools that any MCP-compatible AI client can call directly
2. **TypeScript SDK** -- `@refundkit/sdk` for programmatic use in Node.js agents, serverless functions, and backend services
3. **REST API** -- Standard HTTP endpoints at `api.refundkit.dev/v1` for any language or platform

All three interfaces share the same underlying data layer, authentication model, and `{ data, error }` response shape.

### Architecture

RefundKit uses a 3-layer architecture:

```
Layer 1: AI Agents & Protocols
┌─────────────────────────────────────────────────────────────────────┐
│  ChatGPT  |  Gemini  |  Amazon Buy for Me  |  Perplexity          │
│  Vercel AI SDK  |  LangChain  |  CrewAI  |  Google ADK            │
│  Agent Communication Protocol (ACP)  |  UCP                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
Layer 2: RefundKit Core Engine
┌──────────────────────────▼──────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐       │
│  │  MCP Server   │  │  TypeScript  │  │  REST API          │       │
│  │  (stdio/SSE)  │  │  SDK         │  │  api.refundkit.dev │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬─────────────┘       │
│         └─────────────────┼─────────────────┘                      │
│                           ▼                                        │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────────┐  │
│  │ Policy      │ │ Refund       │ │ Return     │ │ Fraud &     │  │
│  │ Engine      │ │ Router       │ │ Lifecycle  │ │ Disputes    │  │
│  └─────────────┘ └──────────────┘ └────────────┘ └─────────────┘  │
│                           │                                        │
│              ┌────────────▼───────────────┐                        │
│              │ Shared Data Layer          │                        │
│              │ Supabase (PostgreSQL + RLS)│                        │
│              └────────────────────────────┘                        │
└────────────────────────────────────────────────────────────────────┘
                           │
Layer 3: Payment & Returns Providers
┌──────────────────────────▼──────────────────────────────────────────┐
│  Payment:  Stripe | Square | PayPal | Adyen                        │
│  Returns:  Loop Returns | Narvar | AfterShip                       │
│  Commerce: Shopify | WooCommerce | BigCommerce                     │
└────────────────────────────────────────────────────────────────────┘
```

### Who is RefundKit for?

RefundKit serves four primary personas:

| Persona | Use Case | Scale |
|---------|----------|-------|
| **Agent commerce developers** | Building shopping agents that need to handle post-purchase flows (returns, refunds, exchanges) | Any volume |
| **E-commerce platform teams** | Shopify, WooCommerce, or BigCommerce merchants who want AI-powered refund automation | 100-10,000+ returns/month |
| **AI customer service teams** | Teams using Gorgias, Intercom Fin, or custom support agents that need to process refunds programmatically | Moderate volume |
| **Enterprise commerce operations** | Multi-processor, multi-brand operations needing centralized refund orchestration with approval workflows | 10,000+ returns/month |

---

## Getting Started

### Installation

Install the SDK from npm:

```bash
npm install @refundkit/sdk
```

Or with pnpm:

```bash
pnpm add @refundkit/sdk
```

Or with yarn:

```bash
yarn add @refundkit/sdk
```

The SDK ships with full TypeScript types and supports both ESM and CommonJS:

```typescript
// ESM (recommended)
import { RefundKit } from '@refundkit/sdk';

// CommonJS
const { RefundKit } = require('@refundkit/sdk');
```

**Requirements:**
- Node.js 18+ (uses native `fetch` and `crypto.subtle`)
- TypeScript 5.0+ (if using TypeScript)

### Quick Start

```typescript
import { RefundKit } from '@refundkit/sdk';

// 1. Initialize the client
const rk = new RefundKit({
  apiKey: process.env.REFUNDKIT_API_KEY!,
});

// 2. Check if a transaction is eligible for refund
const { data: policy, error: policyError } = await rk.policies.check({
  transactionId: 'txn_abc123',
  amount: 2999,
});

if (policyError) {
  console.error('Policy check failed:', policyError.message);
  process.exit(1);
}

if (!policy?.eligible) {
  console.log('Not eligible:', policy?.reason);
  process.exit(0);
}

// 3. Initiate the refund
const { data: refund, error: refundError } = await rk.refunds.create({
  transactionId: 'txn_abc123',
  amount: 2999,
  reason: 'product_not_received',
});

if (refundError) {
  console.error('Refund failed:', refundError.message);
  process.exit(1);
}

console.log('Refund created:', refund?.id, 'Status:', refund?.status);

// 4. Check status later
const { data: status } = await rk.refunds.get(refund!.id);
console.log('Current status:', status?.status);
```

### Configuration

The `RefundKit` constructor accepts a configuration object:

```typescript
const rk = new RefundKit({
  apiKey: 'rk_live_...',                     // Required -- your API key
  baseUrl: 'https://api.refundkit.dev',      // Optional -- defaults to production
  timeout: 30000,                            // Optional -- request timeout in ms (default: 30s)
});
```

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `string` | Yes | -- | Your RefundKit API key (`rk_live_*` or `rk_test_*`) |
| `baseUrl` | `string` | No | `https://api.refundkit.dev` | API base URL (override for self-hosted or local dev) |
| `timeout` | `number` | No | `30000` | Request timeout in milliseconds |

The constructor will throw immediately if `apiKey` is empty or missing:

```typescript
// This throws: "API key is required. Get yours at https://app.refundkit.dev/api-keys"
const rk = new RefundKit({ apiKey: '' });
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Supabase (database + auth)
NEXT_PUBLIC_SUPABASE_URL=             # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # Supabase anonymous/public key
SUPABASE_SERVICE_ROLE_KEY=            # Supabase service role key (server-side only)

# Stripe (payment processor)
STRIPE_SECRET_KEY=                    # Stripe secret key (sk_test_* or sk_live_*)
STRIPE_WEBHOOK_SECRET=                # Stripe webhook signing secret (whsec_*)

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000      # Dashboard URL
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3001   # Marketing site URL

# Encryption key for processor credentials (32 bytes hex)
ENCRYPTION_KEY=                       # Used to encrypt stored processor API keys
```

**Security:** Never commit `.env` files. Use environment variables in CI/CD and production. The `.env.example` file contains only placeholder keys with empty values.

---

## Authentication

RefundKit supports two authentication methods: **API key** for programmatic access and **session cookie** for the dashboard.

### API Key Types

| Prefix | Environment | Purpose |
|--------|-------------|---------|
| `rk_live_` | Production | Real refunds against live payment processors. Real money moves. |
| `rk_test_` | Test/Sandbox | Sandbox refunds. No real money moves. Safe for development. |

API keys are 40 characters total: 8-character prefix (`rk_live_` or `rk_test_`) plus 32 random URL-safe characters.

```
rk_test_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345
└──────┘└────────────────────────────────┘
 prefix         32 random chars
```

You can generate and manage API keys from the [dashboard](https://app.refundkit.dev/api-keys).

### SDK Authentication

Pass your API key when creating the client. The SDK sends it as a `Bearer` token on every request:

```typescript
import { RefundKit } from '@refundkit/sdk';

const rk = new RefundKit({
  apiKey: process.env.REFUNDKIT_API_KEY!,
});
```

The SDK sets the following headers on every request:

```
Authorization: Bearer rk_test_...
Content-Type: application/json
User-Agent: @refundkit/sdk
```

### REST API Authentication

For direct REST API calls, pass your API key as a Bearer token in the `Authorization` header:

```bash
curl -X POST https://api.refundkit.dev/v1/refunds \
  -H "Authorization: Bearer rk_test_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345" \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"txn_abc123","amount":2999,"reason":"product_not_received"}'
```

### MCP Server Authentication

The MCP server reads the API key from the `REFUNDKIT_API_KEY` environment variable:

```bash
REFUNDKIT_API_KEY=rk_test_... npx @refundkit/sdk
```

When configuring in Claude Desktop or other MCP clients, set the env variable in the config:

```json
{
  "mcpServers": {
    "refundkit": {
      "command": "npx",
      "args": ["-y", "@refundkit/sdk"],
      "env": {
        "REFUNDKIT_API_KEY": "rk_test_..."
      }
    }
  }
}
```

The MCP server will exit with an error if `REFUNDKIT_API_KEY` is not set.

> Coming in v1.0: Remote MCP server at `mcp.refundkit.dev` with OAuth 2.0 authentication, eliminating the need for local API key configuration.

### Dashboard Authentication

The dashboard (`app.refundkit.dev`) uses Supabase Auth with session cookies. Users log in with email/password and are associated with organizations through the `users_organizations` table. The dashboard supports three roles:

| Role | Permissions |
|------|-------------|
| `owner` | Full access. Can manage billing, delete org, manage members. |
| `admin` | Can manage API keys, processor connections, and view all refunds. |
| `member` | Can view refunds and logs. Read-only access to API keys and processors. |

### API Key Security

API keys are never stored in plaintext. The security model:

1. **Generation**: `rk_{environment}_` prefix + 32 cryptographically random characters (from `crypto.randomBytes`)
2. **Storage**: Only the SHA-256 hash of the full key is stored in the database. The original key is shown once at creation time.
3. **Display prefix**: The first 16 characters (prefix + 8 chars) are stored separately for display in the dashboard (e.g., `rk_test_aBcDeFgH...`).
4. **Lookup**: On each API request, the raw key is hashed with SHA-256 and compared against stored hashes using an indexed column for fast lookup.
5. **Revocation**: Keys can be revoked from the dashboard. Revoked keys are soft-deleted (`revoked_at` timestamp) and rejected on lookup.

```typescript
// Utility functions available from the SDK
import {
  generateApiKey,
  hashApiKey,
  isValidApiKeyFormat,
  getApiKeyEnvironment,
} from '@refundkit/sdk';

// Generate a new API key
const { key, hash, prefix } = generateApiKey('test');
// key:    "rk_test_aBcDeFgH..." (40 chars, show once to user)
// hash:   "e3b0c44298fc1c14..." (64 hex chars, store in DB)
// prefix: "rk_test_aBcDeFgH"   (16 chars, store for display)

// Validate format
isValidApiKeyFormat('rk_live_<your-key-here>'); // true (32+ alphanumeric chars after prefix)
isValidApiKeyFormat('sk_test_abc');                                // false

// Detect environment
getApiKeyEnvironment('rk_live_...');  // 'live'
getApiKeyEnvironment('rk_test_...');  // 'test'
getApiKeyEnvironment('invalid');      // null
```

---

## SDK Reference

The SDK exposes resources as properties on the `RefundKit` instance. Every method returns a `Promise<ApiResponse<T>>` with the shape `{ data: T | null, error: RefundKitError | null }`. Exactly one of `data` or `error` will be non-null.

```typescript
import { RefundKit } from '@refundkit/sdk';
import type { ApiResponse, Refund } from '@refundkit/sdk';

const rk = new RefundKit({ apiKey: '...' });

// Every method returns { data, error }
const result: ApiResponse<Refund> = await rk.refunds.get('ref_abc');

if (result.error) {
  // Handle error -- data is null
  console.error(result.error.code, result.error.message);
} else {
  // Handle success -- error is null
  console.log(result.data.id);
}
```

### Refunds

The `rk.refunds` resource handles the full refund lifecycle: create, read, list, and cancel.

#### rk.refunds.create(params)

Create a new refund. The refund starts in `pending` status and progresses through the lifecycle automatically.

```typescript
const { data, error } = await rk.refunds.create({
  transactionId: 'txn_abc123',       // Required -- the payment transaction ID
  amount: 2999,                      // Required -- amount in cents (smallest currency unit)
  reason: 'product_not_received',    // Required -- see RefundReason values below
  currency: 'usd',                   // Optional -- ISO 4217 code (default: 'usd')
  processor: 'stripe',               // Optional -- auto-detected from transaction if omitted
  metadata: { orderId: 'order_456' },// Optional -- arbitrary key-value pairs
});
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `transactionId` | `string` | Yes | -- | The payment transaction ID from your processor (e.g., Stripe charge ID) |
| `amount` | `number` | Yes | -- | Refund amount in the smallest currency unit (cents for USD). Must be positive. |
| `reason` | `RefundReason` | Yes | -- | Why the refund is being requested. See values below. |
| `currency` | `string` | No | `'usd'` | ISO 4217 three-letter currency code |
| `processor` | `string` | No | auto-detected | Payment processor name. Auto-detected from the transaction if omitted. |
| `metadata` | `Record<string, unknown>` | No | `undefined` | Arbitrary key-value metadata. Stored as JSONB. |

**RefundReason values (v0.1):**

| Value | Description |
|-------|-------------|
| `product_not_received` | Customer never received the product |
| `product_defective` | Product arrived damaged or defective |
| `wrong_product` | Customer received the wrong item |
| `duplicate_charge` | Customer was charged more than once |
| `subscription_cancelled` | Charge after subscription cancellation |
| `other` | Catch-all for reasons not covered above |

> Coming in v0.2: Additional reason values -- `agent_error`, `price_change`, `sizing_issue`, `item_not_as_described`, `order_cancelled`, `return_window_closing`

**Response:**

```typescript
{
  data: {
    id: 'ref_a1b2c3d4',
    organizationId: 'org_xyz',
    transactionId: 'txn_abc123',
    amount: 2999,
    currency: 'usd',
    reason: 'product_not_received',
    status: 'pending',
    processor: 'stripe',
    externalRefundId: null,        // Populated after processor confirms
    metadata: { orderId: 'order_456' },
    initiatedBy: 'api',           // 'api' | 'dashboard' | 'mcp'
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  error: null
}
```

**Refund Statuses:**

| Status | Description |
|--------|-------------|
| `pending` | Refund created, awaiting processing |
| `processing` | Sent to payment processor, awaiting confirmation |
| `completed` | Refund successfully processed. Funds returned to customer. |
| `failed` | Processor rejected the refund. Check error details. |
| `cancelled` | Refund was cancelled before completion |

**Validation:** The SDK validates all parameters with Zod before sending the request. If validation fails, it returns a `validation_error` without making a network call:

```typescript
const { error } = await rk.refunds.create({
  transactionId: '',       // Empty string fails: "Transaction ID is required"
  amount: -100,            // Negative fails: "Amount must be positive"
  reason: 'invalid' as any, // Invalid enum fails
});
// error.code === 'validation_error'
```

#### rk.refunds.get(refundId)

Get a single refund by ID. Returns the full refund object including current status and metadata.

```typescript
const { data, error } = await rk.refunds.get('ref_a1b2c3d4');
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refundId` | `string` | Yes | The refund ID (e.g., `ref_a1b2c3d4`) |

Returns `{ data: Refund, error: null }` on success, or `{ data: null, error: RefundKitError }` if the refund is not found (`not_found`) or the ID is empty (`validation_error`).

#### rk.refunds.list(params?)

List refunds with optional filters. Supports pagination with `limit` and `offset`.

```typescript
const { data, error } = await rk.refunds.list({
  status: 'pending',        // Optional -- filter by status
  processor: 'stripe',      // Optional -- filter by processor
  limit: 25,                // Optional -- max results (1-100, default: 25)
  offset: 0,                // Optional -- pagination offset (default: 0)
});
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `status` | `RefundStatus` | No | all | Filter by refund status |
| `processor` | `string` | No | all | Filter by payment processor name |
| `limit` | `number` | No | `25` | Maximum results to return (1-100) |
| `offset` | `number` | No | `0` | Number of results to skip for pagination |

**Response:**

```typescript
{
  data: [
    { id: 'ref_a1b2c3d4', status: 'pending', amount: 2999, ... },
    { id: 'ref_e5f6g7h8', status: 'completed', amount: 1500, ... },
  ],
  error: null
}
```

**Pagination example:**

```typescript
// Fetch page 1
const page1 = await rk.refunds.list({ limit: 10, offset: 0 });

// Fetch page 2
const page2 = await rk.refunds.list({ limit: 10, offset: 10 });
```

#### rk.refunds.cancel(refundId)

Cancel a pending or processing refund. Only refunds in `pending` or `processing` status can be cancelled. Refunds in terminal states (`completed`, `failed`, `cancelled`) return a `refund_not_cancellable` error.

```typescript
const { data, error } = await rk.refunds.cancel('ref_a1b2c3d4');

if (error?.code === 'refund_not_cancellable') {
  console.log('Refund is already in a terminal state');
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refundId` | `string` | Yes | The refund ID to cancel |

Returns the updated refund object with `status: 'cancelled'`.

### Policies

The `rk.policies` resource checks refund eligibility against merchant policies.

#### rk.policies.check(params)

Check if a transaction is eligible for a refund. Returns eligibility status, conditions, and deadlines.

```typescript
const { data, error } = await rk.policies.check({
  transactionId: 'txn_abc123',    // Required -- the transaction to check
  amount: 2999,                   // Optional -- specific amount to validate against policy
});
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transactionId` | `string` | Yes | The transaction ID to check eligibility for |
| `amount` | `number` | No | Specific refund amount to check. If omitted, checks general eligibility. |

**Response:**

```typescript
{
  data: {
    eligible: true,
    reason: 'Transaction is within the refund window',
    maxAmount: null,                          // null = full amount eligible
    deadline: '2024-02-15T00:00:00Z',         // null = no deadline
    conditions: [
      'Original payment must be settled',
      'Items must not have been used',
    ],
  },
  error: null
}
```

**RefundPolicy type:**

| Field | Type | Description |
|-------|------|-------------|
| `eligible` | `boolean` | Whether the transaction is eligible for refund |
| `reason` | `string` | Human-readable explanation of the eligibility decision |
| `maxAmount` | `number \| null` | Maximum refundable amount in cents, or `null` for full amount |
| `deadline` | `string \| null` | ISO 8601 deadline for the refund, or `null` for no deadline |
| `conditions` | `string[]` | List of conditions that must be met for the refund |

> Coming in v0.2: Full Policy Engine with `rk.policies.checkEligibility()` and `rk.policies.getReturnPolicy()`

#### rk.policies.checkEligibility(params) -- v0.2

> Coming in v0.2

Enhanced eligibility check that evaluates against the full policy engine, including per-item rules, customer history, and auto-approval thresholds.

```typescript
const { data, error } = await rk.policies.checkEligibility({
  transactionId: 'txn_abc123',
  amount: 2999,
  items: [{ sku: 'SKU-001', category: 'clothing', quantity: 1 }],
  customerId: 'cust_789',
});
```

Response includes detailed policy evaluation:

```typescript
{
  data: {
    eligible: true,
    policy: {
      returnWindowDays: 30,
      daysRemaining: 18,
      restockingFeePercent: 0,
      exchangeOnly: false,
      finalSale: false,
    },
    perItemEligibility: [
      { sku: 'SKU-001', eligible: true, reason: 'Within return window' }
    ],
    customerHistory: {
      totalReturns30d: 2,
      totalReturns90d: 5,
      limitReached: false,
    },
    maxRefundAmount: 2999,
    deadline: '2024-02-15T00:00:00Z',
    conditions: ['Original packaging required'],
    autoApproved: true,
  },
  error: null
}
```

#### rk.policies.getReturnPolicy(params) -- v0.2

> Coming in v0.2

Get the full return policy for a merchant or product category.

```typescript
const { data, error } = await rk.policies.getReturnPolicy({
  merchantId: 'merch_123',
  category: 'electronics',       // Optional -- get category-specific rules
});
```

### Returns -- v0.2

> Coming in v0.2

The `rk.returns` resource manages the full return lifecycle: RMA generation, shipping labels, tracking, and inspection.

#### rk.returns.create(params)

Create a return with automatic RMA generation and optional shipping label.

```typescript
const { data, error } = await rk.returns.create({
  refundId: 'ref_a1b2c3d4',
  items: [
    { sku: 'SKU-001', quantity: 1, reason: 'wrong_size' },
  ],
  returnMethod: 'mail',         // 'mail' | 'drop_off' | 'keep_item'
});
```

**Response:**

```typescript
{
  data: {
    id: 'ret_xyz789',
    rmaNumber: 'RMA-ACME-20240115-7K3M',
    status: 'requested',           // requested -> shipped -> received -> inspected -> completed
    items: [
      { sku: 'SKU-001', quantity: 1, reason: 'wrong_size' }
    ],
    shippingLabel: {
      carrier: 'ups',
      trackingNumber: '1Z999AA10123456784',
      labelUrl: 'https://...',
    },
    deadline: '2024-01-30T00:00:00Z',
    createdAt: '2024-01-15T10:30:00Z',
  },
  error: null
}
```

#### rk.returns.get(id)

Get a return by ID, including current status and tracking information.

```typescript
const { data, error } = await rk.returns.get('ret_xyz789');
```

#### rk.returns.list(params?)

List returns with optional filters.

```typescript
const { data, error } = await rk.returns.list({
  status: 'shipped',
  limit: 20,
  offset: 0,
});
```

#### rk.returns.trackShipment(id)

Get real-time tracking information for a return shipment.

```typescript
const { data, error } = await rk.returns.trackShipment('ret_xyz789');
// data: { carrier: 'ups', trackingNumber: '1Z...', events: [...], estimatedDelivery: '...' }
```

#### rk.returns.cancel(id)

Cancel a return that has not yet been shipped.

```typescript
const { data, error } = await rk.returns.cancel('ret_xyz789');
```

### Disputes -- v0.3

> Coming in v0.3

The `rk.disputes` resource provides chargeback risk scoring and pre-emptive dispute prevention.

#### rk.disputes.getRisk(params)

Get a chargeback risk score for a transaction. Use this to decide whether to proactively issue a refund before the customer initiates a chargeback.

```typescript
const { data, error } = await rk.disputes.getRisk({
  transactionId: 'txn_abc123',
  customerId: 'cust_789',
});
```

**Response:**

```typescript
{
  data: {
    riskLevel: 'medium',                       // 'low' | 'medium' | 'high' | 'critical'
    score: 62,                                 // 0-100 (higher = more risky)
    signals: [
      { type: 'velocity', description: '3 returns in 30 days', weight: 0.4 },
      { type: 'amount_anomaly', description: 'Refund > 80% of order', weight: 0.2 },
    ],
    recommendation: 'approve_with_review',     // 'auto_approve' | 'approve_with_review' | 'deny' | 'escalate'
    preemptiveRefundAdvised: false,
  },
  error: null
}
```

### Approvals -- v0.3

> Coming in v0.3

The `rk.approvals` resource manages the human-in-the-loop approval workflow for refunds that exceed auto-approval thresholds.

#### rk.approvals.listPending(params?)

List refunds awaiting human approval.

```typescript
const { data, error } = await rk.approvals.listPending({
  limit: 20,
  offset: 0,
});
```

#### rk.approvals.approve(id)

Approve a pending refund.

```typescript
const { data, error } = await rk.approvals.approve('ref_a1b2c3d4');
```

#### rk.approvals.reject(id, reason)

Reject a pending refund with a reason.

```typescript
const { data, error } = await rk.approvals.reject('ref_a1b2c3d4', 'Suspected fraud');
```

#### rk.approvals.escalate(id)

Escalate a refund for higher-level review.

```typescript
const { data, error } = await rk.approvals.escalate('ref_a1b2c3d4');
```

### Store Credit -- v0.2

> Coming in v0.2

The `rk.storeCredit` resource allows issuing store credit as an alternative to processor refunds.

#### rk.storeCredit.issue(params)

Issue store credit to a customer instead of refunding to their payment method.

```typescript
const { data, error } = await rk.storeCredit.issue({
  customerId: 'cust_789',
  amount: 2999,
  currency: 'usd',
  reason: 'Return processed as store credit',
  expiresAt: '2025-01-15T00:00:00Z',     // Optional expiration
});
```

---

## MCP Server

### Overview

RefundKit provides an MCP (Model Context Protocol) server that exposes refund tools to AI agents. Any MCP-compatible client -- Claude Desktop, ChatGPT, Gemini, Cursor, Windsurf, or custom agents -- can use these tools to process refunds, check policies, and manage the refund lifecycle.

The MCP server runs as a local stdio process. It initializes a `RefundKit` SDK instance internally and translates MCP tool calls into SDK method calls.

**How it works:**

1. AI agent discovers available tools via MCP `ListTools`
2. Agent decides to call a tool (e.g., `refundkit_process_refund`)
3. MCP server validates parameters with Zod
4. MCP server calls the corresponding SDK method
5. Result is returned to the agent as structured JSON text

### Setup

#### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "refundkit": {
      "command": "npx",
      "args": ["-y", "@refundkit/sdk"],
      "env": {
        "REFUNDKIT_API_KEY": "rk_test_..."
      }
    }
  }
}
```

#### Cursor / Windsurf / Other MCP Clients

The setup is similar -- point the MCP client to the `@refundkit/sdk` package and provide the `REFUNDKIT_API_KEY` environment variable.

#### Custom Integration

You can also create the MCP server programmatically:

```typescript
import { createMcpServer } from '@refundkit/sdk/mcp';

const server = createMcpServer(
  'rk_test_...',                        // API key
  'https://api.refundkit.dev',          // Optional base URL
);

// Connect to your own transport
await server.connect(yourTransport);
```

> Coming in v1.0: Remote MCP server with OAuth 2.0 authentication
>
> ```json
> {
>   "mcpServers": {
>     "refundkit": {
>       "url": "https://mcp.refundkit.dev",
>       "auth": { "type": "oauth2" }
>     }
>   }
> }
> ```

### Tools Reference

#### Current Tools (v0.1)

The MCP server exposes 5 tools in v0.1:

---

**refundkit_process_refund**

Process a refund for a transaction. Initiates a refund through the configured payment processor.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transactionId` | `string` | Yes | The transaction ID to refund |
| `amount` | `number` | Yes | Refund amount in smallest currency unit (e.g., cents) |
| `reason` | `string` | Yes | Reason for the refund. One of: `product_not_received`, `product_defective`, `wrong_product`, `duplicate_charge`, `subscription_cancelled`, `other` |
| `currency` | `string` | No | Three-letter currency code (default: `usd`) |

**Example agent interaction:**
```
User: "I want to refund my order #12345 for $29.99 because it never arrived."
Agent calls: refundkit_process_refund({
  transactionId: "txn_12345",
  amount: 2999,
  reason: "product_not_received"
})
```

---

**refundkit_check_refund_status**

Check the current status of a refund by its ID. Returns the full refund object.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refundId` | `string` | Yes | The refund ID to check (e.g., `ref_a1b2c3d4`) |

---

**refundkit_list_refunds**

List refunds with optional filters for status, processor, and pagination.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | `string` | No | Filter by status: `pending`, `processing`, `completed`, `failed`, `cancelled` |
| `processor` | `string` | No | Filter by payment processor name |
| `limit` | `number` | No | Max results to return (default: 25) |
| `offset` | `number` | No | Offset for pagination (default: 0) |

---

**refundkit_get_policy**

Get the refund policy for a specific transaction. Returns eligibility, conditions, and deadlines.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transactionId` | `string` | Yes | The transaction ID to check policy for |
| `amount` | `number` | No | Optional refund amount to check against policy limits |

---

**refundkit_cancel_refund**

Cancel a pending refund. Only refunds in `pending` or `processing` status can be cancelled.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refundId` | `string` | Yes | The refund ID to cancel |

---

#### Planned Tools (v0.4)

> Coming in v0.4: 7 additional tools, bringing the total to 12

| Tool | Description |
|------|-------------|
| `refundkit_check_eligibility` | Check refund eligibility with full policy engine evaluation (per-item, customer history, auto-approve) |
| `refundkit_get_return_policy` | Get detailed return policy for a merchant or product category |
| `refundkit_create_return` | Create a return with RMA generation and shipping label |
| `refundkit_track_return` | Track return shipment status with carrier events |
| `refundkit_get_dispute_risk` | Get chargeback risk score and prevention recommendations |
| `refundkit_issue_store_credit` | Issue store credit instead of a processor refund |
| `refundkit_approve_refund` | Approve a pending refund in the approval workflow |

---

## Policy Engine -- v0.2

> Coming in v0.2

### Overview

The Policy Engine evaluates refund eligibility against machine-readable merchant policies defined as JSON schemas. Instead of hard-coding refund logic, merchants define their return policies as structured data. The engine then evaluates every refund request against these rules in real time.

This lets AI agents make informed decisions without needing to parse human-readable return policy pages.

### Policy Schema

Policies are defined as JSON documents with category-level rules and global limits:

```json
{
  "merchantId": "merch_123",
  "name": "Standard Return Policy",
  "version": 1,
  "rules": [
    {
      "category": "clothing",
      "returnWindowDays": 30,
      "restockingFeePercent": 0,
      "exchangeOnly": false,
      "finalSale": false,
      "conditions": ["tags_attached", "unworn", "original_packaging"]
    },
    {
      "category": "electronics",
      "returnWindowDays": 15,
      "restockingFeePercent": 15,
      "exchangeOnly": false,
      "finalSale": false,
      "conditions": ["original_packaging", "all_accessories"]
    },
    {
      "category": "clearance",
      "finalSale": true
    },
    {
      "category": "default",
      "returnWindowDays": 30,
      "restockingFeePercent": 0,
      "exchangeOnly": false,
      "finalSale": false,
      "conditions": []
    }
  ],
  "globalLimits": {
    "maxReturnsPerCustomer30d": 5,
    "maxReturnValuePerCustomer90d": 100000,
    "autoApproveThreshold": 5000
  }
}
```

**Rule fields:**

| Field | Type | Description |
|-------|------|-------------|
| `category` | `string` | Product category this rule applies to. `"default"` is the fallback. |
| `returnWindowDays` | `number` | Days after purchase that returns are accepted |
| `restockingFeePercent` | `number` | Percentage deducted from refund (0-100) |
| `exchangeOnly` | `boolean` | If `true`, refund is not available -- only exchange |
| `finalSale` | `boolean` | If `true`, no returns or refunds are allowed |
| `conditions` | `string[]` | Requirements that must be met (e.g., tags attached, original packaging) |

**Global limits:**

| Field | Type | Description |
|-------|------|-------------|
| `maxReturnsPerCustomer30d` | `number` | Maximum returns a single customer can make in 30 days |
| `maxReturnValuePerCustomer90d` | `number` | Maximum total refund value (cents) per customer in 90 days |
| `autoApproveThreshold` | `number` | Refunds below this amount (cents) are auto-approved without human review |

### Evaluation Flow

When a refund eligibility check is requested, the Policy Engine follows this sequence:

1. **Parse transaction** -- Identify the merchant, product category, purchase date, and customer from the transaction ID
2. **Load merchant policy** -- Fetch the JSON policy rules for this merchant
3. **Match category rule** -- Find the most specific category rule; fall back to `"default"` if no match
4. **Check final sale** -- If `finalSale: true`, immediately return ineligible
5. **Evaluate return window** -- Compare purchase date against `returnWindowDays`. If expired, return ineligible with days-past-deadline.
6. **Check exchange-only** -- If `exchangeOnly: true`, flag that only exchange is available
7. **Check customer history** -- Query customer's return count (30d) and return value (90d) against global limits
8. **Calculate restocking fee** -- Apply `restockingFeePercent` to compute the net refund amount
9. **Determine auto-approve** -- If refund amount is below `autoApproveThreshold` and customer is within limits, mark as auto-approved
10. **Return decision** -- Full eligibility response with policy details, conditions, deadlines, and approval status

---

## Webhooks -- v0.5

> Coming in v0.5

### Event Types

RefundKit will emit webhooks for key lifecycle events:

| Event | Description |
|-------|-------------|
| `refund.initiated` | A new refund has been created |
| `refund.approved` | Refund passed the approval workflow |
| `refund.processing` | Refund sent to the payment processor |
| `refund.completed` | Refund successfully processed by the processor |
| `refund.failed` | Refund failed at the processor level |
| `refund.cancelled` | Refund was cancelled |
| `return.created` | Return/RMA created |
| `return.shipped` | Return package marked as shipped |
| `return.received` | Return package received at warehouse |
| `return.inspected` | Return item has been inspected |
| `approval.pending` | Refund is waiting for human approval |
| `approval.decided` | Human made an approval/rejection decision |
| `dispute.risk_flagged` | High-risk transaction detected by fraud scoring |

### Webhook Payload

All webhook payloads follow a consistent structure:

```json
{
  "id": "evt_abc123",
  "type": "refund.completed",
  "created": "2024-01-15T10:31:12Z",
  "apiVersion": "2024-01-01",
  "data": {
    "refundId": "ref_a1b2c3d4",
    "amount": 2999,
    "currency": "usd",
    "processor": "stripe",
    "externalRefundId": "re_stripe_xyz",
    "status": "completed"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique event ID. Use for idempotency. |
| `type` | `string` | Event type (see table above) |
| `created` | `string` | ISO 8601 timestamp of when the event occurred |
| `apiVersion` | `string` | API version the event was generated for |
| `data` | `object` | Event-specific payload |

### Signature Verification

Webhook requests include an `x-refundkit-signature` header. Always verify this signature to ensure the request came from RefundKit and was not tampered with.

```typescript
import { verifyWebhookSignature } from '@refundkit/sdk';

app.post('/webhooks/refundkit', (req, res) => {
  const isValid = verifyWebhookSignature(
    req.body,                                    // Raw request body (string or Buffer)
    req.headers['x-refundkit-signature'],         // Signature header
    process.env.REFUNDKIT_WEBHOOK_SECRET!,        // Your webhook secret
  );

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.body);
  switch (event.type) {
    case 'refund.completed':
      // Handle completed refund
      break;
    case 'refund.failed':
      // Handle failed refund
      break;
  }

  res.status(200).json({ received: true });
});
```

---

## Processors

### Supported Processors

| Processor | Status | Version | Notes |
|-----------|--------|---------|-------|
| Stripe | Available | v0.1+ | Full refund lifecycle, webhook validation |
| Square | Planned | v0.4 | |
| PayPal | Future | v2.0 | |
| Adyen | Future | v3.0 | |

### Stripe Processor

Stripe is the default and currently only available payment processor. RefundKit uses the Stripe Node.js SDK (`stripe` package) to process refunds, check statuses, and cancel refunds.

**How the Stripe processor works:**

| RefundKit Operation | Stripe API Call |
|---------------------|-----------------|
| `processRefund` | `stripe.refunds.create()` |
| `getRefundStatus` | `stripe.refunds.retrieve()` |
| `cancelRefund` | `stripe.refunds.cancel()` |
| `validateTransaction` | `stripe.charges.retrieve()` |

**Reason mapping:**

RefundKit maps its refund reasons to Stripe's limited set:

| RefundKit Reason | Stripe Reason |
|------------------|---------------|
| `duplicate_charge` | `duplicate` |
| `product_not_received` | `requested_by_customer` |
| `product_defective` | `requested_by_customer` |
| `wrong_product` | `requested_by_customer` |
| `subscription_cancelled` | (none -- omitted) |
| `other` | (none -- omitted) |

**Status mapping:**

| Stripe Status | RefundKit Status |
|---------------|------------------|
| `succeeded` | `completed` |
| `pending` | `processing` |
| `failed` | `failed` |
| `canceled` | `failed` |

**Usage:**

The `StripeProcessor` class implements the `PaymentProcessor` interface:

```typescript
import { StripeProcessor } from '@refundkit/sdk';

const stripe = new StripeProcessor('sk_test_...');

// Process a refund directly (usually done through the SDK, not directly)
const result = await stripe.processRefund({
  transactionId: 'ch_abc123',      // Stripe charge ID
  amount: 2999,
  currency: 'usd',
  reason: 'product_not_received',
});
// result: { externalRefundId: 're_xyz', status: 'processing', processedAt: '...' }

// Validate a transaction
const info = await stripe.validateTransaction('ch_abc123');
// info: { transactionId: 'ch_abc123', amount: 5000, currency: 'usd', processor: 'stripe', valid: true }
```

**Stripe webhook handling:**

The dashboard includes a Stripe webhook endpoint at `/api/webhooks/stripe` for processing Stripe-initiated events. Configure your Stripe webhook to point to `https://app.refundkit.dev/api/webhooks/stripe`.

### Custom Processors

You can implement the `PaymentProcessor` interface to add support for any payment processor:

```typescript
import type {
  PaymentProcessor,
  RefundParams,
  ProcessorRefundResult,
  ProcessorStatus,
  ProcessorCancelResult,
  TransactionInfo,
} from '@refundkit/sdk';

class CustomProcessor implements PaymentProcessor {
  readonly name = 'custom';

  async processRefund(params: RefundParams): Promise<ProcessorRefundResult> {
    // Call your payment processor's refund API
    const result = await yourApi.createRefund({
      chargeId: params.transactionId,
      amount: params.amount,
      currency: params.currency,
    });

    return {
      externalRefundId: result.id,
      status: 'processing',
      processedAt: new Date().toISOString(),
    };
  }

  async getRefundStatus(externalId: string): Promise<ProcessorStatus> {
    const refund = await yourApi.getRefund(externalId);
    return {
      externalRefundId: refund.id,
      status: mapYourStatus(refund.status),
      updatedAt: refund.updatedAt,
    };
  }

  async cancelRefund(externalId: string): Promise<ProcessorCancelResult> {
    const result = await yourApi.cancelRefund(externalId);
    return {
      cancelled: result.success,
      cancelledAt: result.success ? new Date().toISOString() : null,
    };
  }

  async validateTransaction(transactionId: string): Promise<TransactionInfo> {
    const charge = await yourApi.getCharge(transactionId);
    return {
      transactionId: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      processor: 'custom',
      valid: charge.paid && !charge.refunded,
    };
  }
}
```

**PaymentProcessor interface:**

| Method | Returns | Description |
|--------|---------|-------------|
| `processRefund(params)` | `ProcessorRefundResult` | Submit a refund to the processor |
| `getRefundStatus(externalId)` | `ProcessorStatus` | Check the current status of a processor refund |
| `cancelRefund(externalId)` | `ProcessorCancelResult` | Cancel a refund at the processor |
| `validateTransaction(transactionId)` | `TransactionInfo` | Validate a transaction exists and is refundable |

---

## Error Handling

### Error Response Format

Every SDK method returns `{ data, error }`. The `error` is either `null` (success) or a `RefundKitError` instance:

```typescript
import { RefundKitError, ErrorCode } from '@refundkit/sdk';

const { data, error } = await rk.refunds.get('ref_xxx');

if (error) {
  console.log(error.message);      // "Refund not found"
  console.log(error.code);         // "not_found"
  console.log(error.statusCode);   // 404
  console.log(error.name);         // "RefundKitError"
  console.log(error instanceof RefundKitError); // true
}
```

The SDK **never throws** from resource methods. All errors are captured and returned in the `error` field. The only exception is the constructor, which throws if `apiKey` is empty.

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_api_key` | 401 | API key is malformed, expired, revoked, or does not exist |
| `unauthorized` | 401 | API key is valid but lacks permissions for this operation |
| `not_found` | 404 | The requested resource (refund, policy, etc.) does not exist |
| `validation_error` | 400 | Request body or parameters failed Zod validation |
| `refund_already_processed` | 409 | A refund already exists for this transaction |
| `refund_not_cancellable` | 409 | Refund is in a terminal state (`completed`, `failed`, `cancelled`) |
| `processor_error` | 502 | The payment processor returned an error (e.g., Stripe API failure) |
| `rate_limited` | 429 | Too many requests. Default limit: 100 requests/minute per API key. |
| `internal_error` | 500 | Unexpected server error. If persistent, contact support. |
| `network_error` | -- | SDK could not reach the API (DNS failure, no internet, etc.) |
| `timeout` | -- | Request exceeded the configured timeout (default: 30s) |

> Coming in v0.3: Additional error codes -- `policy_violation`, `approval_required`, `risk_threshold_exceeded`, `return_window_expired`

**Using error codes programmatically:**

```typescript
import { ErrorCode } from '@refundkit/sdk';

const { error } = await rk.refunds.create({ ... });

switch (error?.code) {
  case ErrorCode.VALIDATION_ERROR:
    // Fix the request parameters
    break;
  case ErrorCode.REFUND_ALREADY_PROCESSED:
    // Duplicate -- the refund already exists
    break;
  case ErrorCode.PROCESSOR_ERROR:
    // Stripe/processor issue -- retry or contact support
    break;
  case ErrorCode.RATE_LIMITED:
    // Back off and retry
    break;
}
```

### Retry Strategy

Network errors, timeouts, rate limits, and internal server errors are typically transient. Here is a recommended retry strategy with exponential backoff and jitter:

```typescript
import { RefundKit, ErrorCode } from '@refundkit/sdk';
import type { ApiResponse } from '@refundkit/sdk';

const RETRYABLE_CODES = new Set([
  ErrorCode.RATE_LIMITED,
  ErrorCode.INTERNAL_ERROR,
  ErrorCode.NETWORK_ERROR,
  ErrorCode.TIMEOUT,
]);

async function withRetry<T>(
  fn: () => Promise<ApiResponse<T>>,
  maxRetries = 3,
): Promise<ApiResponse<T>> {
  let lastResult: ApiResponse<T>;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    lastResult = await fn();

    // Success or non-retryable error -- return immediately
    if (!lastResult.error || !RETRYABLE_CODES.has(lastResult.error.code)) {
      return lastResult;
    }

    // Last attempt failed -- don't sleep, just return the error
    if (attempt === maxRetries) break;

    // Exponential backoff with jitter: 1s, 2s, 4s (capped at 30s)
    const baseDelay = Math.min(1000 * 2 ** attempt, 30_000);
    const jitter = Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter));
  }

  return lastResult!;
}

// Usage
const rk = new RefundKit({ apiKey: process.env.REFUNDKIT_API_KEY! });

const result = await withRetry(() =>
  rk.refunds.create({
    transactionId: 'txn_abc123',
    amount: 2999,
    reason: 'product_not_received',
  }),
);
```

**Rate limiting details:**

- Default rate limit: 100 requests per minute per API key
- When rate-limited, the response includes a `Retry-After` header (seconds)
- Test keys (`rk_test_`) have the same rate limits as live keys

---

## REST API Reference

### Base URL

```
https://api.refundkit.dev/v1
```

For local development:

```
http://localhost:3000/api/v1
```

### Request Format

- All request bodies must be JSON with `Content-Type: application/json`
- All monetary amounts are in the smallest currency unit (cents for USD)
- All timestamps are ISO 8601 in UTC
- Authentication via `Authorization: Bearer rk_...` header

### Response Format

Every endpoint returns a consistent `{ data, error }` envelope:

**Success:**
```json
{
  "data": { ... },
  "error": null
}
```

**Error:**
```json
{
  "data": null,
  "error": {
    "message": "Human-readable error description",
    "code": "error_code"
  }
}
```

HTTP status codes follow standard conventions:
- `200` -- Success (GET, cancel)
- `201` -- Created (POST create)
- `400` -- Validation error
- `401` -- Authentication error
- `404` -- Resource not found
- `409` -- Conflict (duplicate, not cancellable)
- `429` -- Rate limited
- `500` -- Internal server error
- `502` -- Processor error

### Endpoints

#### POST /v1/refunds

Create a new refund.

**Request body:**
```json
{
  "transactionId": "txn_abc123",
  "amount": 2999,
  "currency": "usd",
  "reason": "product_not_received",
  "processor": "stripe",
  "metadata": { "orderId": "order_456" }
}
```

**Response (201):**
```json
{
  "data": {
    "id": "ref_a1b2c3d4",
    "organizationId": "org_xyz",
    "externalRefundId": null,
    "transactionId": "txn_abc123",
    "amount": 2999,
    "currency": "usd",
    "reason": "product_not_received",
    "status": "pending",
    "processor": "stripe",
    "metadata": { "orderId": "order_456" },
    "initiatedBy": "api",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

**cURL example:**
```bash
curl -X POST https://api.refundkit.dev/v1/refunds \
  -H "Authorization: Bearer rk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "txn_abc123",
    "amount": 2999,
    "reason": "product_not_received"
  }'
```

---

#### GET /v1/refunds

List refunds with optional query parameter filters.

**Query parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | `string` | No | all | Filter: `pending`, `processing`, `completed`, `failed`, `cancelled` |
| `processor` | `string` | No | all | Filter by processor name |
| `limit` | `number` | No | `25` | Results per page (1-100) |
| `offset` | `number` | No | `0` | Pagination offset |

**cURL example:**
```bash
curl "https://api.refundkit.dev/v1/refunds?status=pending&limit=10" \
  -H "Authorization: Bearer rk_test_..."
```

**Response (200):**
```json
{
  "data": [
    { "id": "ref_a1b2c3d4", "status": "pending", "amount": 2999, ... },
    { "id": "ref_e5f6g7h8", "status": "pending", "amount": 1500, ... }
  ],
  "error": null
}
```

---

#### GET /v1/refunds/:id

Get a single refund by ID.

**cURL example:**
```bash
curl "https://api.refundkit.dev/v1/refunds/ref_a1b2c3d4" \
  -H "Authorization: Bearer rk_test_..."
```

---

#### POST /v1/refunds/:id/cancel

Cancel a pending or processing refund.

**cURL example:**
```bash
curl -X POST "https://api.refundkit.dev/v1/refunds/ref_a1b2c3d4/cancel" \
  -H "Authorization: Bearer rk_test_..." \
  -H "Content-Type: application/json"
```

**Response (200):**
```json
{
  "data": {
    "id": "ref_a1b2c3d4",
    "status": "cancelled",
    "updatedAt": "2024-01-15T10:35:00Z"
  },
  "error": null
}
```

---

#### POST /v1/policies/check

Check refund eligibility for a transaction.

**Request body:**
```json
{
  "transactionId": "txn_abc123",
  "amount": 2999
}
```

**Response (200):**
```json
{
  "data": {
    "eligible": true,
    "reason": "Transaction is within the refund window",
    "maxAmount": null,
    "deadline": "2024-02-15T00:00:00Z",
    "conditions": [
      "Original payment must be settled",
      "Items must not have been used"
    ]
  },
  "error": null
}
```

---

#### Planned Endpoints

> Coming in v0.2+

| Method | Endpoint | Version | Description |
|--------|----------|---------|-------------|
| POST | `/v1/eligibility/check` | v0.2 | Full policy engine eligibility check |
| GET | `/v1/policies/:id` | v0.2 | Get a policy by ID |
| POST | `/v1/returns` | v0.2 | Create a return with RMA |
| GET | `/v1/returns/:id` | v0.2 | Get a return by ID |
| POST | `/v1/disputes/risk` | v0.3 | Get chargeback risk score |
| GET | `/v1/approvals` | v0.3 | List pending approvals |
| POST | `/v1/approvals/:id/approve` | v0.3 | Approve a refund |
| POST | `/v1/approvals/:id/reject` | v0.3 | Reject a refund |
| POST | `/v1/store-credits` | v0.2 | Issue store credit |

---

## Database Schema

RefundKit uses PostgreSQL via Supabase with Row Level Security (RLS) enabled on every table. All tables use UUID primary keys and `timestamptz` for timestamps.

### Current Tables (v0.1)

#### organizations

The top-level entity. All resources (refunds, API keys, processor connections) belong to an organization.

```sql
create table organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### users_organizations

Many-to-many relationship between Supabase Auth users and organizations, with role-based access.

```sql
create table users_organizations (
  user_id         uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role            text not null check (role in ('owner', 'admin', 'member')),
  created_at      timestamptz not null default now(),

  primary key (user_id, organization_id)
);
```

**RLS:** Users can only see their own memberships (`auth.uid() = user_id`).

#### api_keys

API keys for programmatic access. The raw key is never stored -- only the SHA-256 hash.

```sql
create table api_keys (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  key_hash    text not null unique,      -- SHA-256 hash of the full key
  key_prefix  text not null,             -- First 16 chars for display (e.g., "rk_test_aBcDeFgH")
  name        text not null,             -- Human-readable name (e.g., "Production Key")
  environment text not null check (environment in ('live', 'test')),
  last_used_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

**Indexes:** `idx_api_keys_key_hash` on `key_hash` for fast authentication lookups.

**RLS:** Org members can view their organization's API keys.

#### processor_connections

Encrypted credentials for each payment processor connection per organization.

```sql
create table processor_connections (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references organizations(id) on delete cascade,
  processor             text not null,               -- 'stripe', 'square', etc.
  credentials_encrypted text not null,               -- AES-256 encrypted JSON blob
  status                text not null check (status in ('active', 'inactive', 'error')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  unique (org_id, processor)    -- One connection per processor per org
);
```

**RLS:** Org members can view their organization's processor connections.

#### refunds

The core refund records.

```sql
create table refunds (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references organizations(id) on delete cascade,
  external_refund_id text,                          -- Processor's refund ID (e.g., Stripe re_...)
  transaction_id    text not null,                   -- Original payment transaction ID
  amount            integer not null,                -- Amount in smallest currency unit (cents)
  currency          text not null default 'usd',     -- ISO 4217 code
  reason            text not null,                   -- RefundReason value
  status            text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processor         text not null,                   -- Processor name
  metadata          jsonb,                           -- Arbitrary key-value metadata
  initiated_by      text not null
    check (initiated_by in ('api', 'dashboard', 'mcp')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
```

**Indexes:**
- `idx_refunds_org_id` on `org_id` -- filter by organization
- `idx_refunds_status` on `status` -- filter by refund status
- `idx_refunds_transaction_id` on `transaction_id` -- look up refunds by original payment

**RLS:** Org members can view their organization's refunds.

#### refund_events

Immutable audit trail for every refund state change.

```sql
create table refund_events (
  id         uuid primary key default gen_random_uuid(),
  refund_id  uuid not null references refunds(id) on delete cascade,
  event_type text not null,              -- e.g., 'created', 'processing', 'completed', 'failed'
  details    jsonb,                      -- Event-specific details
  created_at timestamptz not null default now()
);
```

**Indexes:** `idx_refund_events_refund_id` on `refund_id`.

**RLS:** Org members can view events for their organization's refunds (joined through refunds table).

#### api_logs

Request/response audit log for all API calls.

```sql
create table api_logs (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  method        text not null,           -- HTTP method (GET, POST, etc.)
  path          text not null,           -- Request path (e.g., /v1/refunds)
  status_code   integer not null,        -- HTTP response status code
  request_body  jsonb,                   -- Request body (sanitized -- no secrets)
  response_body jsonb,                   -- Response body
  duration_ms   integer,                 -- Request duration in milliseconds
  created_at    timestamptz not null default now()
);
```

**Indexes:** `idx_api_logs_org_id_created_at` composite on `(org_id, created_at)` for time-range queries.

**RLS:** Org members can view their organization's API logs.

### Planned Tables

> Coming in v0.5

| Table | Description | Version |
|-------|-------------|---------|
| `policies` | JSON policy rules per merchant, category, and SKU | v0.2 |
| `returns` | Return lifecycle: RMA number, shipping, tracking, inspection | v0.2 |
| `store_credits` | Customer store credit balances and transactions | v0.2 |
| `approvals` | Approval queue: thresholds, decisions, escalations | v0.3 |
| `dispute_signals` | Risk scores, fraud signals, chargeback flags | v0.3 |

---

## Dashboard

The RefundKit dashboard (`app.refundkit.dev`) is a Next.js 15 application with dark theme, built with Tailwind CSS and shadcn/ui components. It provides a visual interface for managing refunds, API keys, processor connections, and viewing logs.

### Pages

| Page | Path | Description |
|------|------|-------------|
| **Overview** | `/` | Stats cards showing refund volume, success rate, and recent activity |
| **Refunds** | `/refunds` | Filterable list of all refunds with status badges |
| **Refund Detail** | `/refunds/:id` | Single refund view with full details and event timeline |
| **API Keys** | `/api-keys` | Generate, view, and revoke API keys |
| **Processors** | `/processors` | Connect and manage payment processor credentials |
| **Logs** | `/logs` | API request/response audit log with filtering |
| **Settings** | `/settings` | Organization settings and team management |
| **Login** | `/login` | Email/password authentication |
| **Sign Up** | `/signup` | New account registration |
| **Forgot Password** | `/forgot-password` | Password reset flow |

> Coming in v0.3+: Approval queue page, policy management page, return tracking page, dispute risk dashboard

---

## Testing

### Test Mode

Use `rk_test_` API keys for development and testing. Test mode:

- Does not process real refunds or move real money
- Uses the same API endpoints and response shapes as production
- Has the same rate limits as production
- Data is isolated from production (separate environment flag in the database)

### Running SDK Tests

The SDK uses Vitest for testing:

```bash
# Run all tests
pnpm --filter @refundkit/sdk test

# Watch mode
pnpm --filter @refundkit/sdk test:watch
```

**Existing test coverage:**

- **RefundKit constructor** -- validates API key is required, creates instance with valid key
- **API key utilities** -- generation format, consistent hashing, format validation, environment detection
- **Validation schemas** -- Zod schemas for create refund, list refunds, check policy
- **Error types** -- RefundKitError properties (message, code, statusCode, name)

**Example test:**

```typescript
import { describe, it, expect } from 'vitest';
import { RefundKit, RefundKitError, ErrorCode } from '@refundkit/sdk';

describe('RefundKit', () => {
  it('throws when no API key provided', () => {
    expect(() => new RefundKit({ apiKey: '' })).toThrow('API key is required');
  });

  it('creates instance with valid API key', () => {
    const rk = new RefundKit({ apiKey: 'rk_test_abc123abc123abc123abc123abc12345' });
    expect(rk.refunds).toBeDefined();
    expect(rk.policies).toBeDefined();
  });
});
```

**Running all workspace tests:**

```bash
pnpm test       # Runs tests across all packages
pnpm lint       # Lint all packages
```

---

## Changelog

### v0.1.0 (Current)

**Released** -- Initial release.

- **SDK**: `@refundkit/sdk` TypeScript SDK with ESM + CJS dual build
  - `rk.refunds.create()` / `.get()` / `.list()` / `.cancel()` -- full refund CRUD
  - `rk.policies.check()` -- basic refund eligibility check
  - `StripeProcessor` -- Stripe payment processor adapter
  - `RefundKitError` with typed error codes
  - Zod validation on all inputs (client-side, before network call)
  - API key utilities: `generateApiKey`, `hashApiKey`, `isValidApiKeyFormat`, `getApiKeyEnvironment`
- **MCP Server**: 5 tools for AI agents
  - `refundkit_process_refund` -- initiate a refund
  - `refundkit_check_refund_status` -- get refund status
  - `refundkit_list_refunds` -- list refunds with filters
  - `refundkit_get_policy` -- check refund policy
  - `refundkit_cancel_refund` -- cancel a pending refund
- **REST API**: 5 endpoints
  - `POST /v1/refunds` -- create refund
  - `GET /v1/refunds` -- list refunds
  - `GET /v1/refunds/:id` -- get refund
  - `POST /v1/refunds/:id/cancel` -- cancel refund
  - `POST /v1/policies/check` -- check policy
- **Dashboard**: Next.js 15 app with dark theme
  - Overview with stats cards
  - Refund list and detail pages
  - API key management
  - Processor connection management
  - API logs viewer
  - Settings page
  - Auth: login, signup, forgot password
- **Database**: 7 PostgreSQL tables with RLS
  - `organizations`, `users_organizations`, `api_keys`, `processor_connections`, `refunds`, `refund_events`, `api_logs`
- **Auth**: Dual authentication -- API key (Bearer token) + Supabase session (cookie)
- **Tests**: Vitest suite covering constructor, API key utils, validation schemas, error types

### v0.2.0 (Planned)

- Expanded refund reason types
- **Policy Engine** with JSON schema rules per merchant/category
- **Return lifecycle management** -- RMA generation, shipping labels, tracking, inspection
- **Store credit** issuance as refund alternative
- SDK methods: `rk.policies.checkEligibility()`, `rk.policies.getReturnPolicy()`, `rk.returns.*`, `rk.storeCredit.issue()`
- REST endpoints: `POST /v1/eligibility/check`, `GET /v1/policies/:id`, `POST /v1/returns`, `GET /v1/returns/:id`, `POST /v1/store-credits`
- Database tables: `policies`, `returns`, `store_credits`

### v0.3.0 (Planned)

- **Fraud & dispute prevention** -- chargeback risk scoring with signal analysis
- **Approval workflows** -- configurable thresholds, human-in-the-loop queue, escalation
- New error codes: `policy_violation`, `approval_required`, `risk_threshold_exceeded`, `return_window_expired`
- SDK methods: `rk.disputes.getRisk()`, `rk.approvals.listPending()`, `rk.approvals.approve()`, `rk.approvals.reject()`, `rk.approvals.escalate()`
- REST endpoints: `POST /v1/disputes/risk`, `GET /v1/approvals`, `POST /v1/approvals/:id/approve`, `POST /v1/approvals/:id/reject`
- Database tables: `approvals`, `dispute_signals`
- Dashboard pages: approval queue, dispute risk dashboard

### v0.4.0 (Planned)

- **12 MCP tools** (up from 5) -- adding eligibility check, return policy, create return, track return, dispute risk, store credit, approve refund
- **Square processor adapter**
- Split refund support (partial refunds across multiple processors)

### v0.5.0 (Planned)

- **Webhook system** -- event-driven notifications for refund lifecycle, returns, approvals, and disputes
- Webhook signature verification utility
- Database schema expansion for webhook endpoints and delivery logs
- All planned REST API endpoints fully implemented

### v1.0.0 (Planned)

- **Remote MCP server** at `mcp.refundkit.dev` with OAuth 2.0 authentication
- All dashboard pages for approvals, policies, returns, and disputes
- Comprehensive test coverage across all packages
- Performance optimization and production hardening
- Full documentation and API reference
- **Production-ready release**
