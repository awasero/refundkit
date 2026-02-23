---
name: api-design
description: Enforces consistent API design patterns. Use when creating API endpoints, designing response formats, handling API errors, or building REST/GraphQL services. Ensures predictable, well-documented, and developer-friendly APIs.
---

# API Design

APIs are contracts. Once shipped, they're hard to change. Get the design right upfront.

## Rules

### Response Shape
Every endpoint returns the same structure:
```json
{
  "data": null,
  "error": null,
  "meta": {}
}
```
- `data`: The payload (object, array, or null on error)
- `error`: Error message string (null on success)
- `meta`: Pagination, timestamps, request IDs — optional

### HTTP Status Codes
- `200` — Success (GET, PUT, PATCH)
- `201` — Created (POST that creates a resource)
- `204` — No Content (DELETE success)
- `400` — Bad Request (validation failed, malformed input)
- `401` — Unauthorized (no valid auth)
- `403` — Forbidden (authenticated but not permitted)
- `404` — Not Found
- `409` — Conflict (duplicate resource, version conflict)
- `422` — Unprocessable Entity (valid syntax but semantic error)
- `429` — Too Many Requests (rate limited)
- `500` — Internal Server Error (never expose stack traces)

### Validation
- Validate request bodies and query params at the handler level
- Return specific error messages: `"email is required"` not `"validation error"`
- Use schema validation (Zod, joi, Pydantic) — not manual checks

### Pagination
List endpoints always paginate:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 157,
    "totalPages": 8
  }
}
```
Use cursor-based pagination for large or real-time datasets.

### Naming
- Resource-based URLs: `/users`, `/users/:id`, `/users/:id/orders`
- Plural nouns for collections, singular actions as verbs only when necessary
- Kebab-case for multi-word URLs: `/order-items` not `/orderItems`
- Use query params for filtering: `/users?role=admin&status=active`

### Versioning
- Version public-facing APIs: `/api/v1/users`
- Internal APIs between your own services can skip versioning initially

### Error Responses
```json
{
  "data": null,
  "error": "Email address is already registered",
  "meta": {
    "code": "USER_EMAIL_EXISTS",
    "field": "email"
  }
}
```
Never expose stack traces, internal paths, or database errors in production.

### Middleware Pattern
Use middleware for cross-cutting concerns:
```
Request → Auth → Rate Limit → Validate → Handler → Serialize → Response
```
Each middleware has a single responsibility.
