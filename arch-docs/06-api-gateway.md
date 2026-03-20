# API Gateway & GraphQL Federation

## Overview

The API Gateway uses **Apollo Federation** to compose multiple GraphQL subgraphs into a single unified GraphQL API, providing a single entry point for all client queries.

## API Gateway Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        C1[Shell App]
        C2[Billing MFE]
        C3[Analytics MFE]
        C4[Compliance MFE]
    end

    subgraph "API Gateway (Port 3000)"
        GW[Apollo Gateway]
        EXEC[GraphQL Executor]
        PLANNER[Query Planner]
        COMPOSER[Schema Composer]
    end

    subgraph "Subgraph Services"
        S1[Auth Service<br/>localhost:3001/graphql]
        S2[User Service<br/>localhost:3002/graphql]
        S3[Feature Service<br/>localhost:3003/graphql]
        S4[Analytics Service<br/>localhost:3004/graphql]
        S5[Notification Service<br/>localhost:3005/graphql]
        S6[Billing Service<br/>localhost:3006/graphql]
        S7[Compliance Service<br/>localhost:3007/graphql]
    end

    C1 -->|GraphQL Query| GW
    C2 -->|GraphQL Query| GW
    C3 -->|GraphQL Query| GW
    C4 -->|GraphQL Query| GW

    GW --> PLANNER
    PLANNER --> COMPOSER
    COMPOSER --> EXEC

    EXEC -->|Subgraph Query| S1
    EXEC -->|Subgraph Query| S2
    EXEC -->|Subgraph Query| S3
    EXEC -->|Subgraph Query| S4
    EXEC -->|Subgraph Query| S5
    EXEC -->|Subgraph Query| S6
    EXEC -->|Subgraph Query| S7

    style GW fill:#e8f5e9
```

## Gateway Configuration

```mermaid
classDiagram
    class AppModule {
        +imports: GraphQLModule
        +providers: []
        +controllers: AppController
    }

    class GraphQLModule {
        +driver: ApolloGatewayDriver
        +gateway: ApolloGateway
        +server: ApolloServer
    }

    class ApolloGateway {
        +supergraphSdl?: string
        +serviceList: ServiceEndpoint[]
        +buildService: Function
    }

    class ServiceEndpoint {
        +name: string
        +url: string
    }

    class RemoteGraphQLDataSource {
        +willSendRequest(options): void
        +didReceiveResponse(options): Response
    }

    AppModule --> GraphQLModule
    GraphQLModule --> ApolloGateway
    ApolloGateway --> ServiceEndpoint
    ApolloGateway --> RemoteGraphQLDataSource
```

**Gateway Configuration Code:**

```typescript
// apps/api-gateway/src/app/app.module.ts
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        serviceList: [
          { name: 'auth', url: process.env.AUTH_SERVICE_URL },
          { name: 'users', url: process.env.USER_SERVICE_URL },
          { name: 'features', url: process.env.FEATURE_SERVICE_URL },
          { name: 'analytics', url: process.env.ANALYTICS_SERVICE_URL },
          { name: 'notifications', url: process.env.NOTIFICATION_SERVICE_URL },
          { name: 'billing', url: process.env.BILLING_SERVICE_URL },
          { name: 'compliance', url: process.env.COMPLIANCE_SERVICE_URL },
        ],
        buildService({ url }) {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {
              // Forward headers, add auth token, etc.
              request.http.headers.set('authorization', context.req?.headers?.authorization || '');
            },
          });
        },
      },
      server: {
        context: ({ req }) => ({ req }),
      },
    }),
  ],
})
export class AppModule {}
```

## Subgraph Registration

```mermaid
graph LR
    subgraph "Service Discovery"
        ENV[Environment Variables]
        LIST[Service List]
        REG[Registry]
    end

    subgraph "Subgraphs"
        S1[auth-service]
        S2[user-service]
        S3[billing-service]
        S4[analytics-service]
        S5[compliance-service]
    end

    ENV --> LIST
    LIST --> REG

    REG -.->|Discover| S1
    REG -.->|Discover| S2
    REG -.->|Discover| S3
    REG -.->|Discover| S4
    REG -.->|Discover| S5

    style REG fill:#e8f5e9
```

**Environment Configuration:**

```bash
# .env for API Gateway
AUTH_SERVICE_URL=http://localhost:3001/graphql
USER_SERVICE_URL=http://localhost:3002/graphql
FEATURE_SERVICE_URL=http://localhost:3003/graphql
ANALYTICS_SERVICE_URL=http://localhost:3004/graphql
NOTIFICATION_SERVICE_URL=http://localhost:3005/graphql
BILLING_SERVICE_URL=http://localhost:3006/graphql
COMPLIANCE_SERVICE_URL=http://localhost:3007/graphql
```

## Query Planning & Execution

```mermaid
sequenceDiagram
    participant Client
    participant Gateway as API Gateway
    participant Planner as Query Planner
    participant Auth as Auth Subgraph
    participant Billing as Billing Subgraph
    participant DB as Database

    Client->>Gateway: Complex Query<br/>{user, transactions}
    Gateway->>Planner: Parse & Plan Query

    Note over Planner: Analyze query<br/>Split into subgraph queries

    Planner->>Planner: Create Query Plan

    par Parallel Execution
        Gateway->>Auth: Query {user}
        Auth->>Auth: Process (no DB)
        Auth-->>Gateway: User data
    and
        Gateway->>Billing: Query {transactions}
        Billing->>DB: SELECT * FROM Transaction
        DB-->>Billing: Transaction records
        Billing-->>Gateway: Transaction data
    end

    Gateway->>Gateway: Merge Results
    Gateway-->>Client: Unified Response
```

**Example Query Plan:**

```graphql
# Client sends this query
query GetUserWithTransactions {
  user(id: "user-123") {
    id
    name
    email
  }
  transactions(limit: 10) {
    id
    customerName
    amount
    status
  }
}

# Gateway splits into:
# ┌─────────────────────────────────────┐
# │ To Auth Service:                    │
# │ query {                             │
# │   user(id: "user-123") {            │
# │     id                              │
# │     name                            │
# │     email                           │
# │   }                                 │
# │ }                                   │
# └─────────────────────────────────────┘
#
# ┌─────────────────────────────────────┐
# │ To Billing Service:                 │
# │ query {                             │
# │   transactions(limit: 10) {         │
# │     id                              │
# │     customerName                    │
# │     amount                          │
# │     status                          │
# │   }                                 │
# │ }                                   │
# └─────────────────────────────────────┘
```

## Schema Composition

```mermaid
graph TB
    subgraph "Supergraph Schema"
        SUPER[Composed Schema<br/>Single GraphQL API]
    end

    subgraph "Subgraph Schemas"
        AUTH_SCHEMA["Auth Subgraph<br/>type Query {<br/>  user: User<br/>}<br/>type User @key(fields: 'id') {<br/>  id: ID!<br/>  email: String<br/>  name: String<br/>}"]

        BILLING_SCHEMA["Billing Subgraph<br/>type Query {<br/>  transactions: [Transaction]<br/>  revenueStats: RevenueStats<br/>}<br/>type Transaction {<br/>  id: ID!<br/>  amount: Float<br/>}"]

        ANALYTICS_SCHEMA["Analytics Subgraph<br/>type Query {<br/>  analyticsStats: AnalyticsStats<br/>  recentActivity: [ActivityLog]<br/>}"]

        COMPLIANCE_SCHEMA["Compliance Subgraph<br/>type Query {<br/>  complianceStats: ComplianceStats<br/>  complianceChecks: [ComplianceCheck]<br/>}"]
    end

    AUTH_SCHEMA --> SUPER
    BILLING_SCHEMA --> SUPER
    ANALYTICS_SCHEMA --> SUPER
    COMPLIANCE_SCHEMA --> SUPER

    style SUPER fill:#e8f5e9
```

## GraphQL Schema Federation Directives

```mermaid
graph TB
    subgraph "Federation Directives"
        KEY["@key<br/>Define entity key"]
        EXTENDS["@extends<br/>Extend type from another service"]
        EXTERNAL["@external<br/>Mark field from another service"]
        REQUIRES["@requires<br/>Declare dependencies"]
        PROVIDES["@provides<br/>Declare provided fields"]
    end

    subgraph "Use Cases"
        U1[Define shareable entities]
        U2[Extend types across services]
        U3[Reference external fields]
        U4[Specify field requirements]
        U5[Optimize query planning]
    end

    KEY --> U1
    EXTENDS --> U2
    EXTERNAL --> U3
    REQUIRES --> U4
    PROVIDES --> U5

    style KEY fill:#e3f2fd
```

**Example Federation Schema:**

```graphql
# Auth Service Schema
type User @key(fields: "id") {
  id: ID!
  email: String!
  name: String!
  roles: [String!]!
  permissions: [String!]!
}

type Query {
  user(id: ID!): User
}

# User Service Schema (extends User)
extend type User @key(fields: "id") {
  id: ID! @external
  profile: UserProfile
  settings: UserSettings
}

type UserProfile {
  bio: String
  avatar: String
}
```

## Request Flow Through Gateway

```mermaid
graph TB
    A[Incoming GraphQL Request] --> B{CORS Check}
    B -->|Fail| C[403 Forbidden]
    B -->|Pass| D{Parse Query}

    D -->|Invalid| E[400 Bad Request]
    D -->|Valid| F{Query Planning}

    F --> G[Identify Required Subgraphs]
    G --> H{Execute Subgraph Queries}

    H --> I{All Successful?}
    I -->|No| J[Partial Error Response]
    I -->|Yes| K[Merge Results]

    K --> L{Transform Response}
    L --> M[Send to Client]

    style M fill:#c8e6c9
    style C fill:#ffcdd2
    style E fill:#ffcdd2
    style J fill:#fff3e0
```

## Error Handling Strategy

```mermaid
graph TB
    A[Subgraph Query] --> B{Response}

    B -->|Success| C[Include in Result]
    B -->|Network Error| D{Retry?}
    B -->|GraphQL Error| E[Include in Errors Array]
    B -->|Timeout| F[Timeout Error]

    D -->|Yes| A
    D -->|No| G[Service Unavailable Error]

    C --> H[Merged Response]
    E --> H
    F --> H
    G --> H

    H --> I{Partial Data?}
    I -->|Yes| J[Return data + errors]
    I -->|No| K[Return errors only]

    style C fill:#c8e6c9
    style J fill:#fff3e0
    style K fill:#ffcdd2
```

**Error Response Format:**

```json
{
  "data": {
    "transactions": [
      {
        "id": "trans-001",
        "amount": 50000,
        "status": "completed"
      }
    ],
    "analyticsStats": null
  },
  "errors": [
    {
      "message": "Service temporarily unavailable",
      "path": ["analyticsStats"],
      "extensions": {
        "code": "SERVICE_UNAVAILABLE",
        "serviceName": "analytics"
      }
    }
  ]
}
```

## CORS Configuration

```mermaid
graph LR
    subgraph "API Gateway main.ts"
        MAIN[NestJS App]
        CORS[app.enableCors]
    end

    subgraph "Allowed Origins"
        O1[http://localhost:4200<br/>Shell App]
        O2[http://localhost:4201<br/>Billing MFE]
        O3[http://localhost:4202<br/>Analytics MFE]
        O4[http://localhost:4203<br/>Compliance MFE]
        O5[https://*.vercel.app<br/>Production]
    end

    MAIN --> CORS
    CORS -.->|Allow| O1
    CORS -.->|Allow| O2
    CORS -.->|Allow| O3
    CORS -.->|Allow| O4
    CORS -.->|Allow| O5

    style CORS fill:#e8f5e9
```

**CORS Configuration Code:**

```typescript
// apps/api-gateway/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all frontend applications
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4201',
      'http://localhost:4202',
      'http://localhost:4203',
      /\.vercel\.app$/, // All Vercel deployments
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
```

## Caching Strategy

```mermaid
graph TB
    subgraph "Gateway Cache Layers"
        L1[In-Memory Cache<br/>Apollo Server Cache]
        L2[Response Cache<br/>@cacheControl directive]
    end

    subgraph "Cache Policies"
        P1[No Cache<br/>Mutations, sensitive data]
        P2[Short TTL<br/>Frequently changing data<br/>1-5 minutes]
        P3[Long TTL<br/>Static data<br/>1 hour+]
    end

    L1 --> P1
    L1 --> P2
    L1 --> P3

    L2 --> P2
    L2 --> P3

    style L1 fill:#e8f5e9
    style L2 fill:#fff3e0
```

**Cache Control Example:**

```graphql
type Query {
  # Cached for 5 minutes
  transactions: [Transaction] @cacheControl(maxAge: 300)

  # Cached for 1 hour
  revenueStats: RevenueStats @cacheControl(maxAge: 3600)

  # Never cached
  currentUser: User @cacheControl(maxAge: 0)
}
```

## Performance Optimizations

```mermaid
graph TB
    subgraph "Optimization Techniques"
        O1[Query Batching]
        O2[DataLoader Pattern]
        O3[Parallel Execution]
        O4[Response Caching]
        O5[Schema Pruning]
        O6[Persisted Queries]
    end

    subgraph "Benefits"
        B1[Reduced Network Calls]
        B2[Avoid N+1 Queries]
        B3[Faster Response Times]
        B4[Lower Server Load]
        B5[Smaller Payloads]
        B6[CDN Caching]
    end

    O1 --> B1
    O2 --> B2
    O3 --> B3
    O4 --> B4
    O5 --> B5
    O6 --> B6

    style O1 fill:#e3f2fd
    style O2 fill:#e3f2fd
    style O3 fill:#e3f2fd
    style O4 fill:#e3f2fd
```

## Monitoring & Observability

```mermaid
graph TB
    subgraph "Metrics Collection"
        M1[Query Latency]
        M2[Subgraph Response Times]
        M3[Error Rates]
        M4[Cache Hit Ratio]
    end

    subgraph "Logging"
        L1[Query Logs]
        L2[Error Logs]
        L3[Performance Logs]
    end

    subgraph "Tracing"
        T1[Distributed Tracing]
        T2[Query Execution Path]
    end

    M1 --> DASH[Monitoring Dashboard]
    M2 --> DASH
    M3 --> DASH
    M4 --> DASH

    L1 --> LOG[Centralized Logging]
    L2 --> LOG
    L3 --> LOG

    T1 --> TRACE[Trace Viewer]
    T2 --> TRACE

    style DASH fill:#e8f5e9
    style LOG fill:#fff3e0
    style TRACE fill:#e3f2fd
```

## GraphQL Playground & Introspection

```mermaid
graph LR
    subgraph "Development Tools"
        PLAY[GraphQL Playground<br/>localhost:3000/graphql]
        INTRO[Schema Introspection]
        DOCS[Auto-generated Docs]
    end

    subgraph "Features"
        F1[Test Queries]
        F2[Explore Schema]
        F3[View Documentation]
        F4[Debug Errors]
    end

    PLAY --> F1
    INTRO --> F2
    DOCS --> F3
    PLAY --> F4

    style PLAY fill:#e3f2fd
```

## Gateway Startup Flow

```mermaid
sequenceDiagram
    participant Main
    participant App as NestJS App
    participant Gateway as Apollo Gateway
    participant Subgraphs

    Main->>App: Create Application
    App->>Gateway: Initialize Gateway
    Gateway->>Subgraphs: Fetch Schemas (SDL)
    Subgraphs-->>Gateway: Return SDL
    Gateway->>Gateway: Compose Supergraph
    Gateway->>Gateway: Validate Schema
    Gateway-->>App: Gateway Ready
    App->>App: Enable CORS
    App->>App: Start HTTP Server
    App-->>Main: Server Running on Port 3000

    Note over Main: Gateway accepting requests
```

## Unified GraphQL Schema

```graphql
# Composed Supergraph Schema (Auto-generated)
type Query {
  # From Auth Service
  user(id: ID!): User

  # From Billing Service
  transactions(limit: Int): [Transaction!]!
  revenueStats: RevenueStats!

  # From Analytics Service
  analyticsStats: AnalyticsStats!
  recentActivity(limit: Int): [ActivityLog!]!

  # From Compliance Service
  complianceStats: ComplianceStats!
  complianceChecks: [ComplianceCheck!]!
  auditLogs(limit: Int): [AuditLog!]!
}

type Mutation {
  # From Auth Service
  googleLogin(credential: String!): AuthResponse!
}

# Types from various services
type User {
  id: ID!
  email: String!
  name: String!
  roles: [String!]!
  permissions: [String!]!
}

type Transaction {
  id: ID!
  customerName: String!
  amount: Float!
  status: String!
  date: String!
}

type RevenueStats {
  totalRevenue: Float!
  monthlyGrowth: Float!
  pendingInvoices: Int!
  nextPayoutDate: String!
}

# ... more types from other services
```

## Key Design Decisions

1. **Apollo Federation**: Industry-standard for GraphQL composition
2. **Managed Federation**: Services register their schemas autonomously
3. **No Schema Stitching**: Federation provides better performance and type safety
4. **Service List**: Static configuration via environment variables
5. **CORS Enabled**: Allow cross-origin requests from all frontends
6. **No Authentication Middleware**: Authentication handled by individual services
7. **Stateless Gateway**: No business logic, only query routing

## Deployment Considerations

- **Scaling**: Gateway can be horizontally scaled
- **Health Checks**: Monitor gateway and subgraph health
- **Circuit Breakers**: Prevent cascading failures
- **Rate Limiting**: Protect against abuse
- **Load Balancing**: Distribute traffic across gateway instances

## Future Enhancements

- [ ] Add Apollo Studio for schema management
- [ ] Implement persisted queries
- [ ] Add distributed tracing (OpenTelemetry)
- [ ] Implement query complexity analysis
- [ ] Add rate limiting per user/client
- [ ] Implement response compression
- [ ] Add query allow-listing for production
- [ ] Implement schema versioning
