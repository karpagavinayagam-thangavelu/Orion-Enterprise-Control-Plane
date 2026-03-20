# @orion/rbac
> **Role-Based Access Control Library**

## 📖 Overview
The `@orion/rbac` library manages permissions and authorization logic for the Orion Enterprise platform. It provides guards and directives to dynamically show/hide features based on the user's role and permission set.

## 🚀 Key Features
- **Permission Mapping**: Maps backend roles (e.g., ADMIN, VIEW_ONLY) to granular frontend permissions.
- **Route Guards**: Protects micro-frontend routes from unauthorized access.
- **Structural Directives**: (Planned) `*orionHasPermission` to toggle DOM elements.
- **Service-to-Service Mapping**: Ensures that permissions captured during Google Login are propagated across all micro-frontends.

## 🛠 Usage
### Protecting Routes
Apply the `AuthGuard` or a specialized RBAC guard in your routing configuration:
```typescript
import { canViewBilling } from '@orion/rbac';

export const routes: Routes = [
  { path: 'billing', component: BillingComponent, canActivate: [canViewBilling] }
];
```

## 🧪 Testing
Run unit tests for this library:
```bash
npx nx test rbac
```
