---
name: clean-code
description: Enforces clean, readable code practices. Use when writing new code, refactoring, or reviewing changes. Ensures functions are small, names are descriptive, and complexity is minimized. Triggers on "write", "build", "create", "refactor", "review code", or any code generation task.
---

# Clean Code

Write code that a junior developer can read and understand on the first pass.

## Rules

1. **Small functions**: Each function does ONE thing. Under 30 lines. If you need a comment to explain what a block does, extract it into a named function.

2. **Self-documenting names**: Variables and functions describe their purpose. No single-letter names except `i`, `j` in loops. No abbreviations unless universally understood (e.g., `url`, `id`).

3. **No magic numbers**: Every literal value gets a named constant. `const MAX_RETRIES = 3` not just `3`.

4. **Max 3 levels of nesting**: If deeper, refactor with early returns, guard clauses, or extraction.
   ```
   // Bad
   if (user) {
     if (user.isActive) {
       if (user.hasPermission) {
         doThing();
       }
     }
   }

   // Good
   if (!user || !user.isActive || !user.hasPermission) return;
   doThing();
   ```

5. **Prefer early returns**: Reduce nesting by handling edge cases first and returning early.

6. **Explicit error handling**: Every function that can fail handles errors. No silent catches. No `catch (e) {}`.

7. **No commented-out code**: Dead code goes in git history, not in the codebase. Delete it.

8. **DRY applies to logic, not appearance**: Two blocks that look similar but serve different purposes should NOT be merged. Only deduplicate when the logic is genuinely shared.

9. **Consistent patterns**: If the codebase uses pattern A for solving problem X, use pattern A. Don't introduce pattern B without a decision to migrate.

10. **Meaningful commits**: Code changes should be reviewable. One logical change per commit.
