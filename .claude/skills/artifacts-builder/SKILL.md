---
name: artifacts-builder
description: Build complex, interactive HTML artifacts using React, Tailwind CSS, and shadcn/ui components. Use when the user asks to "build an artifact", "create an interactive demo", "make a prototype", "build a dashboard", "create a calculator", "make a widget", or needs a self-contained interactive web application rendered as an artifact. Handles state management, data visualization, and responsive layouts within artifact constraints.
---

# Artifacts Builder

Build sophisticated, self-contained interactive web applications as artifacts. These run in a sandboxed environment with specific library constraints — this skill ensures you work within those boundaries to produce polished, working results.

## Environment Constraints

Artifacts run in a restricted browser environment. Understand these limits:

**Available in React artifacts (.jsx):**
- React with hooks (useState, useEffect, useReducer, useMemo, useCallback, useRef)
- Tailwind CSS core utility classes (pre-defined, no compiler)
- lucide-react@0.263.1 for icons
- recharts for data visualization
- shadcn/ui components (Alert, AlertDialog, etc.)
- lodash, d3, Plotly, Chart.js
- Three.js r128 (no OrbitControls, no CapsuleGeometry)
- MathJS, Papaparse, SheetJS, mammoth, Tone.js, tensorflow

**Available in HTML artifacts (.html):**
- Vanilla JS, CSS, HTML in a single file
- External scripts from cdnjs.cloudflare.com
- CSS animations and transitions

**NOT available:**
- localStorage, sessionStorage (will break the artifact)
- External API calls to arbitrary endpoints (CORS)
- npm install or dynamic imports beyond listed libraries
- Node.js or server-side code

## Workflow

### 1. Understand the Request

Before building, clarify:
- What does the user want to interact with?
- What data does it display or manipulate?
- Does it need state management? (forms, filters, toggles)
- Does it need charts or data visualization?
- Mobile responsive or desktop-focused?

### 2. Choose the Right Format

**Use React (.jsx) when:**
- Complex state management needed
- Multiple interactive components
- Data visualization with recharts
- shadcn/ui components add value
- Form handling with validation

**Use HTML (.html) when:**
- Simpler interactions (single animation, basic calculator)
- Heavy CSS animations or custom visual effects
- Canvas-based rendering
- When React overhead isn't justified

### 3. Build with Structure

**React artifact template:**
```jsx
import { useState } from "react";

// All in one file — no separate CSS or JS
export default function App() {
  const [state, setState] = useState(initialValue);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Your UI here using Tailwind utility classes */}
    </div>
  );
}
```

**Key rules:**
- Default export required, no required props
- Use useState/useReducer for ALL state (never localStorage)
- Import hooks explicitly: `import { useState } from "react"`
- Tailwind classes only — no custom CSS unless truly necessary
- Single file — CSS, JS, components all together

### 4. Design Principles for Artifacts

- **Immediate value**: The artifact should work and look good the moment it renders
- **Clear hierarchy**: Use Tailwind's spacing and typography scale consistently
- **Feedback**: Every interaction should provide visual feedback
- **Responsive**: Use Tailwind responsive prefixes (sm:, md:, lg:)
- **Accessible**: Proper contrast, focus states, semantic HTML
- **Error states**: Handle empty states, loading states, and errors gracefully

### 5. Data Visualization

When using recharts:
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Wrap in ResponsiveContainer for proper sizing
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

### 6. Common Patterns

**Tabs/Navigation:**
```jsx
const [activeTab, setActiveTab] = useState("overview");
// Render content based on activeTab
```

**Filterable Lists:**
```jsx
const [filter, setFilter] = useState("");
const filtered = items.filter(item =>
  item.name.toLowerCase().includes(filter.toLowerCase())
);
```

**Form with Validation:**
```jsx
const [errors, setErrors] = useState({});
const validate = (data) => {
  const newErrors = {};
  if (!data.name) newErrors.name = "Required";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## Quality Checklist

Before presenting the artifact:
- [ ] Renders without errors on first load
- [ ] All interactive elements respond to clicks/input
- [ ] No localStorage or sessionStorage usage
- [ ] Responsive on mobile and desktop widths
- [ ] Color contrast meets accessibility standards
- [ ] Empty states handled (no blank screens)
- [ ] All imports are from available libraries only
- [ ] Single file with default export (React) or self-contained (HTML)

## Integration with Other Skills

- **theme-factory**: Apply a theme's design tokens to the artifact's Tailwind config
- **brand-system**: Use brand.json colors and fonts as the artifact's palette
- **frontend-design**: For standalone web pages outside the artifact sandbox, use frontend-design instead
