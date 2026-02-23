# Design Skills Pack — How They Work Together

This pack contains 4 design skills that complement the `frontend-design` skill already built into Claude. Together, they form a complete design system for building consistent, high-quality visual outputs across all project types.

## The Skills

| Skill | What It Does | When It Triggers |
|-------|-------------|-----------------|
| **frontend-design** (built-in) | Production-grade UI code with bold aesthetics | Building web pages, components, dashboards |
| **canvas-design** | Visual art, posters, marketing assets as .png/.pdf | Creating static visual assets, posters, social graphics |
| **theme-factory** | 10 pre-set themes + custom theme generation | Styling any artifact with consistent colors/fonts |
| **artifacts-builder** | Interactive React/HTML artifacts with constraints awareness | Building self-contained interactive demos, prototypes |
| **brand-system** | Brand token management and enforcement | Client projects needing brand consistency |

## How They Compose

```
brand-system (defines the rules)
    ├── → theme-factory (applies rules as a concrete theme)
    ├── → frontend-design (constrains creative choices)
    ├── → canvas-design (guides visual asset creation)
    └── → artifacts-builder (provides design tokens)
```

**Typical flow for a client project:**

1. Use **brand-system** to capture client's brand (colors, fonts, voice)
2. Use **theme-factory** to create a theme from those brand tokens
3. Use **frontend-design** for production web UI
4. Use **canvas-design** for marketing materials and visual assets
5. Use **artifacts-builder** for interactive prototypes and demos

## Installation

### Claude.ai
1. Zip each skill folder individually
2. Upload via Settings → Capabilities → Skills
3. `frontend-design` is already available — no upload needed

### Claude Code
```bash
# From your project root
cp -r design-skills-pack/* .claude/skills/
```

Or install from the Anthropic marketplace:
```
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
```

## Recommended Combos by Project Type

| Project Type | Skills to Enable |
|-------------|-----------------|
| Client web app | brand-system + frontend-design + theme-factory |
| Marketing site | brand-system + frontend-design + canvas-design |
| Internal tool / dashboard | theme-factory + artifacts-builder |
| Pitch deck / presentation | canvas-design + theme-factory |
| Prototype / demo | artifacts-builder + theme-factory |
| Full client engagement | All 5 |
