---
name: canvas-design
description: Create beautiful visual art, posters, marketing materials, and brand assets as .png and .pdf files using design philosophy. Use when the user asks to create a poster, flyer, social media graphic, visual asset, piece of art, infographic, or any static visual design. Generates original visual designs with meticulous craftsmanship.
---

# Canvas Design

Create original visual designs expressed through code-generated .png and .pdf outputs. This skill produces static visual assets — posters, social graphics, brand materials, infographics — by first establishing a design philosophy, then expressing it visually.

## Workflow

### Phase 1: Establish Design Philosophy

Before creating any visual, define an aesthetic direction. This is NOT a mood board — it's a design manifesto that guides every visual choice.

1. **Receive input**: The user provides context — could be a brand, a topic, an event, a product, or an abstract concept.
2. **Identify the conceptual thread**: Find the subtle, sophisticated connection between the request and the visual expression. The topic should be embedded in the art, not slapped on top of it.
3. **Name the movement** (1-2 words): Give the aesthetic a name. Examples: "Organic Turbulence", "Geometric Warmth", "Industrial Bloom"
4. **Write the philosophy** (4-6 paragraphs):
   - How it manifests through color relationships and palettes
   - How typography becomes part of the visual, not just text
   - How spatial composition creates tension or harmony
   - How texture and detail create depth
   - How the overall piece feels meticulously crafted

**Rules for the philosophy:**
- Emphasize VISUAL EXPRESSION over decoration
- Stress EXPERT CRAFTSMANSHIP repeatedly — the work should look like someone at the top of their field labored over every detail
- Leave creative room for interpretation
- Keep it generic enough to apply broadly, but specific enough to guide real choices
- Output as a .md file

### Phase 2: Visual Expression

Take the philosophy and EXPRESS IT VISUALLY using code. The output should be 90% visual design, 10% essential text.

**Technical approach:**
- Use Python with libraries like Pillow, reportlab, matplotlib, or cairo for .png and .pdf generation
- Download and use whatever fonts are needed — typography should be part of the art itself
- Push boundaries: if the art is abstract, bring the font onto the canvas as a visual element, not just typeset text

**Quality standards:**
- The final work must look like it took countless hours of meticulous effort
- Check that nothing overlaps unintentionally
- Formatting must be flawless — every detail perfect
- Composition, spacing, color choices, typography — everything should demonstrate expert-level craftsmanship
- Double-check alignment, balance, and visual hierarchy

**Critical principles:**
- PURE DESIGN: These are art objects, not documents with decoration
- ARTISTIC FREEDOM: Interpret the philosophy creatively — don't be literal
- THE ESSENTIAL PRINCIPLE: The concept should be a subtle, sophisticated reference embedded in the art — not always literal, always elegant
- Create ORIGINAL work. Never copy existing artists' styles to avoid copyright issues

### Phase 3: Output

- Generate .png for screen use and .pdf for print use
- Ensure proper resolution (at least 300 DPI for print, 72-150 DPI for web)
- Name files descriptively: `[project]-[concept]-[format].png`

## When NOT to Use This Skill

- For interactive web interfaces → use frontend-design skill instead
- For theming existing artifacts → use theme-factory skill instead
- For generative/algorithmic art with p5.js → that's a different approach
- For documents that happen to need styling → use theme-factory or brand-system

## Examples

**Example 1**: "Create a poster for our product launch"
→ Establish a design philosophy tied to the product's essence → Express it as a visually striking poster with sophisticated typography

**Example 2**: "Make social media graphics for a fitness brand"
→ Define an aesthetic movement that captures energy and discipline → Create a series of cohesive visuals that embed the brand's identity subtly

**Example 3**: "Design an infographic about our quarterly results"
→ Develop a visual language for data that feels designed, not templated → Present numbers as visual art with clear hierarchy and beautiful composition
