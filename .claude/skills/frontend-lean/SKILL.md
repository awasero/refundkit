---
name: frontend-lean
description: Enforces lean frontend development practices. Use when building UI components, managing state, structuring frontend code, or working with React, Next.js, Vue, or any frontend framework. Keeps the frontend simple, accessible, and performant.
---

# Frontend Lean

Build frontends that are fast, accessible, and maintainable. Every component earns its place.

## Rules

1. **Small components**: Under 100 lines including JSX/template. If a component does more than one thing, split it.

2. **Local state first**: Use `useState` / local state by default. Lift state only when a sibling or parent genuinely needs it. Don't reach for global state management until you have a proven need.

3. **Semantic HTML first**: Use `<button>`, `<nav>`, `<main>`, `<article>`, `<section>` before adding ARIA attributes. A `<div>` with `role="button"` is almost always wrong.

4. **Accessibility is not optional**:
   - All images have `alt` text
   - All form inputs have associated `<label>` elements
   - Interactive elements are keyboard navigable
   - Color contrast meets WCAG AA (4.5:1 for body text)
   - Focus states are visible

5. **Lazy load**: Routes, heavy components, and below-the-fold content should be lazy loaded. Don't ship 500kb of JS for a page that shows a title and a button.

6. **Consistent CSS strategy**: Use the project's chosen approach (Tailwind, CSS Modules, styled-components) everywhere. No mixing strategies. No inline styles in production.

7. **Mobile-first responsive design**: Write mobile styles first, then add `md:` / `lg:` breakpoints. Not the other way around.

8. **Performance budget**:
   - Largest Contentful Paint: under 2.5 seconds
   - First Input Delay: under 100ms
   - Cumulative Layout Shift: under 0.1
   - JS bundle: under 200kb gzipped for initial load

9. **Handle all states**: Every data-fetching component handles loading, error, empty, and success states. No blank screens.

10. **No business logic in components**: Components handle display and user interaction. Business logic lives in hooks, services, or utility functions.
