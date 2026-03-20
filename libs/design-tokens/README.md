# @orion/design-tokens
> **Core Design Tokens & CSS Variables**

## 📖 Overview
The `@orion/design-tokens` library is the source of truth for the visual style of Orion Enterprise. It contains the raw values for colors, spacing, shadows, and typography used by the `@orion/ui` library and all micro-frontends.

## 🌈 Visual Foundations
- **Colors**: Deep slate backgrounds, neon blue primary actions, and semantic status colors (success, error, warning).
- **Glassmorphism**: Standardized background-blur and border-opacity values.
- **Elevation**: Consistent shadow systems to define depth in a dark UI.

## 🛠 Usage
You can use these tokens directly in your CSS/SCSS files:
```scss
@import '@orion/design-tokens';

.my-element {
  background: var(--orion-bg-primary);
  border: 1px solid var(--orion-border-soft);
  color: var(--orion-text-main);
}
```

## 🧪 Testing
Check for token consistency:
```bash
npx nx test design-tokens
```
