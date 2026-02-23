---
name: git-discipline
description: Enforces clean git practices. Use when committing code, creating branches, writing commit messages, or preparing changes for review. Ensures meaningful history and clean collaboration workflow.
---

# Git Discipline

Git history is documentation. Every commit should tell a clear story of what changed and why.

## Rules

1. **Atomic commits**: One logical change per commit. "Add user auth" is one commit. "Add auth AND fix cart bug AND update styles" is three commits.

2. **Commit message format**:
   ```
   type: short description (under 72 chars)

   Optional body explaining WHY, not WHAT (the diff shows what).
   ```
   Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`

3. **Branch naming**: `type/short-description`
   - `feat/user-authentication`
   - `fix/cart-total-calculation`
   - `refactor/api-response-format`
   - `chore/update-dependencies`

4. **Never commit**:
   - `.env` files or secrets
   - `node_modules/`, `__pycache__/`, `venv/`
   - Build artifacts (`dist/`, `.next/`, `build/`)
   - OS files (`.DS_Store`, `Thumbs.db`)
   - Generated files (lockfiles are an exception — always commit those)

5. **Branch from main**: Always create feature branches from an up-to-date `main`.

6. **Rebase before merging**: Keep history clean. Rebase your feature branch onto main before creating a PR. No merge commits from syncing with main.

7. **Squash WIP commits**: Before PR, squash "wip", "fix typo", "oops" commits into meaningful ones.

8. **Pull requests** (when working with a team):
   - Descriptive title matching commit convention
   - Brief description of what and why
   - Link to issue/ticket if applicable
   - Keep PRs small — under 400 lines changed when possible

9. **Never force push to shared branches**: Force push only on your own feature branches.

10. **Tag releases**: Use semantic versioning tags (`v1.0.0`, `v1.1.0`) for production deployments.
