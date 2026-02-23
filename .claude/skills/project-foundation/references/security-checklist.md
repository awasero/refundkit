# Security Checklist by Stack

## Universal (All Projects)

### Secrets Management
- Use environment variables for ALL secrets
- Never commit .env files (add to .gitignore immediately)
- Use different secrets for dev/staging/production
- Rotate secrets on a schedule

### Input Validation
- Validate at the boundary (API handlers, form submissions)
- Whitelist valid inputs rather than blacklisting bad ones
- Validate data types, lengths, ranges, and formats
- Reject unexpected fields (strict schema validation)

### Authentication & Authorization
- Hash passwords with bcrypt/argon2 (never MD5/SHA1)
- Use secure session management or JWTs with short expiry
- Implement proper RBAC (role-based access control)
- Rate limit login attempts (5 per minute per IP)
- Force HTTPS in production

### Dependencies
- Run security audits before every deployment
- Subscribe to security advisories for critical packages
- Remove unused dependencies
- Pin versions in lockfiles

---

## JavaScript/TypeScript (Node.js, Next.js, React)

### Server-Side
- Use `helmet` middleware for HTTP security headers
- Set `httpOnly`, `secure`, `sameSite` flags on cookies
- Enable CSRF protection for state-changing requests
- Validate with Zod or joi at every API boundary
- Use `parameterized queries` with your ORM (Prisma, Drizzle, etc.)
- Set Content-Security-Policy headers
- Sanitize HTML output with DOMPurify if rendering user content

### Client-Side
- Never store secrets in client-side code or localStorage
- Use `dangerouslySetInnerHTML` only with sanitized content
- Validate redirect URLs to prevent open redirects
- Implement proper CORS (never use `*` in production)

---

## Python (FastAPI, Django, Flask)

- Use `python-dotenv` for environment variables
- Enable SQL injection protection through ORM queries
- Use `secrets` module for token generation (not `random`)
- Set proper CORS middleware configuration
- Validate with Pydantic models (FastAPI) or Django forms
- Use `bandit` for static security analysis
- Set `DEBUG=False` in production
- Configure proper session security settings

---

## Database

- Use connection pooling
- Create database users with minimum required privileges
- Enable SSL for database connections in production
- Implement row-level security where applicable
- Back up regularly and test restore procedures
- Log and audit sensitive data access
- Never store plaintext passwords or sensitive PII without encryption
