# RefundKit

Refund infrastructure for AI agents — SDK, Dashboard, and Marketing site in a monorepo.

## Stack

- **Framework**: Next.js 15 (App + Website), TypeScript library (SDK)
- **Language**: TypeScript strict
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth + API key auth (dual auth)
- **Hosting**: Vercel
- **CSS**: Tailwind CSS + shadcn/ui
- **Monorepo**: Turborepo + pnpm workspaces

## Commands

```bash
# Development
pnpm dev                   # Start all dev servers
pnpm build                 # Production build (all packages)
pnpm lint                  # Lint all packages
pnpm test                  # Run all tests
pnpm format                # Format with Prettier

# Per-package
pnpm --filter @refundkit/sdk build
pnpm --filter @refundkit/sdk test
pnpm --filter @refundkit/app dev
pnpm --filter @refundkit/website dev
```

## Architecture

```
/
├── packages/
│   ├── sdk/               # @refundkit/sdk — TypeScript SDK + MCP server
│   ├── app/               # @refundkit/app — Next.js dashboard
│   └── website/           # @refundkit/website — Marketing site + docs + blog
├── .claude/skills/        # Claude Code skills
├── turbo.json             # Turborepo config
└── pnpm-workspace.yaml    # Workspace definitions
```

## Code Conventions

- Use named exports, not default exports (except Next.js pages)
- All API routes return `{ data, error }` response shape
- Use Zod for runtime validation on all user inputs
- Server Components by default; `"use client"` only when needed
- Prefer early returns over nested conditionals
- API key format: `rk_live_` / `rk_test_` + 32 random chars

## Security Rules

- NEVER commit `.env` files or secrets — use environment variables
- Validate and sanitize ALL user inputs at the boundary
- Use parameterized queries — never string concatenation for DB queries
- All API endpoints require authentication unless explicitly marked public
- API keys stored as SHA-256 hashes, prefix kept for display
- Stripe webhook signatures must be validated

## Git Workflow

- Branch from `main`: `feat/description` or `fix/description`
- Commit format: `type: short description` (feat, fix, refactor, docs, test, chore)
- Run `pnpm test` and `pnpm lint` before pushing

## Active Skills

- **clean-code** — Small functions, descriptive names, no magic numbers
- **security-guard** — Input validation, parameterized queries, secret management
- **lean-deps** — Justify every package, audit vulnerabilities, pin versions
- **test-discipline** — AAA pattern, behavior tests, no flaky tests
- **api-design** — Consistent response shapes, proper status codes
- **git-discipline** — Atomic commits, clean branches, meaningful messages
- **frontend-lean** — Small components, semantic HTML, mobile-first
- **db-integrity** — Reversible migrations, indexes, constraints

## Environment Variables

See `.env.example` for the full list.
