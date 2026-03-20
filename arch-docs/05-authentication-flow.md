# Authentication & Authorization Flow

## Overview

The Orion Enterprise platform uses Google OAuth 2.0 for authentication with JWT tokens, combined with Role-Based Access Control (RBAC) for authorization.

## Complete Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Shell as Shell App
    participant Google as Google OAuth
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Store as NgRx Store
    participant RBAC as RBAC Service
    participant Loader as Feature Loader

    User->>Browser: Access Application
    Browser->>Shell: Load Shell App
    Shell->>Shell: Check localStorage<br/>for saved user

    alt No Saved User
        Shell->>User: Show Login Page
        User->>Shell: Click "Sign in with Google"
        Shell->>Google: Initialize Google Sign-In
        Google->>User: Show Google Auth Popup
        User->>Google: Enter Credentials
        Google->>Google: Authenticate User
        Google-->>Shell: Return ID Token (JWT)

        Shell->>Gateway: GraphQL Mutation<br/>googleLogin(credential)
        Gateway->>Auth: Forward Mutation
        Auth->>Auth: Decode Google JWT
        Auth->>Auth: Extract user info<br/>(email, name, googleId)
        Auth->>Auth: Assign roles & permissions<br/>(business logic)
        Auth->>Auth: Generate Orion JWT
        Auth-->>Gateway: Return {accessToken, user}
        Gateway-->>Shell: Return AuthResponse

        Shell->>Store: Dispatch loginSuccess(user)
        Store->>Store: Update auth state
        Store->>Store: Persist to localStorage

        Shell->>RBAC: setContext(roles, permissions)
        Shell->>Loader: loadAuthorizedFeatures()
        Loader->>Shell: Features loaded

        Shell->>Browser: Navigate to Dashboard
        Browser->>User: Show Application UI
    else Saved User Found
        Shell->>Store: Restore user from localStorage
        Store->>RBAC: setContext(roles, permissions)
        Shell->>Loader: loadAuthorizedFeatures()
        Shell->>Browser: Navigate to Dashboard
        Browser->>User: Show Application UI
    end
```

## Google OAuth 2.0 Integration

```mermaid
graph TB
    subgraph "Browser"
        A[User Clicks Login]
        B[Google Sign-In Button<br/>gsi.client]
    end

    subgraph "Google OAuth Server"
        C[accounts.google.com]
        D[OAuth Consent Screen]
        E[ID Token Generation]
    end

    subgraph "Shell Application"
        F[Auth Component]
        G[Callback Handler]
        H[Auth Service]
    end

    A --> B
    B --> C
    C --> D
    D -->|User Approves| E
    E -->|ID Token JWT| G
    G --> H
    H -->|Send to Backend| I[GraphQL Mutation]

    style E fill:#e8f5e9
    style H fill:#fff3e0
```

**Google Sign-In Configuration:**

```typescript
// Shell App - Initialize Google Sign-In
google.accounts.id.initialize({
  client_id: environment.googleClientId,
  callback: (response) => {
    // response.credential contains the JWT
    this.handleGoogleResponse(response);
  },
  auto_select: false,
  cancel_on_tap_outside: true,
});

// Render the button
google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
  theme: 'outline',
  size: 'large',
  text: 'continue_with',
  shape: 'rectangular',
});
```

## JWT Token Structure

```mermaid
graph LR
    subgraph "Google JWT (Input)"
        G1[Header<br/>alg: RS256]
        G2[Payload<br/>email, name, sub, iat, exp]
        G3[Signature<br/>Google's private key]
    end

    subgraph "Orion JWT (Output)"
        O1[Header<br/>alg: HS256]
        O2[Payload<br/>id, email, name, roles, permissions]
        O3[Signature<br/>AUTH_SECRET]
    end

    G1 --> O1
    G2 --> O2
    G3 --> O3

    style G2 fill:#e3f2fd
    style O2 fill:#e8f5e9
```

**Orion JWT Payload:**

```json
{
  "id": "uuid-v4",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["admin", "billing_manager"],
  "permissions": ["view_billing", "edit_billing", "view_analytics"],
  "iat": 1709500000,
  "exp": 1709586400
}
```

## Auth Service Implementation

```mermaid
classDiagram
    class AuthService {
        -jwtService: JwtService
        +googleLogin(credential: string): Promise~AuthResponse~
        -decodeGoogleToken(token: string): GoogleUser
        -assignRolesAndPermissions(email: string): RolePermissions
        -generateJWT(user: User): string
    }

    class GoogleUser {
        +email: string
        +name: string
        +sub: string
        +picture?: string
    }

    class User {
        +id: string
        +email: string
        +name: string
        +googleId: string
        +roles: string[]
        +permissions: string[]
    }

    class AuthResponse {
        +accessToken: string
        +user: User
    }

    class RolePermissions {
        +roles: string[]
        +permissions: string[]
    }

    AuthService --> GoogleUser
    AuthService --> User
    AuthService --> AuthResponse
    AuthService --> RolePermissions
```

**Auth Service Code:**

```typescript
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async googleLogin(credential: string): Promise<AuthResponse> {
    // 1. Decode Google JWT
    const decoded = this.decodeGoogleToken(credential);

    // 2. Create user object
    const user: User = {
      id: uuidv4(),
      email: decoded.email,
      name: decoded.name,
      googleId: decoded.sub,
      ...this.assignRolesAndPermissions(decoded.email),
    };

    // 3. Generate Orion JWT
    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
    });

    return {
      accessToken,
      user,
    };
  }

  private assignRolesAndPermissions(email: string): RolePermissions {
    // Business logic for role assignment
    if (email.endsWith('@admin.com')) {
      return {
        roles: ['admin'],
        permissions: ['view_all', 'edit_all', 'delete_all'],
      };
    }

    return {
      roles: ['user'],
      permissions: ['view_billing', 'view_analytics'],
    };
  }
}
```

## Frontend Auth State Management

```mermaid
graph TB
    subgraph "NgRx Store"
        STATE[AuthState<br/>user, loading, error]
        ACTIONS[Actions<br/>login, loginSuccess, loginFailure, logout]
        REDUCER[Reducer<br/>authReducer]
        EFFECTS[Effects<br/>persistUser$]
    end

    subgraph "Components"
        AUTH_COMP[AuthComponent]
        APP_COMP[AppComponent]
    end

    subgraph "Persistence"
        LOCAL[LocalStorage<br/>orion_user]
    end

    AUTH_COMP -->|dispatch login| ACTIONS
    ACTIONS --> REDUCER
    ACTIONS --> EFFECTS
    REDUCER --> STATE
    STATE -->|select user$| APP_COMP
    STATE -->|select user$| AUTH_COMP

    EFFECTS -->|Success| LOCAL
    LOCAL -.->|Restore on init| STATE

    style STATE fill:#e8f5e9
    style LOCAL fill:#fff3e0
```

**NgRx State Implementation:**

```typescript
// State
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Actions
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ credential: string }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: string }>(),
    Logout: emptyProps(),
  },
});

// Reducer
export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(AuthActions.logout, () => initialState),
);

// Effects
export class AuthEffects {
  persistUser$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        map(({ user }) => {
          localStorage.setItem('orion_user', JSON.stringify(user));
          return { type: 'NO_ACTION' };
        }),
      ),
    { dispatch: false },
  );
}
```

## Role-Based Access Control (RBAC)

```mermaid
graph TB
    subgraph "RBAC System"
        USER[User<br/>Roles & Permissions]
        CONTEXT[RBACContext<br/>Current user context]
        SERVICE[RBACService<br/>Authorization logic]
    end

    subgraph "Feature Access"
        F1{Billing Feature}
        F2{Analytics Feature}
        F3{Compliance Feature}
    end

    subgraph "Authorization Checks"
        C1[hasRole: admin?]
        C2[hasPermission: view_billing?]
        C3[isAuthorized?]
    end

    USER --> CONTEXT
    CONTEXT --> SERVICE

    SERVICE --> C1
    SERVICE --> C2
    SERVICE --> C3

    C1 -->|Yes| F1
    C2 -->|Yes| F1
    C3 -->|Yes| F2
    C3 -->|Yes| F3

    C1 -->|No| DENY[Access Denied]
    C2 -->|No| DENY
    C3 -->|No| DENY

    style SERVICE fill:#e8f5e9
    style DENY fill:#ffcdd2
```

**RBAC Service Implementation:**

```typescript
@Injectable({ providedIn: 'root' })
export class RBACService {
  private contextSignal = signal<RBACContext | null>(null);

  currentContext = this.contextSignal.asReadonly();

  setContext(context: RBACContext): void {
    this.contextSignal.set(context);
  }

  isAuthorized(requiredRoles: string[] = [], requiredPermissions: string[] = []): boolean {
    const context = this.contextSignal();
    if (!context) return false;

    const hasRole = requiredRoles.length === 0 || requiredRoles.some((role) => context.roles.includes(role));

    const hasPermission = requiredPermissions.length === 0 || requiredPermissions.some((perm) => context.permissions.includes(perm));

    return hasRole && hasPermission;
  }

  hasRole(role: string): boolean {
    return this.contextSignal()?.roles.includes(role) ?? false;
  }

  hasPermission(permission: string): boolean {
    return this.contextSignal()?.permissions.includes(permission) ?? false;
  }
}
```

## Feature Loading with RBAC

```mermaid
sequenceDiagram
    participant App as AppComponent
    participant RBAC as RBAC Service
    participant Loader as Feature Loader
    participant Manifest as Manifest Service
    participant Router as Angular Router

    App->>RBAC: setContext(user.roles, user.permissions)
    App->>Loader: loadAuthorizedFeatures()

    Loader->>Manifest: loadManifest()
    Manifest-->>Loader: Feature URLs

    loop For each feature
        Loader->>RBAC: isAuthorized(feature.roles, feature.permissions)
        RBAC-->>Loader: true/false

        alt Authorized
            Loader->>Loader: Add to authorized list
        else Not Authorized
            Loader->>Loader: Skip feature
        end
    end

    loop For each authorized feature
        Loader->>Router: registerRemote(feature)
        Loader->>Router: loadRemote(feature.module)
        Router-->>Loader: Routes registered
    end

    Loader-->>App: Features loaded
```

## Feature Metadata for RBAC

```typescript
export interface FeatureMeta {
  key: string;
  displayName: string;
  routePath: string;
  icon: string;
  enabled: boolean;
  roles: string[];
  permissions: string[];
}

// Feature definitions
export const featuresMeta: Record<string, FeatureMeta> = {
  billing: {
    key: 'billing',
    displayName: 'Billing',
    routePath: 'billing',
    icon: 'attach_money',
    enabled: true,
    roles: ['admin', 'billing_manager'],
    permissions: ['view_billing'],
  },
  analytics: {
    key: 'analytics',
    displayName: 'Analytics',
    routePath: 'analytics',
    icon: 'analytics',
    enabled: true,
    roles: ['admin', 'analyst'],
    permissions: ['view_analytics'],
  },
  compliance: {
    key: 'compliance',
    displayName: 'Compliance',
    routePath: 'compliance',
    icon: 'verified_user',
    enabled: true,
    roles: ['admin', 'compliance_officer'],
    permissions: ['view_compliance'],
  },
};
```

## Authorization Matrix

```mermaid
graph TD
    subgraph "Roles"
        R1[admin]
        R2[billing_manager]
        R3[analyst]
        R4[compliance_officer]
        R5[user]
    end

    subgraph "Permissions"
        P1[view_all]
        P2[edit_all]
        P3[view_billing]
        P4[edit_billing]
        P5[view_analytics]
        P6[view_compliance]
        P7[edit_compliance]
    end

    R1 --> P1
    R1 --> P2

    R2 --> P3
    R2 --> P4

    R3 --> P5

    R4 --> P6
    R4 --> P7

    R5 --> P3
    R5 --> P5

    style R1 fill:#e8f5e9
```

**Authorization Matrix Table:**

| Role                 | Permissions                                   |
| -------------------- | --------------------------------------------- |
| `admin`              | `view_all`, `edit_all`, `delete_all`          |
| `billing_manager`    | `view_billing`, `edit_billing`                |
| `analyst`            | `view_analytics`, `export_reports`            |
| `compliance_officer` | `view_compliance`, `edit_compliance`, `audit` |
| `user`               | `view_billing`, `view_analytics`              |

## Session Management

```mermaid
graph TB
    A[User Logs In] --> B[JWT Token Issued]
    B --> C{Store Token}

    C -->|Frontend| D[LocalStorage]
    C -->|Backend| E[HTTP-Only Cookie<br/>Optional]

    D --> F[Include in GraphQL Requests<br/>Authorization Header]

    F --> G{Token Valid?}
    G -->|Yes| H[Process Request]
    G -->|No/Expired| I[401 Unauthorized]

    I --> J[Redirect to Login]

    K[User Logs Out] --> L[Clear LocalStorage]
    L --> M[Clear Auth State]
    M --> J

    style B fill:#e8f5e9
    style I fill:#ffcdd2
```

**Token Lifecycle:**

1. **Issue**: JWT issued after successful Google login
2. **Store**: Saved in localStorage as `orion_user`
3. **Use**: Included in Authorization header for API requests (if needed)
4. **Expiry**: 24 hours (configurable)
5. **Refresh**: Not implemented (user re-authenticates)
6. **Revoke**: Logout clears localStorage

## Security Considerations

```mermaid
graph TB
    subgraph "Security Measures"
        S1[HTTPS Only]
        S2[Google OAuth 2.0]
        S3[JWT Signing]
        S4[CORS Configuration]
        S5[Environment Secrets]
        S6[RBAC Enforcement]
    end

    subgraph "Threat Mitigation"
        T1[Man-in-the-Middle] -.->|Protected by| S1
        T2[Credential Theft] -.->|Protected by| S2
        T3[Token Forgery] -.->|Protected by| S3
        T4[Cross-Origin Attacks] -.->|Protected by| S4
        T5[Secret Exposure] -.->|Protected by| S5
        T6[Unauthorized Access] -.->|Protected by| S6
    end

    style S1 fill:#c8e6c9
    style S2 fill:#c8e6c9
    style S3 fill:#c8e6c9
    style S4 fill:#c8e6c9
    style S5 fill:#c8e6c9
    style S6 fill:#c8e6c9
```

**Security Best Practices:**

1. **Never expose client secrets in frontend code**
2. **Use HTTPS for all communication**
3. **Validate JWT tokens on backend if implementing protected routes**
4. **Implement token expiration**
5. **Use environment variables for sensitive configuration**
6. **Implement rate limiting on auth endpoints**
7. **Log authentication events for audit**

## Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant App as AppComponent
    participant Store as NgRx Store
    participant RBAC as RBAC Service
    participant Router as Angular Router
    participant LocalStorage

    User->>App: Click Logout
    App->>Store: Dispatch logout()
    Store->>Store: Reset auth state
    Store->>LocalStorage: Remove 'orion_user'
    Store->>RBAC: Clear context
    Store-->>App: Logout complete
    App->>Router: Navigate to /login
    Router-->>User: Show login page
```

## Error Handling in Auth Flow

```mermaid
graph TB
    A[Login Attempt] --> B{Google Auth}

    B -->|User Cancels| C[Show Cancellation Message]
    B -->|Network Error| D[Show Network Error]
    B -->|Invalid Credentials| E[Show Invalid Credentials]
    B -->|Success| F{Backend Verification}

    F -->|Backend Error| G[Show Server Error]
    F -->|Validation Failed| H[Show Validation Error]
    F -->|Success| I[Login Success]

    C --> J[Return to Login]
    D --> J
    E --> J
    G --> J
    H --> J

    I --> K[Navigate to Dashboard]

    style I fill:#c8e6c9
    style C fill:#ffcdd2
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style G fill:#ffcdd2
    style H fill:#ffcdd2
```

## Key Design Decisions

1. **Stateless Auth Service**: No database lookup on every auth check
2. **Google OAuth Only**: Single sign-on provider for simplicity
3. **JWT in LocalStorage**: Simpler than HTTP-only cookies for SPA
4. **Frontend RBAC**: Feature loading based on roles/permissions
5. **No Token Refresh**: Users re-authenticate after expiry (24h)
6. **Role Assignment in Auth Service**: Business logic determines roles
7. **NgRx for State**: Centralized auth state management

## Future Enhancements

- [ ] Implement JWT refresh tokens
- [ ] Add backend JWT validation middleware
- [ ] Support multiple OAuth providers (GitHub, Microsoft)
- [ ] Implement session timeout warnings
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Implement permission-based UI element hiding
- [ ] Add audit logging for all auth events
- [ ] Implement password-based auth as fallback
