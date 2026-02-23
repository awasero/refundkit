---
name: lean-deps
description: Keeps dependencies minimal and justified. Use when adding new packages, reviewing package.json or requirements.txt, choosing libraries, or setting up a project. Prevents dependency bloat and supply chain risks.
---

# Lean Dependencies

Every dependency is a liability — maintenance burden, security surface, and build time. Each one must earn its place.

## Rules

1. **Standard library first**: Before adding any package, check if the language's standard library or existing project dependencies already solve the problem.

2. **No trivial packages**: If the functionality is under 20 lines of code, write it yourself. No `is-odd`, `left-pad`, or `is-number` equivalents.

3. **Justify every addition**: Before installing, answer: What does this do that I can't do in <30 minutes of coding? If you can't answer clearly, don't add it.

4. **Check package health before adding**:
   - Weekly downloads: >10k preferred
   - Last published: within the last 6 months
   - Open issues: reasonable ratio to usage
   - TypeScript types: included or `@types/` available
   - Bundle size: check with bundlephobia.com for frontend packages

5. **Pin major versions**: Use lockfiles (`package-lock.json`, `poetry.lock`). Pin major versions in package.json with `^` (default) but review major bumps manually.

6. **Audit regularly**: Run `npm audit` / `pip audit` before each deployment. Fix critical and high vulnerabilities immediately.

7. **Prefer focused packages over kitchen-sink libraries**: `date-fns` over `moment`. `ky` over `axios` if you only need fetch. Smaller surface = fewer vulnerabilities.

8. **Document non-obvious dependencies**: If a package exists for a subtle reason (polyfill, specific edge case), add a comment in package.json or a note in docs.

9. **Remove aggressively**: If a feature is removed, remove its dependencies too. Run `depcheck` or equivalent periodically.

10. **Dev vs production**: Keep dev dependencies out of production bundles. Use `--save-dev` / `[tool.poetry.group.dev]` correctly.
