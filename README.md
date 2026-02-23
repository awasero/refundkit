# RefundKit

Refund infrastructure for AI agents. Process, track, and manage refunds programmatically through a TypeScript SDK, MCP server, or REST API.

## Packages

| Package | Description |
|---------|-------------|
| `@refundkit/sdk` | TypeScript SDK + MCP server for AI agents |
| `@refundkit/app` | Dashboard for managing refunds, API keys, and processors |
| `@refundkit/website` | Marketing site, documentation, and blog |

## Quick Start

```bash
pnpm install
pnpm dev
```

## SDK Usage

```typescript
import RefundKit from '@refundkit/sdk';

const rk = new RefundKit({ apiKey: 'rk_live_...' });

const { data, error } = await rk.refunds.create({
  transactionId: 'txn_abc123',
  amount: 2999,
  reason: 'product_not_received',
});
```

## MCP Server

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "refundkit": {
      "command": "npx",
      "args": ["@refundkit/sdk", "mcp"],
      "env": {
        "REFUNDKIT_API_KEY": "rk_live_..."
      }
    }
  }
}
```

## Development

```bash
pnpm dev          # Start all packages in dev mode
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm lint         # Lint all packages
```

## License

MIT
