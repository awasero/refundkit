---
name: db-integrity
description: Enforces database integrity and migration practices. Use when writing migrations, designing schemas, writing database queries, working with ORMs, or managing data. Ensures data safety, consistency, and query performance.
---

# Database Integrity

Data is the hardest thing to fix. Get the schema right, protect the data, and never ship without a migration.

## Rules

1. **Every schema change requires a migration file**: No manual SQL in production. No "just add the column". Always a versioned, tracked migration.

2. **Migrations must be reversible**: Include `up` and `down` (or equivalent). If you can't reverse it, document why and have a manual rollback plan.

3. **Indexes on query columns**: Add indexes for columns used in `WHERE`, `JOIN`, `ORDER BY`, and foreign keys. No table scans on production data.

4. **Use database-level constraints**:
   - Foreign keys for relationships
   - `NOT NULL` where nulls don't make sense
   - `UNIQUE` constraints for naturally unique fields (email, slug)
   - `CHECK` constraints for value ranges
   - Don't rely only on application-level validation

5. **Parameterized queries only**: Use your ORM's query builder. If you must write raw SQL, use parameterized placeholders. NEVER concatenate user input into queries.

6. **Never modify production data without a backup plan**: Before any data migration, ensure you can rollback. Test on a staging copy first.

7. **Seed scripts for development**: Create seed data for local development. NEVER copy production data to local environments (PII risks).

8. **Query performance**: Use `EXPLAIN` / `EXPLAIN ANALYZE` on complex queries. Watch for sequential scans on large tables, N+1 queries, and missing indexes.

9. **Connection pooling in production**: Don't open a new connection per request. Use connection pooling (PgBouncer, built-in pool, etc.).

10. **Soft deletes when appropriate**: For user-facing data that might need recovery, use a `deleted_at` timestamp instead of hard `DELETE`. Hard delete only for truly ephemeral data.
