# Deployment Strategy & CI/CD

## Overview

The Orion Enterprise platform uses a modern deployment strategy with frontend applications on Vercel and backend services on Render, leveraging CI/CD for automated deployments.

## Deployment Architecture
```mermaid
graph TB
    subgraph "Source Control"
        GIT[GitHub Repository<br/>Nx Monorepo]
    end

    subgraph "CI/CD Pipeline"
        PUSH[Git Push]
        BUILD[Build Trigger]
        TEST[Run Tests]
        DEPLOY[Deploy]
    end

    subgraph "Vercel (Frontend)"
        V_SHELL[Shell App<br/>orion-shell.vercel.app]
        V_BILL[Billing MFE<br/>orion-billing.vercel.app]
        V_ANLY[Analytics MFE<br/>orion-analytics.vercel.app]
        V_COMP[Compliance MFE<br/>orion-compliance.vercel.app]
    end

    subgraph "Render (Backend)"
        R_GW[API Gateway<br/>orion-api-gateway.onrender.com]
        R_AUTH[Auth Service<br/>orion-auth-service.onrender.com]
        R_BILL[Billing Service<br/>orion-billing-service.onrender.com]
        R_ANLY[Analytics Service<br/>orion-analytics-service.onrender.com]
        R_COMP[Compliance Service<br/>orion-compliance-service.onrender.com]
    end

    subgraph "Database"
        NEON[(Neon PostgreSQL<br/>Database)]
    end

    GIT --> PUSH
    PUSH --> BUILD
    BUILD --> TEST
    TEST --> DEPLOY

    DEPLOY --> V_SHELL
    DEPLOY --> V_BILL
    DEPLOY --> V_ANLY
    DEPLOY --> V_COMP

    DEPLOY --> R_GW
    DEPLOY --> R_AUTH
    DEPLOY --> R_BILL
    DEPLOY --> R_ANLY
    DEPLOY --> R_COMP

    R_GW --> NEON
    R_AUTH --> NEON
    R_BILL --> NEON
    R_ANLY --> NEON
    R_COMP --> NEON

    V_SHELL --> R_GW
    V_BILL --> R_GW
    V_ANLY --> R_GW
    V_COMP --> R_GW

    %% ---------- Styling ----------

    %% Source
    style GIT fill:#e3f2fd,stroke:#1e88e5,stroke-width:2px

    %% CI/CD
    style PUSH fill:#eeeeee
    style BUILD fill:#eeeeee
    style TEST fill:#eeeeee
    style DEPLOY fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px

    %% Shell (Blue)
    style V_SHELL fill:#bbdefb,stroke:#1565c0,stroke-width:2px
    style R_GW fill:#bbdefb,stroke:#1565c0,stroke-width:2px

    %% Auth (Red)
    style R_AUTH fill:#ffcdd2,stroke:#c62828,stroke-width:2px

    %% Billing (Green)
    style V_BILL fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style R_BILL fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px

    %% Analytics (Purple)
    style V_ANLY fill:#e1bee7,stroke:#6a1b9a,stroke-width:2px
    style R_ANLY fill:#e1bee7,stroke:#6a1b9a,stroke-width:2px

    %% Compliance (Orange)
    style V_COMP fill:#ffe0b2,stroke:#ef6c00,stroke-width:2px
    style R_COMP fill:#ffe0b2,stroke:#ef6c00,stroke-width:2px

    %% Database
    style NEON fill:#f8bbd0,stroke:#ad1457,stroke-width:2px

```
## CI/CD Pipeline Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant Vercel
    participant Render
    participant Neon as Neon DB

    Dev->>Git: git push origin main

    par Frontend Deployment
        Git->>Vercel: Webhook Trigger
        Vercel->>Vercel: Clone Repository
        Vercel->>Vercel: Install Dependencies<br/>(npm ci)
        Vercel->>Vercel: Run Build<br/>(nx build shell)
        Vercel->>Vercel: Optimize Assets
        Vercel->>Vercel: Deploy to CDN
        Vercel-->>Dev: Deployment Success<br/>+ Preview URL
    and Backend Deployment
        Git->>Render: Webhook Trigger
        Render->>Render: Clone Repository
        Render->>Render: Install Dependencies
        Render->>Render: Run Build<br/>(nx build api-gateway)
        Render->>Render: Start Service<br/>(node main.js)
        Render->>Neon: Connect to Database
        Render-->>Dev: Deployment Success<br/>+ Service URL
    end

    Dev->>Vercel: Access Application
    Vercel-->>Dev: Serve Frontend
    Dev->>Render: API Requests
    Render->>Neon: Query Database
    Neon-->>Render: Data
    Render-->>Dev: API Response
```

## Vercel Deployment Configuration

```mermaid
graph TB
    subgraph "Vercel Project Setup"
        V_PROJ[Vercel Project]
        V_ENV[Environment Variables]
        V_BUILD[Build Settings]
        V_DOMAIN[Custom Domains]
    end

    subgraph "Build Configuration"
        ROOT[Root Directory: ./]
        FRAMEWORK[Framework: Angular]
        BUILD_CMD[Build Command:<br/>nx build shell]
        OUTPUT[Output Directory:<br/>dist/apps/shell]
        NODE[Node Version: 18.x]
    end

    subgraph "Environment Variables"
        API_URL[NEXT_PUBLIC_API_URL]
        GOOGLE_ID[NEXT_PUBLIC_GOOGLE_CLIENT_ID]
    end

    V_PROJ --> V_ENV
    V_PROJ --> V_BUILD
    V_PROJ --> V_DOMAIN

    V_BUILD --> ROOT
    V_BUILD --> FRAMEWORK
    V_BUILD --> BUILD_CMD
    V_BUILD --> OUTPUT
    V_BUILD --> NODE

    V_ENV --> API_URL
    V_ENV --> GOOGLE_ID

    style V_PROJ fill:#e3f2fd
```

**Vercel Configuration File (`vercel.json`):**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/apps/shell/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/apps/shell/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID": "@google-client-id"
  }
}
```

**Build Commands for Each App:**

```bash
# Shell Application
nx build shell --configuration=production

# Billing MFE
nx build billing --configuration=production

# Analytics MFE
nx build analytics --configuration=production

# Compliance MFE
nx build compliance --configuration=production
```

## Render Deployment Configuration

```mermaid
graph TB
    subgraph "Render Service Setup"
        R_SVC[Render Service]
        R_ENV[Environment Variables]
        R_BUILD[Build Settings]
        R_HEALTH[Health Checks]
    end

    subgraph "Service Configuration"
        TYPE[Type: Web Service]
        REGION[Region: Singapore]
        BRANCH[Branch: main]
        START_CMD[Start Command:<br/>node main.js]
        BUILD_CMD2[Build Command:<br/>npm install && nx build api-gateway]
    end

    subgraph "Environment Variables"
        DB_URL[DATABASE_URL]
        PORT[PORT]
        NODE_ENV[NODE_ENV]
        AUTH_SECRET[AUTH_SECRET]
        SERVICE_URLS[SUBGRAPH_SERVICE_URLs]
    end

    R_SVC --> R_ENV
    R_SVC --> R_BUILD
    R_SVC --> R_HEALTH

    R_BUILD --> TYPE
    R_BUILD --> REGION
    R_BUILD --> BRANCH
    R_BUILD --> START_CMD
    R_BUILD --> BUILD_CMD2

    R_ENV --> DB_URL
    R_ENV --> PORT
    R_ENV --> NODE_ENV
    R_ENV --> AUTH_SECRET
    R_ENV --> SERVICE_URLS

    style R_SVC fill:#fff3e0
```

**Render Configuration File (`render.yaml`):**

```yaml
services:
  # API Gateway
  - type: web
    name: orion-api-gateway
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npx nx build api-gateway --verbose
    startCommand: node dist/apps/api-gateway/main.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        sync: false
      - key: AUTH_SERVICE_URL
        value: https://orion-auth-service.onrender.com/graphql
      - key: BILLING_SERVICE_URL
        value: https://orion-billing-service.onrender.com/graphql
      - key: ANALYTICS_SERVICE_URL
        value: https://orion-analytics-service.onrender.com/graphql
      - key: COMPLIANCE_SERVICE_URL
        value: https://orion-compliance-service.onrender.com/graphql

  # Auth Service
  - type: web
    name: orion-auth-service
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npx nx build auth-service
    startCommand: node dist/apps/auth-service/main.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: AUTH_SECRET
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false

  # Billing Service
  - type: web
    name: orion-billing-service
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npx nx build billing-service && npx prisma generate --schema=apps/billing-service/prisma/schema.prisma
    startCommand: node dist/apps/billing-service/main.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3006
      - key: DATABASE_URL
        sync: false

  # ... Additional services follow same pattern
```

## Environment Variables Management

```mermaid
graph TB
    subgraph "Development (.env.local)"
        D1[DATABASE_URL=postgresql://localhost...]
        D2[AUTH_SECRET=dev-secret]
        D3[GOOGLE_CLIENT_ID=dev-client-id]
    end

    subgraph "Production (Vercel/Render)"
        P1[DATABASE_URL=neon-production-url]
        P2[AUTH_SECRET=production-secret]
        P3[GOOGLE_CLIENT_ID=production-client-id]
    end

    subgraph "Environment Files"
        ENV_DEV[.env.development]
        ENV_PROD[.env.production]
        ENV_LOCAL[.env.local]
    end

    ENV_DEV --> D1
    ENV_DEV --> D2
    ENV_DEV --> D3

    ENV_PROD --> P1
    ENV_PROD --> P2
    ENV_PROD --> P3

    style ENV_PROD fill:#ffcdd2
    style ENV_LOCAL fill:#c8e6c9
```

**Critical Environment Variables:**

| Variable           | Service                   | Purpose                              |
| ------------------ | ------------------------- | ------------------------------------ |
| `DATABASE_URL`     | All Backend Services      | Neon PostgreSQL connection string    |
| `AUTH_SECRET`      | Auth Service, API Gateway | JWT signing secret                   |
| `GOOGLE_CLIENT_ID` | Shell App, Auth Service   | Google OAuth client ID               |
| `PORT`             | All Backend Services      | Service port number                  |
| `NODE_ENV`         | All Services              | Environment (development/production) |
| `*_SERVICE_URL`    | API Gateway               | Subgraph service URLs                |

## Database Migration Strategy

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant Render
    participant Neon as Neon DB

    Dev->>Dev: Modify Prisma Schema
    Dev->>Dev: Test Locally<br/>(prisma db push)
    Dev->>Git: Commit & Push

    Git->>Render: Trigger Deployment
    Render->>Render: Build Application
    Render->>Render: Generate Prisma Client<br/>(prisma generate)

    Note over Render: No auto-migration in production

    Render->>Neon: Connect with Existing Schema
    Render->>Render: Start Service

    Note over Dev,Neon: Manual Migration for Production
    Dev->>Neon: Run Migration Script<br/>(prisma db push --schema=prisma_master.prisma)
    Neon-->>Dev: Schema Updated
```

**Migration Commands:**

```bash
# Development - Auto-apply schema changes
DATABASE_URL="postgresql://localhost..." npx prisma db push --schema=prisma_master.prisma

# Production - Manual migration
DATABASE_URL="postgresql://neon-production-url" npx prisma db push --schema=prisma_master.prisma

# Generate Prisma Client
npx prisma generate --schema=apps/billing-service/prisma/schema.prisma
```

## Build Optimization

```mermaid
graph TB
    subgraph "Build Optimizations"
        O1[Tree Shaking<br/>Remove unused code]
        O2[Code Splitting<br/>Lazy loading]
        O3[Minification<br/>Compress JavaScript]
        O4[Bundle Analysis<br/>Identify bloat]
        O5[Caching<br/>Layer caching]
    end

    subgraph "Results"
        R1[Smaller Bundle Size]
        R2[Faster Load Times]
        R3[Better Performance]
        R4[Reduced Build Time]
    end

    O1 --> R1
    O2 --> R2
    O3 --> R1
    O4 --> R1
    O5 --> R4

    R1 --> R3
    R2 --> R3

    style O1 fill:#e3f2fd
    style R3 fill:#c8e6c9
```

**Webpack Production Configuration:**

```javascript
// Automatically applied by Nx
module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    },
  },
};
```

## Deployment Workflow

```mermaid
graph TB
    START[Developer Makes Changes] --> COMMIT[Commit to Feature Branch]
    COMMIT --> PR[Create Pull Request]
    PR --> REVIEW{Code Review}

    REVIEW -->|Rejected| COMMIT
    REVIEW -->|Approved| MERGE[Merge to Main]

    MERGE --> TRIGGER[CI/CD Triggered]

    TRIGGER --> FRONTEND{Frontend Changed?}
    TRIGGER --> BACKEND{Backend Changed?}

    FRONTEND -->|Yes| V_BUILD[Vercel Build & Deploy]
    FRONTEND -->|No| SKIP1[Skip Frontend Deploy]

    BACKEND -->|Yes| R_BUILD[Render Build & Deploy]
    BACKEND -->|No| SKIP2[Skip Backend Deploy]

    V_BUILD --> V_TEST[Run E2E Tests]
    R_BUILD --> R_TEST[Health Check]

    V_TEST -->|Pass| V_PROD[Deploy to Production]
    V_TEST -->|Fail| ROLLBACK[Rollback]

    R_TEST -->|Pass| R_PROD[Deploy to Production]
    R_TEST -->|Fail| ROLLBACK

    V_PROD --> NOTIFY[Notify Team]
    R_PROD --> NOTIFY
    ROLLBACK --> NOTIFY

    style V_PROD fill:#c8e6c9
    style R_PROD fill:#c8e6c9
    style ROLLBACK fill:#ffcdd2
```

## Health Checks & Monitoring

```mermaid
graph TB
    subgraph "Health Monitoring"
        HC[Health Check Endpoint<br/>/health]
        STATUS[Service Status]
        DB_CHECK[Database Connection]
        MEM_CHECK[Memory Usage]
    end

    subgraph "Render Platform"
        R_MON[Automatic Monitoring]
        R_RESTART[Auto-Restart on Failure]
        R_LOGS[Service Logs]
    end

    subgraph "Alerts"
        A1[Downtime Alert]
        A2[High Memory Alert]
        A3[Error Rate Alert]
    end

    HC --> STATUS
    HC --> DB_CHECK
    HC --> MEM_CHECK

    STATUS --> R_MON
    DB_CHECK --> R_MON
    MEM_CHECK --> R_MON

    R_MON --> R_RESTART
    R_MON --> R_LOGS
    R_MON --> A1
    R_MON --> A2
    R_MON --> A3

    style HC fill:#e8f5e9
    style R_RESTART fill:#fff3e0
```

**Health Check Implementation:**

```typescript
// API Gateway Health Endpoint
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  async ready() {
    // Check database connection
    const isDbReady = await this.checkDatabase();

    return {
      status: isDbReady ? 'ready' : 'not_ready',
      database: isDbReady,
    };
  }
}
```

## Rollback Strategy

```mermaid
sequenceDiagram
    participant Team
    participant Vercel
    participant Render
    participant Users

    Note over Team,Users: Deployment Issue Detected

    Team->>Vercel: Rollback to Previous Deployment
    Vercel->>Vercel: Switch to Previous Build
    Vercel-->>Users: Serve Previous Version

    Team->>Render: Rollback to Previous Deployment
    Render->>Render: Redeploy Previous Commit
    Render-->>Users: Serve Previous Version

    Note over Team,Users: Service Restored

    Team->>Team: Investigate Issue
    Team->>Team: Fix & Redeploy
```

**Rollback Commands:**

```bash
# Vercel - Use Dashboard or CLI
vercel rollback <deployment-url>

# Render - Redeploy previous commit
render deploy --commit <previous-commit-hash>

# Or use Render Dashboard to trigger previous deployment
```

## Performance Metrics

```mermaid
graph TB
    subgraph "Key Metrics"
        M1[Build Time<br/>~3-5 minutes]
        M2[Deploy Time<br/>~1-2 minutes]
        M3[Cold Start<br/>~500ms - 1s]
        M4[Time to First Byte<br/>~200ms]
        M5[Bundle Size<br/>~500KB main bundle]
    end

    subgraph "Targets"
        T1[<5 minutes]
        T2[<3 minutes]
        T3[<1 second]
        T4[<300ms]
        T5[<1MB]
    end

    M1 --> T1
    M2 --> T2
    M3 --> T3
    M4 --> T4
    M5 --> T5

    T1 -.->|Met| OK1[✓]
    T2 -.->|Met| OK2[✓]
    T3 -.->|Met| OK3[✓]
    T4 -.->|Met| OK4[✓]
    T5 -.->|Met| OK5[✓]

    style OK1 fill:#c8e6c9
    style OK2 fill:#c8e6c9
    style OK3 fill:#c8e6c9
    style OK4 fill:#c8e6c9
    style OK5 fill:#c8e6c9
```

## Scaling Strategy

```mermaid
graph LR
    subgraph "Frontend (Vercel)"
        F1[CDN Edge Locations<br/>Auto-scaling]
        F2[Serverless Functions<br/>On-demand]
    end

    subgraph "Backend (Render)"
        B1[Horizontal Scaling<br/>Add more instances]
        B2[Vertical Scaling<br/>Increase resources]
    end

    subgraph "Database (Neon)"
        D1[Connection Pooling]
        D2[Auto-scaling Storage]
        D3[Read Replicas<br/>If needed]
    end

    LOAD[Increased Load] --> F1
    LOAD --> B1
    LOAD --> D1

    style LOAD fill:#ffcdd2
    style F1 fill:#c8e6c9
    style B1 fill:#c8e6c9
    style D1 fill:#c8e6c9
```

## Deployment Checklist

- [ ] **Pre-Deployment**
  - [ ] All tests passing
  - [ ] Code reviewed and approved
  - [ ] Environment variables updated
  - [ ] Database migrations tested
  - [ ] Bundle size analyzed

- [ ] **Deployment**
  - [ ] Frontend deployed to Vercel
  - [ ] Backend services deployed to Render
  - [ ] Health checks passing
  - [ ] CORS configuration verified
  - [ ] API endpoints accessible

- [ ] **Post-Deployment**
  - [ ] Smoke tests executed
  - [ ] User acceptance testing
  - [ ] Performance monitoring
  - [ ] Error tracking enabled
  - [ ] Team notified

## Key Design Decisions

1. **Vercel for Frontend**: Best Angular/Next.js deployment experience, CDN, automatic previews
2. **Render for Backend**: Simple NestJS deployment, free tier, managed services
3. **Neon for Database**: Serverless PostgreSQL, auto-scaling, branching
4. **Monorepo with Nx**: Unified codebase, shared libraries, affected commands
5. **Automated Deployments**: Git push triggers CI/CD
6. **No Docker**: Use platform-native builds for simplicity
7. **Environment-based Configuration**: Different configs for dev/staging/prod

## Future Enhancements

- [ ] Add staging environment
- [ ] Implement blue-green deployments
- [ ] Add automated E2E tests in CI
- [ ] Implement feature flags for gradual rollouts
- [ ] Add performance budgets in CI
- [ ] Implement automated database backups
- [ ] Add canary deployments
- [ ] Integrate monitoring tools (Datadog, Sentry)
