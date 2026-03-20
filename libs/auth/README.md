# @orion/auth
> **Identity & Authentication Management Library**

## 📖 Overview
The `@orion/auth` library is the central hub for authentication and identity management within the Orion Enterprise ecosystem. It provides a unified way for applications to handle user sessions, Google OAuth integration, and state persistence.

## 🚀 Key Features
- **NgRx State Management**: Centralized store for user profile, authentication tokens, and session status.
- **Google OAuth Integration**: Handles client-side credential capture and triggers backend server-side verification.
- **Auto-Login**: Detects previous sessions on application startup and restores user context.
- **Token Management**: Securely handles JWT storage and injection into outgoing GraphQL requests.

## 🛠 Usage
### Authentication State
You can select the current user or auth status from the NgRx store:
```typescript
import { selectUser, selectAuthStatus } from '@orion/auth';

this.user$ = this.store.select(selectUser);
```

### Authentication Service
Inject the `AuthService` to trigger login/logout actions:
```typescript
import { AuthService } from '@orion/auth';

constructor(private auth: AuthService) {}

loginWithGoogle(credential: string) {
  this.auth.loginWithGoogle(credential).subscribe();
}
```

## 🧪 Testing
Run unit tests for this library:
```bash
npx nx test auth
```
