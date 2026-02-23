# Stack Decision Tree

Use this to recommend a tech stack based on what was learned during discovery.

## Decision Flow

### 1. What kind of product is it?

**Web app with public-facing pages (SEO matters)**
→ Next.js (App Router) + Vercel
- Need a database? → PostgreSQL + Drizzle ORM
- Need auth? → NextAuth.js or Clerk
- Need payments? → Stripe
- Need email? → Resend
- CSS: Tailwind CSS

**API-first / backend service**
→ FastAPI (Python) or Express (Node.js)
- Python team? → FastAPI + SQLAlchemy + Alembic
- JS/TS team? → Express + Drizzle + PostgreSQL
- Need background jobs? → BullMQ (Node) or Celery (Python)
- Hosting: AWS ECS, Fly.io, or Railway

**Mobile app**
→ React Native + Expo
- Need a backend? → Supabase (quick) or FastAPI (custom)
- Need push notifications? → Expo Notifications
- Need offline? → WatermelonDB or SQLite
- CSS: StyleSheet.create (no Tailwind in RN)

**Full-stack with real-time features**
→ Next.js + Supabase
- Real-time: Supabase Realtime (WebSocket channels)
- Auth: Supabase Auth (built-in)
- Database: Supabase PostgreSQL
- Hosting: Vercel (frontend) + Supabase (backend)

**Simple CRUD / internal tool**
→ Next.js + SQLite (if tiny) or PostgreSQL + Drizzle
- For truly simple: consider v0.dev or Bolt for rapid prototyping
- Hosting: Vercel

**Static site / marketing / content**
→ Next.js static export or Astro
- Need CMS? → Sanity, Contentful, or MDX
- Hosting: Vercel or Netlify

### 2. Database selection

| Scenario | Database | ORM/Client |
|----------|----------|------------|
| Most web apps | PostgreSQL | Drizzle ORM |
| Rapid prototyping | Supabase (hosted PG) | Supabase client |
| Simple/embedded | SQLite | Better-sqlite3 or Drizzle |
| Document-heavy | MongoDB | Mongoose (only if truly needed) |
| No persistent data | None | — |

### 3. Auth selection

| Scenario | Auth Solution |
|----------|--------------|
| MVP, move fast | Clerk (hosted, 5 min setup) |
| Full control needed | NextAuth.js / Auth.js |
| Supabase stack | Supabase Auth |
| API-only | JWT with refresh tokens |
| Internal tool | Basic session or SSO |
| No auth needed | Skip it. Add later. |

### 4. Hosting selection

| Scenario | Host |
|----------|------|
| Next.js | Vercel (default) |
| Docker / custom | Fly.io or Railway |
| Enterprise / AWS | AWS ECS or App Runner |
| Static site | Vercel, Netlify, or Cloudflare Pages |
| Python API | Fly.io, Railway, or AWS ECS |

### 5. Default lean stack (when in doubt)

```
Next.js 15 (App Router)
TypeScript (strict mode)
Tailwind CSS
PostgreSQL + Drizzle ORM
NextAuth.js or Clerk
Vercel
```

This stack covers 80% of web app use cases, has excellent Claude Code support, and keeps dependencies minimal.
