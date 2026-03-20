# Backend Microservices Architecture

## Overview

The Orion Enterprise platform uses a microservices architecture with NestJS and GraphQL, following Domain-Driven Design (DDD) principles.

## Microservices Component Diagram

```mermaid
graph TB
    subgraph "API Gateway"
        GW[Apollo Federation Gateway<br/>@apollo/gateway<br/>Port 3000]
    end

    subgraph "Auth Domain"
        AUTH[Auth Service<br/>Port 3001]
        AUTH_RES[Auth Resolver]
        AUTH_SVC[Auth Service]
        AUTH_ENT[User Entity]
    end

    subgraph "User Domain"
        USER[User Service<br/>Port 3002]
        USER_RES[User Resolver]
        USER_SVC[User Service]
        USER_ENT[User Entity]
    end

    subgraph "Billing Domain"
        BILL[Billing Service<br/>Port 3006]
        BILL_RES[Billing Resolver]
        BILL_SVC[Billing Service]
        BILL_ENT1[Transaction Entity]
        BILL_ENT2[Invoice Entity]
    end

    subgraph "Analytics Domain"
        ANLY[Analytics Service<br/>Port 3004]
        ANLY_RES[Analytics Resolver]
        ANLY_SVC[Analytics Service]
        ANLY_ENT1[Metric Entity]
        ANLY_ENT2[AnalyticsStats Entity]
        ANLY_ENT3[ActivityLog Entity]
    end

    subgraph "Compliance Domain"
        COMP[Compliance Service<br/>Port 3007]
        COMP_RES[Compliance Resolver]
        COMP_SVC[Compliance Service]
        COMP_ENT1[ComplianceCheck Entity]
        COMP_ENT2[AuditLog Entity]
        COMP_ENT3[ComplianceStats Entity]
    end

    subgraph "Notification Domain"
        NOTIF[Notification Service<br/>Port 3005<br/>WebSocket Support]
        NOTIF_GW[Notification Gateway]
        NOTIF_SVC[Notification Service]
    end

    GW -->|Federated Query| AUTH
    GW -->|Federated Query| USER
    GW -->|Federated Query| BILL
    GW -->|Federated Query| ANLY
    GW -->|Federated Query| COMP
    GW -->|Federated Query| NOTIF

    AUTH --> AUTH_RES
    AUTH_RES --> AUTH_SVC
    AUTH_SVC --> AUTH_ENT

    USER --> USER_RES
    USER_RES --> USER_SVC
    USER_SVC --> USER_ENT

    BILL --> BILL_RES
    BILL_RES --> BILL_SVC
    BILL_SVC --> BILL_ENT1
    BILL_SVC --> BILL_ENT2

    ANLY --> ANLY_RES
    ANLY_RES --> ANLY_SVC
    ANLY_SVC --> ANLY_ENT1
    ANLY_SVC --> ANLY_ENT2
    ANLY_SVC --> ANLY_ENT3

    COMP --> COMP_RES
    COMP_RES --> COMP_SVC
    COMP_SVC --> COMP_ENT1
    COMP_SVC --> COMP_ENT2
    COMP_SVC --> COMP_ENT3

    NOTIF --> NOTIF_GW
    NOTIF_GW --> NOTIF_SVC

    style GW fill:#e8f5e9
    style AUTH fill:#fff3e0
    style USER fill:#fff3e0
    style BILL fill:#fff3e0
    style ANLY fill:#fff3e0
    style COMP fill:#fff3e0
    style NOTIF fill:#e1f5fe
```

## NestJS Service Structure

```mermaid
graph TB
    subgraph "Service Layer Architecture"
        MOD[NestJS Module<br/>@Module decorator]
        CON[Controller Layer<br/>HTTP/GraphQL endpoints]
        RES[Resolver Layer<br/>GraphQL resolvers]
        SVC[Service Layer<br/>Business logic]
        REPO[Repository/Prisma<br/>Data access]
        ENT[Entity Layer<br/>Type definitions]
        DTO[DTO Layer<br/>Data Transfer Objects]
    end

    MOD --> CON
    MOD --> RES
    MOD --> SVC
    RES --> SVC
    CON --> SVC
    SVC --> REPO
    SVC --> ENT
    RES --> DTO
    CON --> DTO

    style MOD fill:#e3f2fd
    style RES fill:#fff3e0
    style SVC fill:#e8f5e9
    style REPO fill:#fce4ec
```

## Service Communication Pattern

```mermaid
sequenceDiagram
    participant Client
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Billing as Billing Service
    participant DB as Database

    Client->>Gateway: GraphQL Query<br/>{user, transactions}

    Note over Gateway: Query Planning<br/>Splits federated query

    par Parallel Subgraph Queries
        Gateway->>Auth: Query User
        Auth->>DB: SELECT from AuthUser
        DB-->>Auth: User Data
        Auth-->>Gateway: User Response
    and
        Gateway->>Billing: Query Transactions
        Billing->>DB: SELECT from Transaction
        DB-->>Billing: Transaction Data
        Billing-->>Gateway: Transaction Response
    end

    Gateway->>Gateway: Merge Responses
    Gateway-->>Client: Unified GraphQL Response
```

## GraphQL Schema Federation

```mermaid
graph LR
    subgraph "Federated Schema"
        SUPER[Supergraph Schema<br/>Composed from all subgraphs]
    end

    subgraph "Subgraph Schemas"
        AUTH_S[Auth Subgraph<br/>@key directive on User]
        USER_S[User Subgraph<br/>@extends User]
        BILL_S[Billing Subgraph<br/>Transaction, Invoice types]
        ANLY_S[Analytics Subgraph<br/>Metric, Stats types]
        COMP_S[Compliance Subgraph<br/>ComplianceCheck types]
    end

    AUTH_S --> SUPER
    USER_S --> SUPER
    BILL_S --> SUPER
    ANLY_S --> SUPER
    COMP_S --> SUPER

    style SUPER fill:#e8f5e9
```

## Detailed Service Breakdown

### 1. Auth Service (Port 3001)

```mermaid
classDiagram
    class AuthModule {
        +imports: JwtModule, ConfigModule
        +providers: AuthService, AuthResolver
        +exports: AuthService
    }

    class AuthResolver {
        +googleLogin(credential: String): AuthResponse
    }

    class AuthService {
        -jwtService: JwtService
        +googleLogin(credential: string): Promise~AuthResponse~
        +validateUser(payload: any): Promise~User~
    }

    class AuthResponse {
        +accessToken: string
        +user: User
    }

    class User {
        +id: string
        +email: string
        +name: string
        +roles: string[]
        +permissions: string[]
    }

    AuthModule --> AuthResolver
    AuthModule --> AuthService
    AuthResolver --> AuthService
    AuthService --> AuthResponse
    AuthResponse --> User
```

**Technologies:**

- NestJS + GraphQL Code-First
- JWT for token generation
- Google OAuth verification (stateless)
- No database dependency (stateless auth)

**Key Files:**

```
apps/auth-service/
├── src/
│   ├── app/
│   │   ├── app.module.ts          # Main module
│   │   └── auth/
│   │       ├── auth.resolver.ts   # GraphQL resolver
│   │       ├── auth.service.ts    # Business logic
│   │       └── dto/
│   │           └── auth-response.dto.ts
│   └── main.ts                     # Bootstrap
```

### 2. Billing Service (Port 3006)

```mermaid
classDiagram
    class BillingModule {
        +imports: GraphQLModule, PrismaModule
        +providers: BillingService, BillingResolver
    }

    class BillingResolver {
        +getTransactions(limit?: number): Transaction[]
        +getRevenueStats(): RevenueStats
    }

    class BillingService {
        -prisma: PrismaClient
        +getTransactions(limit?: number): Promise~Transaction[]~
        +getRevenueStats(): Promise~RevenueStats~
    }

    class Transaction {
        +id: string
        +customerName: string
        +amount: number
        +status: string
        +date: DateTime
    }

    class RevenueStats {
        +totalRevenue: number
        +monthlyGrowth: number
        +pendingInvoices: number
        +nextPayoutDate: string
    }

    BillingModule --> BillingResolver
    BillingModule --> BillingService
    BillingResolver --> BillingService
    BillingService --> Transaction
    BillingService --> RevenueStats
```

**Database Schema (Prisma):**

```prisma
model Transaction {
  id           String   @id @default(uuid())
  customerId   String
  customerName String
  amount       Float
  status       String
  date         DateTime @default(now())
}

model Invoice {
  id           String   @id @default(uuid())
  customerId   String
  amount       Float
  status       String
  dueDate      DateTime
  createdAt    DateTime @default(now())
}
```

### 3. Analytics Service (Port 3004)

```mermaid
classDiagram
    class AnalyticsModule {
        +imports: GraphQLModule, PrismaModule
        +providers: AnalyticsService, AnalyticsResolver
    }

    class AnalyticsResolver {
        +analyticsStats(): AnalyticsStats
        +recentActivity(limit?: number): ActivityLog[]
        +analyticsMetrics(): AnalyticsMetric[]
    }

    class AnalyticsService {
        -prisma: PrismaClient
        +getStats(): Promise~AnalyticsStats~
        +getRecentActivity(limit?: number): Promise~ActivityLog[]~
        +findAll(): Promise~AnalyticsMetric[]~
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
        +timestamp: DateTime
    }

    class AnalyticsMetric {
        +id: string
        +name: string
        +value: number
        +timestamp: DateTime
    }

    AnalyticsModule --> AnalyticsResolver
    AnalyticsModule --> AnalyticsService
    AnalyticsResolver --> AnalyticsService
    AnalyticsService --> AnalyticsStats
    AnalyticsService --> ActivityLog
    AnalyticsService --> AnalyticsMetric
```

### 4. Compliance Service (Port 3007)

```mermaid
classDiagram
    class ComplianceModule {
        +imports: GraphQLModule, PrismaModule
        +providers: ComplianceService, ComplianceResolver
    }

    class ComplianceResolver {
        +complianceStats(): ComplianceStats
        +complianceChecks(): ComplianceCheck[]
        +auditLogs(limit?: number): AuditLog[]
    }

    class ComplianceService {
        -prisma: PrismaClient
        +getStats(): Promise~ComplianceStats~
        +getChecks(): Promise~ComplianceCheck[]~
        +getAuditLogs(limit?: number): Promise~AuditLog[]~
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
        +lastCheck: DateTime
    }

    class AuditLog {
        +id: string
        +action: string
        +user: string
        +timestamp: DateTime
        +status: string
    }

    ComplianceModule --> ComplianceResolver
    ComplianceModule --> ComplianceService
    ComplianceResolver --> ComplianceService
    ComplianceService --> ComplianceStats
    ComplianceService --> ComplianceCheck
    ComplianceService --> AuditLog
```

### 5. Notification Service (Port 3005)

```mermaid
graph TB
    subgraph "Notification Service Architecture"
        WS[WebSocket Gateway<br/>@WebSocketGateway]
        SVC[Notification Service]
        STORE[In-Memory Notification Store]
    end

    subgraph "Client Connections"
        C1[Client 1]
        C2[Client 2]
        C3[Client 3]
    end

    C1 <-->|Socket.IO| WS
    C2 <-->|Socket.IO| WS
    C3 <-->|Socket.IO| WS

    WS --> SVC
    SVC --> STORE

    style WS fill:#e1f5fe
    style SVC fill:#fff3e0
```

**WebSocket Events:**

- `connection`: Client connects
- `notification`: Server pushes notification
- `disconnect`: Client disconnects

## Service Startup Flow

```mermaid
sequenceDiagram
    participant Main
    participant App as NestFactory
    participant Module as AppModule
    participant Prisma as PrismaService
    participant GraphQL as GraphQLModule
    participant Server as HTTP Server

    Main->>App: Create Nest Application
    App->>Module: Initialize AppModule
    Module->>Prisma: Initialize PrismaService
    Prisma->>Prisma: Connect to Database
    Module->>GraphQL: Initialize GraphQL Module
    GraphQL->>GraphQL: Generate Schema
    App->>Server: Listen on Port
    Server-->>Main: Application Ready

    Note over Server: Service is now<br/>accepting requests
```

## Environment Configuration

Each service requires these environment variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Service-specific
PORT=3001                    # Service port
AUTH_SECRET="xxx"            # JWT secret (auth-service only)
GOOGLE_CLIENT_ID="xxx"       # Google OAuth (auth-service only)

# API Gateway (gateway service only)
AUTH_SERVICE_URL="http://localhost:3001/graphql"
USER_SERVICE_URL="http://localhost:3002/graphql"
BILLING_SERVICE_URL="http://localhost:3006/graphql"
ANALYTICS_SERVICE_URL="http://localhost:3004/graphql"
COMPLIANCE_SERVICE_URL="http://localhost:3007/graphql"
NOTIFICATION_SERVICE_URL="http://localhost:3005/graphql"
```

## Inter-Service Communication

```mermaid
graph LR
    A[Client Request] --> B{API Gateway}
    B -->|Auth Query| C[Auth Service]
    B -->|User Query| D[User Service]
    B -->|Billing Query| E[Billing Service]
    B -->|Analytics Query| F[Analytics Service]
    B -->|Compliance Query| G[Compliance Service]

    C -.->|Stateless| H[No DB]
    D -->|Prisma| I[(Database)]
    E -->|Prisma| I
    F -->|Prisma| I
    G -->|Prisma| I

    style B fill:#e8f5e9
    style I fill:#fce4ec
```

## Error Handling Strategy

```mermaid
graph TB
    A[Incoming Request] --> B{Request Validation}
    B -->|Invalid| C[400 Bad Request]
    B -->|Valid| D{Business Logic}
    D -->|Success| E[200 OK Response]
    D -->|Business Error| F[400 Business Error]
    D -->|Database Error| G{Retry Logic}
    G -->|Success| E
    G -->|Fail| H[500 Database Error]
    D -->|Unexpected Error| I[500 Internal Error]

    style E fill:#c8e6c9
    style C fill:#ffcdd2
    style F fill:#ffcdd2
    style H fill:#ffcdd2
    style I fill:#ffcdd2
```

## Key Design Decisions

1. **Stateless Auth Service**: No database dependency, validates Google tokens directly
2. **Shared Database**: Cost-effective for MVP, services access different tables
3. **GraphQL Federation**: Single unified API, automatic schema composition
4. **NestJS Framework**: Type safety, dependency injection, decorators
5. **Prisma ORM**: Type-safe database access, migrations, code generation

## Performance Optimizations

- **Connection Pooling**: Prisma connection pooling for database efficiency
- **Query Optimization**: Efficient Prisma queries with select/include
- **Caching**: In-memory caching for frequently accessed data
- **Lazy Loading**: Module lazy loading in NestJS
- **Horizontal Scaling**: Stateless services can scale horizontally
