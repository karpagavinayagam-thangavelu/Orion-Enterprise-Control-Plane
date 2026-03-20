# @orion/ui
> **Orion Shared Design System**

## 📖 Overview 
The `@orion/ui` library contains the core UI components and layout elements used across the Orion Enterprise shell and micro-frontends. It ensures a consistent "Glass Pane" aesthetic and high-performance user experience.

## 🎨 Design Language
- **Theme**: Dark mode by default with neon blue and slate accents.
- **Aesthetic**: Glassmorphism, subtle gradients, and micro-animations.
- **Typography**: Optimized for enterprise data readability.

## 📦 Components
This library exports several high-level components:
- **FeatureHeaderComponent**: Standardized header for all modules.
- **StatCardComponent**: High-impact visualization for metrics and KPIs.
- **DataContainerComponent**: Stylized wrapper for tables and list data.
- **Layout Utilities**: Shared CSS grids and flex containers.

## 🛠 Usage
Import components into your Standalone Angular components:
```typescript
import { FeatureHeaderComponent, StatCardComponent } from '@orion/ui';

@Component({
  imports: [FeatureHeaderComponent, StatCardComponent],
  template: `
    <orion-feature-header title="My Page"></orion-feature-header>
    <orion-stat-card label="Users" value="1,240"></orion-stat-card>
  `
})
```

## 🧪 Testing
Run unit tests for the UI library:
```bash
npx nx test ui
```
