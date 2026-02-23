---
name: theme-factory
description: Style artifacts with professional themes. Apply consistent colors, fonts, and visual styling to slides, docs, reports, HTML pages, dashboards, or any artifact. Includes 10 pre-set themes or can generate custom themes on-the-fly. Use when the user says "apply a theme", "style this", "make it look professional", "change the colors", or needs consistent visual branding across artifacts.
---

# Theme Factory

Apply consistent, professional styling to any artifact — slides, documents, reports, HTML pages, dashboards, landing pages. Choose from 10 curated themes or generate a custom one.

## How It Works

Each theme includes:
- **Color palette**: Primary, secondary, accent, background, surface, text colors with proper contrast ratios
- **Font pairing**: Display/heading font + body font, carefully paired for harmony
- **Spacing system**: Consistent margins, padding, and gap values
- **Component styles**: Buttons, cards, headers, footers styled to match

## Workflow

1. **Understand the artifact**: What is being styled? (slides, HTML page, document, dashboard)
2. **Present available themes**: Show the 10 options with a brief visual description
3. **Ask for their choice**: Get explicit confirmation, or generate a custom theme based on their description
4. **Apply the theme**: Transform the artifact using the chosen theme's design tokens
5. **Review**: Ensure consistency across all elements

## Pre-Set Themes

### 1. Midnight Professional
- **Vibe**: Dark, sophisticated, corporate
- **Colors**: Deep navy (#0f172a) background, white text, electric blue (#3b82f6) accents
- **Fonts**: Heading: DM Sans Bold / Body: DM Sans Regular
- **Best for**: Enterprise dashboards, investor decks, executive reports

### 2. Warm Earth
- **Vibe**: Natural, approachable, grounded
- **Colors**: Warm cream (#faf7f2) background, dark brown (#3d2c1e) text, terracotta (#c2703e) accents
- **Fonts**: Heading: Playfair Display / Body: Source Sans 3
- **Best for**: Wellness brands, organic products, lifestyle content

### 3. Electric Minimal
- **Vibe**: Clean, modern, high-energy
- **Colors**: Pure white (#ffffff) background, near-black (#111111) text, hot pink (#ec4899) accent
- **Fonts**: Heading: Space Grotesk Bold / Body: Inter Regular
- **Best for**: Tech startups, product launches, SaaS interfaces

### 4. Forest Deep
- **Vibe**: Calm, trustworthy, premium
- **Colors**: Dark green (#1a2e1a) background, light sage (#d4ddc5) text, gold (#c9a84c) accents
- **Fonts**: Heading: Cormorant Garamond Bold / Body: Nunito Sans
- **Best for**: Finance, legal, premium services

### 5. Sunset Gradient
- **Vibe**: Creative, warm, bold
- **Colors**: Gradient from coral (#ff6b6b) to amber (#feca57), dark text (#2d3436)
- **Fonts**: Heading: Poppins Bold / Body: Mulish Regular
- **Best for**: Creative agencies, events, marketing materials

### 6. Arctic Clean
- **Vibe**: Ultra-minimal, clinical, precise
- **Colors**: Cool white (#f8fafc) background, slate (#334155) text, ice blue (#38bdf8) accents
- **Fonts**: Heading: IBM Plex Sans Medium / Body: IBM Plex Sans Regular
- **Best for**: Healthcare, data science, technical documentation

### 7. Noir Editorial
- **Vibe**: Bold, editorial, magazine-style
- **Colors**: True black (#000000) background, pure white (#ffffff) text, red (#ef4444) accents
- **Fonts**: Heading: Libre Baskerville Bold / Body: Libre Franklin
- **Best for**: Media, publishing, editorial content, portfolio sites

### 8. Lavender Soft
- **Vibe**: Gentle, modern, friendly
- **Colors**: Soft lavender (#f5f3ff) background, deep purple (#3b0764) text, violet (#8b5cf6) accents
- **Fonts**: Heading: Plus Jakarta Sans Bold / Body: Plus Jakarta Sans Regular
- **Best for**: Education, wellness apps, community platforms

### 9. Industrial Raw
- **Vibe**: Brutalist, utilitarian, bold
- **Colors**: Concrete gray (#e5e5e5) background, black (#000000) text, safety orange (#f97316) accents
- **Fonts**: Heading: JetBrains Mono Bold / Body: Work Sans Regular
- **Best for**: Developer tools, manufacturing, bold branding

### 10. Ocean Depth
- **Vibe**: Deep, immersive, premium
- **Colors**: Deep blue (#0c1e3a) to teal (#134e5e) gradient, white text, aqua (#22d3ee) accents
- **Fonts**: Heading: Outfit Bold / Body: Outfit Regular
- **Best for**: Travel, hospitality, luxury experiences

## Custom Theme Generation

If none of the pre-sets fit, generate a custom theme based on the user's description.

**Gather from the user:**
- What feeling or vibe they want
- Any brand colors that must be included
- The type of content being styled
- Any inspiration references

**Generate a theme with:**
- 6 color tokens (primary, secondary, accent, background, surface, text) with proper contrast
- Font pairing from Google Fonts
- Spacing scale (4, 8, 12, 16, 24, 32, 48, 64)
- Border radius preference (sharp, slightly rounded, rounded, pill)

## Theme Application Rules

- **Consistency**: Every element must use theme tokens. No one-off colors or font overrides.
- **Contrast**: Text must meet WCAG AA contrast ratios (4.5:1 for body, 3:1 for large text)
- **Hierarchy**: Heading font for titles and headers ONLY. Body font for everything else.
- **Spacing**: Use the spacing scale consistently. No arbitrary pixel values.
- **Accents**: Use accent color sparingly — for CTAs, highlights, and key elements. Not for large surfaces.

## Integration with Other Skills

- **frontend-design**: Theme-factory provides the design tokens; frontend-design handles the creative layout and interaction
- **canvas-design**: Theme-factory provides color/font consistency; canvas-design handles visual art creation
- **brand-system**: Brand-system defines the client's brand rules; theme-factory applies them as a concrete theme
