---
name: project-foundation
description: Establishes the foundation for any new software project by generating CLAUDE.md and custom skills. Use when starting a new project, scaffolding a codebase, saying "set up a new project", "initialize project foundation", "create project skeleton", or "bootstrap my app". Handles project interviews, generates CLAUDE.md with architecture and conventions, and creates lean, security-conscious skill files tailored to the stack.
---

# Project Foundation

Establish a trustworthy, lean foundation for any software project built with Claude Code. This skill interviews the developer, then generates a CLAUDE.md and a set of project-specific skills that enforce clean code, security, simplicity, and consistent workflows.

## Philosophy

We build custom software and keep it lean. Every file, every dependency, every abstraction must earn its place. This foundation enforces:

- **Simplicity over cleverness**: Code should be readable by a junior dev
- **Security by default**: No secrets in code, validate all inputs, sanitize outputs
- **Lean dependencies**: Every package must justify its existence
- **Clean architecture**: Clear separation of concerns, predictable file structure
- **Fail fast, fix fast**: Strong error handling, meaningful error messages

---

## Workflow

### Step 1: Project Interview

Before generating anything, interview the developer to understand the project. Ask these questions conversationally (not as a wall of text). Adapt based on answers.

**Core questions:**
1. What does this app do? (1-2 sentence elevator pitch)
2. What's the tech stack? (framework, language, database, hosting)
3. Who are the users? (internal tool, B2B SaaS, consumer app, API-only)
4. What's the team size? (solo, 2-5, larger team)
5. Any integrations? (payment, auth, email, third-party APIs)
6. What's the deployment target? (Vercel, AWS, Docker, etc.)

**Follow-up based on answers:**
- If web app: SSR or SPA? What CSS approach?
- If API: REST or GraphQL? Auth strategy?
- If database: ORM preference? Migration strategy?
- If team > 1: Git workflow? PR requirements?

**Stop interviewing when you have enough to generate. Don't over-ask.**

### Step 2: Generate CLAUDE.md

Create a CLAUDE.md at the project root following this structure. Keep it concise — under 80 lines. Every line must be actionable.

```markdown
# [Project Name]

[One-line description of what this app does]

## Stack
- [Language/Framework]: [version]
- [Database]: [type]
- [Hosting]: [target]

## Commands
- `[dev command]`: Start development server
- `[test command]`: Run tests
- `[lint command]`: Lint and format
- `[build command]`: Production build
- `[db command]`: Run migrations (if applicable)

## Architecture
- `/src` or `/app`: [what lives here]
- `/components` or `/lib`: [what lives here]
- `/api` or `/routes`: [what lives here]
- `/tests`: [testing approach]

## Code Conventions
- [3-5 specific, actionable conventions for this stack]
- Example: "Use named exports, not default exports"
- Example: "All API routes return { data, error } shape"
- Example: "Use Zod for runtime validation on all inputs"

## Security Rules
- NEVER commit .env files or secrets
- Validate and sanitize all user inputs
- Use parameterized queries, never string concatenation for DB
- All API endpoints require authentication unless explicitly marked public
- See @docs/security.md for detailed security checklist (if applicable)

## Git Workflow
- Branch from `main` for features: `feat/description`
- Branch from `main` for fixes: `fix/description`
- Commit messages: `type: short description` (feat, fix, refactor, docs, test)
- [PR requirements if team > 1]

## Important Notes
- [2-3 project-specific gotchas or critical context]
```

**Rules for CLAUDE.md generation:**
- No filler. Every line must help Claude write better code for THIS project.
- Use progressive disclosure: reference docs files (`@docs/...`) for deep details.
- Keep under 80 lines. If it's longer, move details to child CLAUDE.md files.
- Include ONLY commands that actually exist or will exist in the project.

### Step 3: Generate Project Skills

Based on the interview, create a `.claude/skills/` directory with relevant skills from the catalog below. Only include skills that match the project's needs.

**Skill selection criteria:**
- Solo dev? Skip PR review skill.
- No database? Skip data-integrity skill.
- API-only? Skip frontend skill.
- Simple CRUD? Skip the complex architecture skill.

Generate each skill as a properly formatted SKILL.md with YAML frontmatter.

### Step 4: Generate Lean Docs Structure

Create minimal but useful documentation:

```
docs/
├── ARCHITECTURE.md    # High-level system design (generated)
├── security.md        # Security checklist for this stack (generated)
└── decisions/         # ADR folder (empty, with template)
    └── 000-template.md
```

### Step 5: Verify and Present

- Show the developer what was generated
- Ask if anything needs adjustment
- Offer to run `/init` equivalent to validate

---

## Skill Catalog

Generate these skills based on project needs. Each skill goes in `.claude/skills/[skill-name]/SKILL.md`.

### 1. clean-code (recommended for all projects)

```yaml
---
name: clean-code
description: Enforces clean, readable code practices. Use when writing new code, refactoring, or reviewing changes. Ensures functions are small, names are descriptive, and complexity is minimized.
---
```

**Key instructions to include:**
- Functions should do one thing and be under 30 lines
- Variable and function names must be self-documenting (no single letters except loop counters)
- No magic numbers — use named constants
- Maximum 3 levels of nesting; refactor if deeper
- Prefer early returns over nested conditionals
- Every function that can fail should handle errors explicitly
- No commented-out code in commits
- DRY applies to logic, not to code that happens to look similar

### 2. security-guard (recommended for all projects)

```yaml
---
name: security-guard
description: Enforces security best practices during development. Use when writing API endpoints, handling user input, managing authentication, database queries, or working with environment variables. Prevents common vulnerabilities.
---
```

**Key instructions to include:**
- Never hardcode secrets, API keys, or credentials
- Validate ALL user inputs at the boundary (Zod, joi, or equivalent)
- Use parameterized queries exclusively — reject any string concatenation for SQL
- Sanitize outputs to prevent XSS
- Set appropriate CORS policies (not wildcard in production)
- Authentication checks on every protected endpoint
- Rate limiting on auth endpoints and public APIs
- Audit logging for sensitive operations (login, payment, data export)
- Dependencies: run `npm audit` or equivalent before every PR
- Content Security Policy headers in web apps
- HTTPS everywhere in production

### 3. lean-deps (recommended for all projects)

```yaml
---
name: lean-deps
description: Keeps dependencies minimal and justified. Use when adding new packages, reviewing package.json, or choosing libraries. Prevents dependency bloat and supply chain risks.
---
```

**Key instructions to include:**
- Before adding any dependency, check if the standard library or existing deps already solve it
- Prefer well-maintained packages with small footprints over feature-rich heavy ones
- No packages for trivial operations (left-pad syndrome)
- Document WHY each non-obvious dependency exists in a comment or docs
- Pin major versions; use lockfiles
- Audit for known vulnerabilities regularly
- Prefer packages with TypeScript types included
- Check weekly downloads, last publish date, and open issues before adding

### 4. test-discipline (include when testing is part of the workflow)

```yaml
---
name: test-discipline
description: Enforces consistent testing practices. Use when writing tests, creating new features that need tests, or reviewing test coverage. Ensures tests are meaningful and maintainable.
---
```

**Key instructions to include:**
- Every new feature or bug fix gets a test
- Test behavior, not implementation
- Use the Arrange-Act-Assert pattern
- Test names describe the scenario: `should [expected] when [condition]`
- No test interdependence — each test runs in isolation
- Mock external services, not internal modules
- Integration tests for critical paths (auth, payments, core business logic)
- Keep test files next to source files or in a mirror structure (pick one, be consistent)

### 5. api-design (include for projects with APIs)

```yaml
---
name: api-design
description: Enforces consistent API design patterns. Use when creating API endpoints, designing response formats, or handling errors in API routes. Ensures predictable, well-documented APIs.
---
```

**Key instructions to include:**
- Consistent response shape: `{ data: T | null, error: string | null, meta?: object }`
- Use proper HTTP status codes (don't return 200 for errors)
- Validate request bodies and query params at the handler level
- Version APIs if they're public-facing
- Document endpoints with OpenAPI/Swagger or equivalent
- Pagination for list endpoints: `{ data, meta: { page, pageSize, total } }`
- Error responses include actionable messages, never expose stack traces in production
- Use middleware for cross-cutting concerns (auth, logging, rate limiting)

### 6. git-discipline (include for team projects or when clean history matters)

```yaml
---
name: git-discipline
description: Enforces clean git practices. Use when committing code, creating branches, or preparing changes for review. Ensures meaningful commit history and clean branching.
---
```

**Key instructions to include:**
- Atomic commits: one logical change per commit
- Commit message format: `type: description` (feat, fix, refactor, docs, test, chore)
- Never commit generated files, build artifacts, or .env files
- Branch naming: `type/short-description` (feat/user-auth, fix/cart-total)
- Rebase feature branches before merging (no merge commits from main)
- Squash WIP commits before PR

### 7. frontend-lean (include for web frontend projects)

```yaml
---
name: frontend-lean
description: Enforces lean frontend development practices. Use when building UI components, managing state, or structuring frontend code. Keeps the frontend simple, accessible, and performant.
---
```

**Key instructions to include:**
- Components should be small and focused (under 100 lines including JSX)
- Lift state only when necessary; prefer local state
- Use semantic HTML elements before adding ARIA attributes
- Lazy load routes and heavy components
- No inline styles in production code; use the project's CSS strategy consistently
- Images must have alt text; forms must have labels
- Mobile-first responsive design
- Performance budget: largest contentful paint under 2.5s

### 8. brand-system (include when building for a specific brand or client)

```yaml
---
name: brand-system
description: Maintain brand consistency across all design outputs for client projects. Use when the user mentions "brand guidelines", "brand colors", "our brand", "client branding", "style guide", needs to set up a new brand, or when any design work requires adherence to an established visual identity.
---
```

**Key instructions to include:**
- Store brand tokens in brand.json (colors, fonts, spacing, voice)
- Validate contrast ratios meet WCAG AA
- Generate CSS variables and Tailwind config from brand tokens
- Audit existing designs against the brand system
- No off-palette colors, no off-system fonts, consistent spacing

**Note:** This skill works alongside canvas-design, theme-factory, and frontend-design to enforce brand consistency across all visual outputs. See the design-skills-pack for the full set.

### 9. db-integrity (include for projects with databases)

```yaml
---
name: db-integrity
description: Enforces database integrity and migration practices. Use when writing migrations, designing schemas, or writing database queries. Ensures data safety and performance.
---
```

**Key instructions to include:**
- Every schema change requires a migration file
- Migrations must be reversible (include up and down)
- Add indexes for columns used in WHERE, JOIN, or ORDER BY
- Use foreign keys and constraints at the database level
- Never modify production data without a backup plan
- Seed scripts for development data, never use production data locally
- Query performance: use EXPLAIN on complex queries
- Connection pooling in production

---

## ADR Template

Generate this as `docs/decisions/000-template.md`:

```markdown
# [Number]. [Title]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded by [ADR-XXX]

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult because of this change?
```

---

## Examples

### Example 1: Next.js SaaS App

User says: "I'm building a B2B SaaS for invoice management. Next.js 15, Postgres with Drizzle, deployed on Vercel. Solo dev."

**Generated skills:** clean-code, security-guard, lean-deps, test-discipline, api-design, frontend-lean, db-integrity

**CLAUDE.md highlights:**
- Stack section with Next.js 15, PostgreSQL, Drizzle ORM, Vercel
- Commands for dev, test, lint, build, db:push, db:migrate
- Architecture mapping App Router conventions
- Drizzle-specific conventions for schema definitions

### Example 2: Python API Microservice

User says: "Building an internal REST API for our inventory system. FastAPI, SQLAlchemy, PostgreSQL, Docker on AWS ECS. Team of 3."

**Generated skills:** clean-code, security-guard, lean-deps, test-discipline, api-design, git-discipline, db-integrity

**CLAUDE.md highlights:**
- Stack section with FastAPI, SQLAlchemy, PostgreSQL, Docker/ECS
- Commands for uvicorn, pytest, ruff, docker compose
- Architecture mapping for service layers
- Git workflow with PR requirements for team of 3

### Example 3: React Native Mobile App

User says: "Consumer fitness tracking app. React Native with Expo, Supabase backend, solo dev for now."

**Generated skills:** clean-code, security-guard, lean-deps, frontend-lean

**CLAUDE.md highlights:**
- Stack section with Expo/React Native, Supabase
- Commands for expo start, eas build
- Mobile-specific conventions

---

## Post-Generation Checklist

After generating all files, verify:
- [ ] CLAUDE.md is under 80 lines and every line is actionable
- [ ] All skills have proper YAML frontmatter with name and description
- [ ] No secrets or environment-specific values in any generated file
- [ ] .gitignore includes .env*, node_modules, build artifacts
- [ ] docs/security.md exists with stack-specific security checklist
- [ ] Skills only cover what the project actually needs
- [ ] File structure follows the project's framework conventions
