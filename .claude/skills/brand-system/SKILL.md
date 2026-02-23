---
name: brand-system
description: Maintain brand consistency across all design outputs for client projects. Use when the user mentions "brand guidelines", "brand colors", "our brand", "client branding", "style guide", needs to set up a new brand, or when any design work requires adherence to an established visual identity. Manages brand tokens, enforces brand rules, and ensures every output stays on-brand.
---

# Brand System

Manage and enforce brand identity across all project outputs. This skill stores brand definitions and ensures every design, document, component, and visual asset stays consistent with the established brand guidelines.

## Core Concept

A brand system is a set of **design tokens** (colors, fonts, spacing, voice) that define how a brand looks and feels. This skill captures those tokens once, then enforces them everywhere.

## Workflow

### Setting Up a New Brand

When the user wants to establish a brand for a project:

1. **Gather brand assets** — Ask for any existing materials:
   - Brand guide / style guide PDF
   - Logo files
   - Color codes (hex, RGB, or Pantone)
   - Font names or files
   - Tone of voice guidelines
   - Existing website or app for reference

2. **Define the brand token file** — Create a `brand.json` in the project root or `docs/brand/`:

```json
{
  "name": "Client Name",
  "version": "1.0",
  "colors": {
    "primary": "#FF6900",
    "secondary": "#1A1A2E",
    "accent": "#00D4AA",
    "background": "#FFFFFF",
    "surface": "#F5F5F5",
    "text": {
      "primary": "#1A1A2E",
      "secondary": "#6B7280",
      "inverse": "#FFFFFF"
    },
    "semantic": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444",
      "info": "#3B82F6"
    }
  },
  "typography": {
    "heading": {
      "family": "Montserrat",
      "weights": ["600", "700"],
      "source": "google-fonts"
    },
    "body": {
      "family": "Open Sans",
      "weights": ["400", "500", "600"],
      "source": "google-fonts"
    },
    "mono": {
      "family": "JetBrains Mono",
      "weights": ["400"],
      "source": "google-fonts"
    },
    "scale": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }
  },
  "spacing": {
    "unit": 4,
    "scale": [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]
  },
  "borders": {
    "radius": {
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "full": "9999px"
    },
    "width": "1px",
    "color": "#E5E7EB"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.07)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)"
  },
  "voice": {
    "tone": "Professional yet approachable",
    "personality": ["Confident", "Helpful", "Clear"],
    "avoid": ["Jargon", "Passive voice", "Exclamation overuse"]
  },
  "logo": {
    "primary": "assets/logo-primary.svg",
    "inverse": "assets/logo-inverse.svg",
    "icon": "assets/logo-icon.svg",
    "clearSpace": "Minimum clear space equal to the height of the logomark"
  }
}
```

3. **Validate the brand** — Check that:
   - Primary/secondary colors have sufficient contrast with text
   - Font pairing is harmonious (display + body)
   - The scale system is consistent
   - Logo usage rules are clear

4. **Confirm with the user** before saving

### Enforcing the Brand

When ANY design work is happening (frontend, canvas, documents, presentations):

1. **Check for brand.json** — Look in `docs/brand/`, project root, or ask the user
2. **Load brand tokens** — Apply them as the foundation for all design decisions
3. **Validate output** — Before finalizing any design:
   - All colors match brand palette (no off-brand hex values)
   - Fonts are from the brand's type system
   - Spacing follows the brand's scale
   - Logo usage follows clearspace rules
   - Tone of voice matches brand personality

### Brand Audit

When asked to audit an existing design against the brand:

1. Compare every color used against the brand palette
2. Check all font usage against the typography system
3. Verify spacing consistency
4. Check logo usage rules
5. Report deviations with specific fixes

## Brand Rules (Always Enforce)

- **No off-palette colors**: Every color in the output must come from brand.json or be a computed variant (lighter/darker shade of a brand color)
- **No off-system fonts**: Only use fonts defined in the brand typography
- **Consistent spacing**: Use the spacing scale, not arbitrary values
- **Logo integrity**: Never stretch, recolor, or place the logo on busy backgrounds without proper contrast
- **Voice consistency**: Written content matches the brand's tone and avoids listed anti-patterns

## Generating CSS Variables

When building web projects, generate a CSS custom properties file from brand.json:

```css
:root {
  /* Colors */
  --color-primary: #FF6900;
  --color-secondary: #1A1A2E;
  --color-accent: #00D4AA;
  --color-bg: #FFFFFF;
  --color-surface: #F5F5F5;
  --color-text: #1A1A2E;
  --color-text-secondary: #6B7280;

  /* Typography */
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Open Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

## Generating Tailwind Config

For Tailwind CSS projects, generate a theme extension:

```js
// tailwind.config.js theme extension
{
  colors: {
    brand: {
      primary: '#FF6900',
      secondary: '#1A1A2E',
      accent: '#00D4AA',
    }
  },
  fontFamily: {
    heading: ['Montserrat', 'sans-serif'],
    body: ['Open Sans', 'sans-serif'],
  }
}
```

## Integration with Other Skills

- **frontend-design**: Reads brand.json to constrain creative choices within brand boundaries
- **theme-factory**: Brand-system feeds into theme-factory as a custom theme source
- **canvas-design**: Reads brand tokens for marketing materials and visual assets
- **project-foundation**: Brand-system is created during project setup when brand info is available

## Examples

**Example 1**: "Set up the brand for our fitness app"
→ Interview for colors, fonts, logo → Generate brand.json → Generate CSS variables

**Example 2**: "Does this landing page match our brand?"
→ Load brand.json → Audit every element → Report deviations with fixes

**Example 3**: "Apply our brand to this dashboard"
→ Load brand.json → Map brand tokens to all components → Validate contrast and consistency
