# Frontend Micro-Frontend Architecture (MFA)

## Overview

The Orion Enterprise frontend uses **Webpack Module Federation** to implement a Micro-Frontend Architecture (MFA), enabling independent development, deployment, and scaling of feature modules.

## Micro-Frontend Architecture

```mermaid
graph TB
    subgraph "Shell Application (Host) - Port 4200"
        SHELL[Shell App<br/>orion-shell]
        ROUTE[Angular Router]
        AUTH_LIB[Auth Library<br/>@orion/auth]
        RBAC_LIB[RBAC Library<br/>@orion/rbac]
        STORE[NgRx Store<br/>Global State]
        APOLLO[Apollo Client<br/>GraphQL]
    end

    subgraph "Billing MFE (Remote) - Port 4201"
        BILL_APP[Billing App]
        BILL_COMP[Billing Components]
        BILL_SVC[Billing Service]
        BILL_ROUTES[Billing Routes]
    end

    subgraph "Analytics MFE (Remote) - Port 4202"
        ANLY_APP[Analytics App]
        ANLY_COMP[Analytics Components]
        ANLY_SVC[Analytics Service]
        ANLY_ROUTES[Analytics Routes]
    end

    subgraph "Compliance MFE (Remote) - Port 4203"
        COMP_APP[Compliance App]
        COMP_COMP[Compliance Components]
        COMP_SVC[Compliance Service]
        COMP_ROUTES[Compliance Routes]
    end

    SHELL --> ROUTE
    SHELL --> AUTH_LIB
    SHELL --> RBAC_LIB
    SHELL --> STORE
    SHELL --> APOLLO

    ROUTE -.->|Dynamic Load| BILL_ROUTES
    ROUTE -.->|Dynamic Load| ANLY_ROUTES
    ROUTE -.->|Dynamic Load| COMP_ROUTES

    BILL_APP --> BILL_COMP
    BILL_COMP --> BILL_SVC
    BILL_SVC --> APOLLO

    ANLY_APP --> ANLY_COMP
    ANLY_COMP --> ANLY_SVC
    ANLY_SVC --> APOLLO

    COMP_APP --> COMP_COMP
    COMP_COMP --> COMP_SVC
    COMP_SVC --> APOLLO

    style SHELL fill:#e3f2fd
    style BILL_APP fill:#fff3e0
    style ANLY_APP fill:#fff3e0
    style COMP_APP fill:#fff3e0
```

## Module Federation Configuration

```mermaid
graph LR
    subgraph "Host (Shell)"
        H[webpack.config.js<br/>ModuleFederationPlugin]
        H_EXP[Exposes: None]
        H_REM[Remotes:<br/>billing, analytics, compliance]
        H_SHARE[Shared:<br/>@angular/*, rxjs, etc.]
    end

    subgraph "Remote (Billing)"
        R1[webpack.config.js<br/>ModuleFederationPlugin]
        R1_EXP[Exposes:<br/>./Routes]
        R1_REM[Remotes: None]
        R1_SHARE[Shared: Same as Host]
    end

    subgraph "Remote (Analytics)"
        R2[webpack.config.js<br/>ModuleFederationPlugin]
        R2_EXP[Exposes:<br/>./Routes]
        R2_REM[Remotes: None]
        R2_SHARE[Shared: Same as Host]
    end

    subgraph "Remote (Compliance)"
        R3[webpack.config.js<br/>ModuleFederationPlugin]
        R3_EXP[Exposes:<br/>./Routes]
        R3_REM[Remotes: None]
        R3_SHARE[Shared: Same as Host]
    end

    H --> H_REM
    H_REM -.->|Loads| R1_EXP
    H_REM -.->|Loads| R2_EXP
    H_REM -.->|Loads| R3_EXP

    style H fill:#e8f5e9
    style R1 fill:#fff3e0
    style R2 fill:#fff3e0
    style R3 fill:#fff3e0
```

## Shell Application Architecture

```mermaid
classDiagram
    class AppComponent {
        +user: Signal~User~
        +router: Router
        +rbac: RBACService
        +featureLoader: FeatureLoaderService
        +ngOnInit()
        +reloadFeatures()
        +logout()
    }

    class FeatureLoaderService {
        -router: Router
        -rbac: RBACService
        -manifestService: ManifestService
        +isContentLoading: WritableSignal~boolean~
        +loadAuthorizedFeatures(): Promise~Feature[]~
        +registerAndLoadRemote(feature): Promise~void~
    }

    class ManifestService {
        -http: HttpClient
        +loadManifest(): Promise~Record~
        -manifestCache: Map
    }

    class RBACService {
        +currentContext: Signal~RBACContext~
        +setContext(context): void
        +isAuthorized(roles, permissions): boolean
        +hasRole(role): boolean
        +hasPermission(permission): boolean
    }

    class AuthService {
        +loginWithGoogle(credential): Observable~AuthResponse~
        +logout(): void
    }

    class AuthStore {
        +user: Signal~User~
        +loading: Signal~boolean~
        +error: Signal~Error~
        +login(user): void
        +logout(): void
    }

    AppComponent --> FeatureLoaderService
    AppComponent --> RBACService
    AppComponent --> AuthService
    AuthService --> AuthStore
    FeatureLoaderService --> ManifestService
    FeatureLoaderService --> RBACService
```

## Dynamic Module Loading Flow

```mermaid
sequenceDiagram
    participant User
    participant Shell as Shell App
    participant RBAC as RBAC Service
    participant Loader as Feature Loader
    participant Manifest as Manifest Service
    participant Remote as Remote MFE
    participant Router as Angular Router

    User->>Shell: User Logs In
    Shell->>RBAC: setContext(user.roles, user.permissions)
    Shell->>Loader: loadAuthorizedFeatures()

    Loader->>Manifest: loadManifest()
    Manifest-->>Loader: {billing: "http://...", analytics: "..."}

    Loader->>RBAC: isAuthorized(feature.roles, feature.permissions)
    RBAC-->>Loader: true/false

    loop For each authorized feature
        Loader->>Remote: registerRemote(name, entry)
        Loader->>Remote: loadRemote(exposedModule)
        Remote-->>Loader: Routes[]
        Loader->>Router: router.resetConfig([...routes])
    end

    Loader-->>Shell: Authorized features loaded

    User->>Shell: Navigate to /billing
    Shell->>Router: Route activation
    Router->>Remote: Load Billing Module
    Remote-->>User: Render Billing UI
```

## Feature Metadata Configuration

```mermaid
graph TB
    subgraph "Feature Metadata"
        META{featuresMeta}

        BILL[Billing Feature<br/>Path: /billing<br/>Roles: admin, billing_manager<br/>Permissions: view_billing]

        ANLY[Analytics Feature<br/>Path: /analytics<br/>Roles: admin, analyst<br/>Permissions: view_analytics]

        COMP[Compliance Feature<br/>Path: /compliance<br/>Roles: admin, compliance_officer<br/>Permissions: view_compliance]
    end

    META --> BILL
    META --> ANLY
    META --> COMP

    style META fill:#e8f5e9
```

## Component Communication Patterns

### 1. Parent-Child Communication

```mermaid
graph TB
    A[Shell Component] -->|@Input| B[Sidebar Component]
    B -->|@Output| A
    A -->|@Input| C[Header Component]
    C -->|@Output| A
```

### 2. Service-Based Communication

```mermaid
graph LR
    A[Component A] -->|Inject| B[Shared Service]
    C[Component B] -->|Inject| B
    D[Component C] -->|Inject| B

    B -->|BehaviorSubject| A
    B -->|BehaviorSubject| C
    B -->|BehaviorSubject| D

    style B fill:#e8f5e9
```

### 3. NgRx Store Communication

```mermaid
graph TB
    subgraph "NgRx Store Pattern"
        COMP[Components]
        STORE[Store<br/>Central State]
        ACTIONS[Actions]
        REDUCERS[Reducers]
        EFFECTS[Effects]
        API[API Service]
    end

    COMP -->|dispatch| ACTIONS
    ACTIONS --> REDUCERS
    REDUCERS --> STORE
    STORE -->|select| COMP

    ACTIONS --> EFFECTS
    EFFECTS -->|API Call| API
    API -->|Response| EFFECTS
    EFFECTS -->|Success Action| REDUCERS

    style STORE fill:#e8f5e9
```

## Billing MFE Detailed Architecture

```mermaid
classDiagram
    class BillingComponent {
        +revenueStats$: Observable~RevenueStats~
        +transactions$: Observable~Transaction[]~
        +billingService: BillingService
        +ngOnInit(): void
    }

    class BillingService {
        -apollo: Apollo
        +getRevenueStats(): Observable~RevenueStats~
        +getTransactions(): Observable~Transaction[]~
    }

    class RevenueStats {
        +totalRevenue: number
        +monthlyGrowth: number
        +pendingInvoices: number
        +nextPayoutDate: string
    }

    class Transaction {
        +id: string
        +customerName: string
        +amount: number
        +status: string
        +date: string
    }

    BillingComponent --> BillingService
    BillingService --> RevenueStats
    BillingService --> Transaction
```

**GraphQL Queries:**

```graphql
query GetRevenueStats {
  revenueStats {
    totalRevenue
    monthlyGrowth
    pendingInvoices
    nextPayoutDate
  }
}

query GetTransactions {
  transactions {
    id
    customerName
    amount
    status
    date
  }
}
```

## Analytics MFE Detailed Architecture

```mermaid
classDiagram
    class AnalyticsComponent {
        +analyticsStats$: Observable~AnalyticsStats~
        +recentActivity$: Observable~ActivityLog[]~
        +analyticsService: AnalyticsService
        +ngOnInit(): void
    }

    class AnalyticsService {
        -apollo: Apollo
        +getStats(): Observable~AnalyticsStats~
        +getRecentActivity(): Observable~ActivityLog[]~
    }

    class AnalyticsStats {
        +activeUsers: number
        +totalRequests: number
        +avgResponseTime: number
        +errorRate: number
    }

    class ActivityLog {
        +id: string
        +userId: string
        +action: string
        +timestamp: string
    }

    AnalyticsComponent --> AnalyticsService
    AnalyticsService --> AnalyticsStats
    AnalyticsService --> ActivityLog
```

## Compliance MFE Detailed Architecture

```mermaid
classDiagram
    class ComplianceComponent {
        +complianceStats$: Observable~ComplianceStats~
        +complianceChecks$: Observable~ComplianceCheck[]~
        +complianceService: ComplianceService
        +ngOnInit(): void
    }

    class ComplianceService {
        -apollo: Apollo
        +getStats(): Observable~ComplianceStats~
        +getChecks(): Observable~ComplianceCheck[]~
    }

    class ComplianceStats {
        +complianceScore: number
        +activePolicies: number
        +recentViolations: number
        +lastAudit: string
    }

    class ComplianceCheck {
        +id: string
        +title: string
        +status: string
        +category: string
        +lastCheck: string
    }

    ComplianceComponent --> ComplianceService
    ComplianceService --> ComplianceStats
    ComplianceService --> ComplianceCheck
```

## Shared Libraries Architecture

```mermaid
graph TB
    subgraph "Shared Libraries (Nx Workspace)"
        AUTH[@orion/auth<br/>Authentication logic]
        RBAC[@orion/rbac<br/>Authorization logic]
        UI[@orion/ui<br/>UI components]
        UTILS[@orion/utils<br/>Utilities]
    end

    subgraph "Applications"
        SHELL[Shell App]
        BILL[Billing MFE]
        ANLY[Analytics MFE]
        COMP[Compliance MFE]
    end

    SHELL --> AUTH
    SHELL --> RBAC
    SHELL --> UI
    SHELL --> UTILS

    BILL --> UI
    BILL --> UTILS

    ANLY --> UI
    ANLY --> UTILS

    COMP --> UI
    COMP --> UTILS

    style AUTH fill:#e3f2fd
    style RBAC fill:#e3f2fd
    style UI fill:#e3f2fd
    style UTILS fill:#e3f2fd
```

## Module Federation Manifest

```mermaid
graph TB
    subgraph "Manifest File (module-federation.manifest.json)"
        MAN[{<br/>"billing": "http://localhost:4201/remoteEntry.mjs",<br/>"analytics": "http://localhost:4202/remoteEntry.mjs",<br/>"compliance": "http://localhost:4203/remoteEntry.mjs"<br/>}]
    end

    subgraph "Runtime Loading"
        LOADER[Feature Loader Service]
        REG[registerRemotes()]
        LOAD[loadRemote()]
    end

    MAN --> LOADER
    LOADER --> REG
    REG --> LOAD

    style MAN fill:#fff3e0
```

## Routing Strategy

```mermaid
graph TB
    ROOT[/] --> LOGIN[/login]
    ROOT --> DYNAMIC[/** Catch-all]

    DYNAMIC -.->|Lazy Load| BILL[/billing]
    DYNAMIC -.->|Lazy Load| ANLY[/analytics]
    DYNAMIC -.->|Lazy Load| COMP[/compliance]

    BILL --> BILL_DASH[/billing/dashboard]
    BILL --> BILL_TRANS[/billing/transactions]

    ANLY --> ANLY_DASH[/analytics/dashboard]
    ANLY --> ANLY_REP[/analytics/reports]

    COMP --> COMP_DASH[/compliance/dashboard]
    COMP --> COMP_AUD[/compliance/audits]

    style ROOT fill:#e8f5e9
    style DYNAMIC fill:#fff3e0
```

## State Management with NgRx

```mermaid
graph TB
    subgraph "Auth State"
        AUTH_STATE[AuthState<br/>user, loading, error]
        AUTH_ACTIONS[AuthActions<br/>login, logout, loginSuccess, loginFailure]
        AUTH_REDUCER[authReducer]
        AUTH_EFFECTS[AuthEffects<br/>persistUser$]
    end

    subgraph "Components"
        APP_COMP[AppComponent]
        AUTH_COMP[AuthComponent]
    end

    APP_COMP -->|dispatch| AUTH_ACTIONS
    AUTH_COMP -->|dispatch| AUTH_ACTIONS

    AUTH_ACTIONS --> AUTH_REDUCER
    AUTH_ACTIONS --> AUTH_EFFECTS

    AUTH_REDUCER --> AUTH_STATE
    AUTH_STATE -->|select| APP_COMP
    AUTH_STATE -->|select| AUTH_COMP

    AUTH_EFFECTS -->|dispatch| AUTH_ACTIONS

    style AUTH_STATE fill:#e8f5e9
```

## Apollo GraphQL Client Configuration

```mermaid
graph TB
    subgraph "Apollo Configuration"
        HTTP[HttpLink<br/>GraphQL Endpoint]
        CACHE[InMemoryCache<br/>Normalized Cache]
        CLIENT[Apollo Client]
    end

    subgraph "Services"
        BILL_SVC[BillingService]
        ANLY_SVC[AnalyticsService]
        COMP_SVC[ComplianceService]
    end

    HTTP --> CLIENT
    CACHE --> CLIENT

    CLIENT --> BILL_SVC
    CLIENT --> ANLY_SVC
    CLIENT --> COMP_SVC

    style CLIENT fill:#e8f5e9
```

## Build & Bundle Strategy

```mermaid
graph LR
    subgraph "Build Process"
        SRC[Source Code<br/>.ts, .html, .css]
        NG[Angular Compiler<br/>ngc]
        WP[Webpack<br/>+ Module Federation]
        BUNDLE[Output Bundle<br/>+ remoteEntry.mjs]
    end

    SRC --> NG
    NG --> WP
    WP --> BUNDLE

    subgraph "Optimizations"
        LAZY[Lazy Loading]
        TREE[Tree Shaking]
        MINI[Minification]
        SPLIT[Code Splitting]
    end

    WP --> LAZY
    WP --> TREE
    WP --> MINI
    WP --> SPLIT

    style WP fill:#fff3e0
```

## Error Handling Strategy

```mermaid
graph TB
    A[UI Component] -->|Try| B{Operation}
    B -->|Success| C[Render Data]
    B -->|GraphQL Error| D[Error Interceptor]
    B -->|Network Error| E[Error Interceptor]
    B -->|Runtime Error| F[Error Boundary]

    D --> G[Display Error Message]
    E --> G
    F --> H[Fallback UI]

    G --> I[Log to Console]
    H --> I

    style C fill:#c8e6c9
    style G fill:#ffcdd2
    style H fill:#ffcdd2
```

## Performance Optimizations

1. **Code Splitting**: Each MFE is a separate bundle
2. **Lazy Loading**: Routes loaded on-demand
3. **Shared Dependencies**: Common libraries shared across MFEs
4. **OnPush Change Detection**: Optimized change detection strategy
5. **TrackBy Functions**: Efficient list rendering
6. **Memoization**: Signal-based reactivity
7. **Bundle Analysis**: Webpack Bundle Analyzer

## Key Design Decisions

1. **Module Federation over iframes**: Better performance, shared dependencies
2. **Route-based MFEs**: Each feature is a separate deployable unit
3. **Shared Apollo Client**: Single GraphQL client instance
4. **RBAC-based loading**: Only load authorized features
5. **Centralized Auth**: Shell manages authentication
6. **Nx Monorepo**: Shared libraries, unified tooling

## Deployment Architecture

```mermaid
graph TB
    subgraph "Vercel Deployments"
        V1[Shell App<br/>orion-shell.vercel.app]
        V2[Billing MFE<br/>orion-billing.vercel.app]
        V3[Analytics MFE<br/>orion-analytics.vercel.app]
        V4[Compliance MFE<br/>orion-compliance.vercel.app]
    end

    subgraph "CDN"
        CDN1[Shell Static Assets]
        CDN2[Billing Static Assets]
        CDN3[Analytics Static Assets]
        CDN4[Compliance Static Assets]
    end

    V1 --> CDN1
    V2 --> CDN2
    V3 --> CDN3
    V4 --> CDN4

    USER[User Browser] --> CDN1
    CDN1 -.->|Loads remoteEntry.mjs| CDN2
    CDN1 -.->|Loads remoteEntry.mjs| CDN3
    CDN1 -.->|Loads remoteEntry.mjs| CDN4

    style USER fill:#e3f2fd
    style CDN1 fill:#e8f5e9
```
