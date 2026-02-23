---
name: security-guard
description: Enforces security best practices during development. Use when writing API endpoints, handling user input, managing authentication, database queries, environment variables, or deploying to production. Prevents common vulnerabilities like injection, XSS, CSRF, and secret leaks.
---

# Security Guard

Security is not a feature — it's a constraint on every line of code.

## Rules

### Secrets
- NEVER hardcode secrets, API keys, tokens, or credentials in source code
- Use environment variables loaded from `.env` (which is in `.gitignore`)
- Different secrets for dev / staging / production
- If a secret is accidentally committed, rotate it immediately — git history is forever

### Input Validation
- Validate ALL user inputs at the boundary (API handlers, form submissions)
- Use schema validation (Zod, joi, Pydantic) — not manual if/else chains
- Whitelist valid inputs rather than blacklisting bad ones
- Validate data types, lengths, ranges, and formats
- Reject unexpected fields (strict mode)

### Database
- Use parameterized queries EXCLUSIVELY — reject any string concatenation for SQL
- Use your ORM's built-in query builder, never raw string queries unless parameterized
- Create database users with minimum required privileges
- Enable SSL for database connections in production

### Authentication & Authorization
- Hash passwords with bcrypt or argon2 (NEVER MD5 or SHA1)
- JWTs: short expiry, httpOnly cookies, rotate refresh tokens
- Rate limit login attempts: 5 per minute per IP
- Check authorization on EVERY protected endpoint — not just at the route level
- Implement CSRF protection for state-changing requests

### Output & Transport
- Sanitize all outputs to prevent XSS (especially user-generated content)
- Set Content-Security-Policy headers
- Use `helmet` middleware (Node.js) or equivalent security headers
- HTTPS everywhere in production — no exceptions
- Set `httpOnly`, `secure`, `sameSite` flags on all cookies
- CORS: never use wildcard `*` in production

### Dependencies
- Run `npm audit` / `pip audit` / equivalent before every deployment
- Remove unused dependencies
- Pin versions in lockfiles
- Check weekly downloads and last publish date before adding new packages

### Logging & Monitoring
- Log authentication events (login, logout, failed attempts)
- Log sensitive operations (payments, data exports, permission changes)
- NEVER log secrets, passwords, tokens, or full credit card numbers
- Monitor for anomalous patterns (brute force, unusual data access)
