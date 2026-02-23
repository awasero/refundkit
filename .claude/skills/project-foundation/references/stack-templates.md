# Stack Templates

Quick reference for generating CLAUDE.md content tailored to specific stacks. Use these as starting points and customize based on the project interview.

---

## Next.js (App Router)

```
## Commands
- `npm run dev`: Start dev server (port 3000)
- `npm run build`: Production build
- `npm run lint`: ESLint check
- `npm run test`: Run Vitest/Jest tests

## Architecture
- `/app`: App Router pages, layouts, and route groups
- `/app/api`: API route handlers
- `/components`: Reusable UI components
- `/lib`: Utilities, helpers, and shared logic
- `/db` or `/drizzle`: Database schema and migrations

## Code Conventions
- Use Server Components by default; add "use client" only when needed
- Colocate loading.tsx and error.tsx with page.tsx
- Use named exports for components
- API routes return NextResponse.json({ data, error })
- Use Zod for input validation in API routes and server actions
```

---

## FastAPI (Python)

```
## Commands
- `uvicorn app.main:app --reload`: Start dev server
- `pytest`: Run tests
- `ruff check .`: Lint
- `alembic upgrade head`: Run migrations

## Architecture
- `/app`: Main application package
- `/app/api`: Route handlers organized by domain
- `/app/models`: SQLAlchemy/Pydantic models
- `/app/services`: Business logic layer
- `/app/core`: Config, security, dependencies
- `/tests`: Test files mirroring app structure

## Code Conventions
- Use Pydantic models for ALL request/response schemas
- Dependency injection for database sessions and auth
- Async handlers where I/O is involved
- Service layer pattern: routes call services, services call DB
- Type hints on all function signatures
```

---

## React Native (Expo)

```
## Commands
- `npx expo start`: Start Expo dev server
- `npm run test`: Run tests
- `eas build`: Build for distribution
- `npx expo lint`: Lint check

## Architecture
- `/app`: Expo Router file-based routing
- `/components`: Reusable UI components
- `/hooks`: Custom React hooks
- `/lib`: Utilities and API client
- `/constants`: Theme, colors, config
- `/assets`: Images, fonts

## Code Conventions
- Use Expo Router for navigation
- StyleSheet.create for all styles (no inline styles)
- Custom hooks for shared logic
- Handle loading, error, and empty states in every screen
- Test on both iOS and Android before merging
```

---

## Express.js / Node.js API

```
## Commands
- `npm run dev`: Start with nodemon
- `npm run test`: Run Jest/Vitest tests
- `npm run lint`: ESLint check
- `npm run build`: Compile TypeScript

## Architecture
- `/src/routes`: Express route handlers
- `/src/middleware`: Auth, validation, error handling
- `/src/services`: Business logic
- `/src/models`: Database models/schemas
- `/src/utils`: Shared utilities
- `/src/config`: Environment and app config

## Code Conventions
- Use Express Router for route organization
- Middleware chain: auth → validate → handler → error
- Async handlers wrapped with error-catching middleware
- Consistent error format: { error: string, code: string, status: number }
- Use TypeScript strict mode
```

---

## Django

```
## Commands
- `python manage.py runserver`: Start dev server
- `python manage.py test`: Run tests
- `python manage.py makemigrations`: Generate migrations
- `python manage.py migrate`: Apply migrations
- `ruff check .`: Lint

## Architecture
- `/project`: Django project settings
- `/apps`: Django apps organized by domain
- `/templates`: HTML templates
- `/static`: Static assets
- `/tests`: Test files

## Code Conventions
- Fat models, thin views pattern
- Use class-based views for CRUD, function views for custom logic
- Django REST Framework serializers for API validation
- Custom managers for complex queries
- Signals only when necessary; prefer explicit calls
```
