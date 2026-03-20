# Database Architecture & Service Layer

## Overview

The Orion Enterprise platform uses a **shared PostgreSQL database** hosted on Neon, with Prisma ORM for type-safe database access across all microservices.

## Database Architecture Overview

```mermaid
graph TB
    subgraph "Neon PostgreSQL Database"
        DB[(neondb<br/>Shared Database)]

        subgraph "Tables"
            T1[AuthUser]
            T2[Transaction]
            T3[Invoice]
            T4[ComplianceCheck]
            T5[AuditLog]
            T6[Metric]
            T7[ActivityLog]
            T8[SystemPerformance]
        end
    end

    subgraph "Prisma Clients"
        P1[Auth Service<br/>Prisma Client]
        P2[Billing Service<br/>Prisma Client]
        P3[Compliance Service<br/>Prisma Client]
        P4[Analytics Service<br/>Prisma Client]
        P5[User Service<br/>Prisma Client]
    end

    P1 -->|Read/Write| T1
    P2 -->|Read/Write| T2
    P2 -->|Read/Write| T3
    P3 -->|Read/Write| T4
    P3 -->|Read/Write| T5
    P4 -->|Read/Write| T6
    P4 -->|Read/Write| T7
    P4 -->|Read/Write| T8
    P5 -->|Read/Write| T1

    style DB fill:#fce4ec
```

## Complete Database Schema (ER Diagram)

```mermaid
erDiagram
    AuthUser ||--o{ ActivityLog : "has"
    AuthUser ||--o{ AuditLog : "performs"

    AuthUser {
        string id PK
        string email UK
        string name
        string googleId UK
        string[] roles
        string[] permissions
        datetime createdAt
        datetime updatedAt
    }

    Transaction {
        string id PK
        string customerId
        string customerName
        float amount
        string status
        datetime date
    }

    Invoice {
        string id PK
        string customerId
        float amount
        string status
        datetime dueDate
        datetime createdAt
    }

    ComplianceCheck {
        string id PK
        string title
        string status
        string category
        datetime lastCheck
    }

    AuditLog {
        string id PK
        string action
        string user
        datetime timestamp
        string status
    }

    Metric {
        string id PK
        string name
        float value
        datetime timestamp
    }

    ActivityLog {
        string id PK
        string userId FK
        string action
        datetime timestamp
    }

    SystemPerformance {
        string id PK
        string metricName
        float metricValue
        datetime timestamp
    }
```

## Master Schema (Unified Prisma Schema)

```mermaid
graph TB
    subgraph "prisma_master.prisma"
        GEN[Generator<br/>prisma-client-js]
        DS[Datasource<br/>postgresql]

        subgraph "Billing Models"
            M1[Transaction Model]
            M2[Invoice Model]
        end

        subgraph "Compliance Models"
            M3[ComplianceCheck Model]
            M4[AuditLog Model]
        end

        subgraph "Analytics Models"
            M5[Metric Model]
            M6[ActivityLog Model]
            M7[SystemPerformance Model]
        end

        subgraph "Auth Models"
            M8[AuthUser Model]
        end
    end

    DS --> M1
    DS --> M2
    DS --> M3
    DS --> M4
    DS --> M5
    DS --> M6
    DS --> M7
    DS --> M8

    style DS fill:#e8f5e9
```

**Complete Prisma Schema:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Auth Models
model AuthUser {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String
  googleId    String   @unique
  roles       String[]
  permissions String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Billing Models
model Transaction {
  id           String   @id @default(uuid())
  customerId   String
  customerName String
  amount       Float
  status       String
  date         DateTime @default(now())
}

model Invoice {
  id        String   @id @default(uuid())
  customerId String
  amount    Float
  status    String
  dueDate   DateTime
  createdAt DateTime @default(now())
}

// Compliance Models
model ComplianceCheck {
  id        String   @id @default(uuid())
  title     String
  status    String   // COMPLIANT, NON_COMPLIANT, PENDING
  category  String
  lastCheck DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  action    String
  user      String
  timestamp DateTime @default(now())
  status    String
}

// Analytics Models
model Metric {
  id        String   @id @default(uuid())
  name      String
  value     Float
  timestamp DateTime @default(now())
}

model ActivityLog {
  id        String   @id @default(uuid())
  userId    String
  action    String
  timestamp DateTime @default(now())
}

model SystemPerformance {
  id          String   @id @default(uuid())
  metricName  String
  metricValue Float
  timestamp   DateTime @default(now())
}
```

## Service-to-Database Mapping

```mermaid
graph TB
    subgraph "Microservices"
        AUTH[Auth Service]
        USER[User Service]
        BILL[Billing Service]
        COMP[Compliance Service]
        ANLY[Analytics Service]
    end

    subgraph "Database Tables"
        T1[(AuthUser)]
        T2[(Transaction)]
        T3[(Invoice)]
        T4[(ComplianceCheck)]
        T5[(AuditLog)]
        T6[(Metric)]
        T7[(ActivityLog)]
        T8[(SystemPerformance)]
    end

    AUTH -.->|No DB Access<br/>Stateless| AUTH
    USER -->|CRUD| T1
    BILL -->|CRUD| T2
    BILL -->|CRUD| T3
    COMP -->|CRUD| T4
    COMP -->|CRUD| T5
    ANLY -->|CRUD| T6
    ANLY -->|CRUD| T7
    ANLY -->|CRUD| T8

    style AUTH fill:#fff3e0
    style T1 fill:#e3f2fd
    style T2 fill:#e3f2fd
    style T3 fill:#e3f2fd
    style T4 fill:#e3f2fd
    style T5 fill:#e3f2fd
    style T6 fill:#e3f2fd
    style T7 fill:#e3f2fd
    style T8 fill:#e3f2fd
```

## Prisma Service Layer Architecture

```mermaid
classDiagram
    class PrismaClient {
        +$connect(): Promise~void~
        +$disconnect(): Promise~void~
        +$transaction(fn): Promise~T~
        +$queryRaw(sql): Promise~any~
        +transaction: TransactionDelegate
        +invoice: InvoiceDelegate
        +complianceCheck: ComplianceCheckDelegate
        +auditLog: AuditLogDelegate
        +metric: MetricDelegate
        +activityLog: ActivityLogDelegate
    }

    class TransactionDelegate {
        +findMany(args): Promise~Transaction[]~
        +findUnique(args): Promise~Transaction~
        +create(args): Promise~Transaction~
        +update(args): Promise~Transaction~
        +delete(args): Promise~Transaction~
        +upsert(args): Promise~Transaction~
    }

    class BillingService {
        -prisma: PrismaClient
        +getTransactions(limit?): Promise~Transaction[]~
        +getRevenueStats(): Promise~RevenueStats~
        +createTransaction(data): Promise~Transaction~
    }

    class ComplianceService {
        -prisma: PrismaClient
        +getChecks(): Promise~ComplianceCheck[]~
        +getStats(): Promise~ComplianceStats~
        +getAuditLogs(limit?): Promise~AuditLog[]~
    }

    class AnalyticsService {
        -prisma: PrismaClient
        +getStats(): Promise~AnalyticsStats~
        +getRecentActivity(limit?): Promise~ActivityLog[]~
        +findAll(): Promise~Metric[]~
    }

    PrismaClient --> TransactionDelegate
    BillingService --> PrismaClient
    ComplianceService --> PrismaClient
    AnalyticsService --> PrismaClient
```

## Database Connection Flow

```mermaid
sequenceDiagram
    participant App as NestJS App
    participant Module as Service Module
    participant Prisma as PrismaService
    participant Pool as Connection Pool
    participant DB as Neon Database

    App->>Module: Initialize Module
    Module->>Prisma: Create PrismaService
    Prisma->>Prisma: new PrismaClient()

    Note over Prisma: onModuleInit()
    Prisma->>Pool: $connect()
    Pool->>DB: Establish Connection Pool
    DB-->>Pool: Connection Established
    Pool-->>Prisma: Connected

    Note over App: Application Ready

    App->>Prisma: Query Request
    Prisma->>Pool: Get Connection
    Pool->>DB: Execute Query
    DB-->>Pool: Query Result
    Pool-->>Prisma: Result
    Prisma-->>App: Formatted Response

    Note over App: Application Shutdown
    App->>Prisma: onModuleDestroy()
    Prisma->>Pool: $disconnect()
    Pool->>DB: Close Connections
```

## Query Execution Flow

```mermaid
graph TB
    A[GraphQL Resolver] --> B[Service Method]
    B --> C{Prisma Query}

    C --> D[Query Builder]
    D --> E[SQL Generation]
    E --> F[Connection Pool]
    F --> G[(Database)]

    G --> H[Raw Result]
    H --> I[Type Mapping]
    I --> J[Prisma Model Instance]
    J --> K[GraphQL Response]

    style C fill:#e8f5e9
    style G fill:#fce4ec
```

## Billing Service Data Layer

```mermaid
classDiagram
    class BillingService {
        -prisma: PrismaClient
        +getTransactions(limit?: number): Promise~Transaction[]~
        +getRevenueStats(): Promise~RevenueStats~
    }

    class Transaction {
        +id: string
        +customerId: string
        +customerName: string
        +amount: number
        +status: string
        +date: Date
    }

    class RevenueStats {
        +totalRevenue: number
        +monthlyGrowth: number
        +pendingInvoices: number
        +nextPayoutDate: string
    }

    BillingService --> Transaction : queries
    BillingService --> RevenueStats : computes
```

**Example Prisma Query:**

```typescript
// Get all transactions
async getTransactions(limit = 10): Promise<Transaction[]> {
  return this.prisma.transaction.findMany({
    take: limit,
    orderBy: {
      date: 'desc',
    },
  });
}

// Get revenue stats (computed from transactions and invoices)
async getRevenueStats(): Promise<RevenueStats> {
  const transactions = await this.prisma.transaction.findMany();
  const invoices = await this.prisma.invoice.findMany();

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;

  return {
    totalRevenue,
    monthlyGrowth: 12.5,
    pendingInvoices,
    nextPayoutDate: '2026-03-01',
  };
}
```

## Analytics Service Data Layer

```mermaid
classDiagram
    class AnalyticsService {
        -prisma: PrismaClient
        +getStats(): Promise~AnalyticsStats~
        +getRecentActivity(limit?: number): Promise~ActivityLog[]~
        +findAll(): Promise~Metric[]~
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
        +timestamp: Date
    }

    class Metric {
        +id: string
        +name: string
        +value: number
        +timestamp: Date
    }

    AnalyticsService --> AnalyticsStats : computes
    AnalyticsService --> ActivityLog : queries
    AnalyticsService --> Metric : queries
```

## Compliance Service Data Layer

```mermaid
classDiagram
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
        +lastCheck: Date
    }

    class AuditLog {
        +id: string
        +action: string
        +user: string
        +timestamp: Date
        +status: string
    }

    ComplianceService --> ComplianceStats : computes
    ComplianceService --> ComplianceCheck : queries
    ComplianceService --> AuditLog : queries
```

## Database Seeding Strategy

```mermaid
graph TB
    A[DATABASE_URL<br/>Environment Variable] --> B[Master Schema Push]
    B --> C{prisma db push<br/>--schema=prisma_master.prisma}

    C --> D[Create All Tables]

    D --> E[Seed Billing Data]
    D --> F[Seed Compliance Data]
    D --> G[Seed Analytics Data]

    E --> H[Transaction Records]
    E --> I[Invoice Records]

    F --> J[ComplianceCheck Records]
    F --> K[AuditLog Records]

    G --> L[Metric Records]
    G --> M[ActivityLog Records]
    G --> N[SystemPerformance Records]

    style C fill:#e8f5e9
    style D fill:#fff3e0
```

**Seed Script Example (Billing):**

```typescript
// apps/billing-service/prisma/seed.ts
import { PrismaClient } from '../src/generated-client';

const prisma = new PrismaClient();

async function main() {
  // Seed Transactions
  await prisma.transaction.upsert({
    where: { id: 'trans-001' },
    update: {},
    create: {
      id: 'trans-001',
      customerId: 'cust-001',
      customerName: 'Acme Corporation',
      amount: 50000,
      status: 'completed',
      date: new Date('2026-01-15'),
    },
  });

  // Seed Invoices
  await prisma.invoice.upsert({
    where: { id: 'inv-001' },
    update: {},
    create: {
      id: 'inv-001',
      customerId: 'cust-001',
      amount: 25000,
      status: 'pending',
      dueDate: new Date('2026-03-01'),
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

## Connection Pooling Configuration

```mermaid
graph TB
    subgraph "Neon PostgreSQL"
        POOL[Connection Pool<br/>Max: 100 connections]
    end

    subgraph "Microservices"
        S1[Auth Service<br/>Pool Size: 5]
        S2[Billing Service<br/>Pool Size: 10]
        S3[Analytics Service<br/>Pool Size: 10]
        S4[Compliance Service<br/>Pool Size: 10]
        S5[User Service<br/>Pool Size: 5]
    end

    S1 -.->|5 connections| POOL
    S2 -.->|10 connections| POOL
    S3 -.->|10 connections| POOL
    S4 -.->|10 connections| POOL
    S5 -.->|5 connections| POOL

    style POOL fill:#fce4ec
```

**Prisma Connection Configuration:**

```typescript
// DATABASE_URL format
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?connection_limit=10&pool_timeout=20
```

## Transaction Management

```mermaid
sequenceDiagram
    participant Service
    participant Prisma
    participant DB

    Service->>Prisma: $transaction([op1, op2])
    Prisma->>DB: BEGIN TRANSACTION

    Prisma->>DB: Execute Operation 1
    DB-->>Prisma: Success

    Prisma->>DB: Execute Operation 2
    DB-->>Prisma: Success

    Prisma->>DB: COMMIT
    DB-->>Prisma: Committed
    Prisma-->>Service: Transaction Success

    Note over Service,DB: If any operation fails,<br/>entire transaction rolls back
```

**Transaction Example:**

```typescript
async createInvoiceWithTransaction(data: CreateInvoiceDto) {
  return this.prisma.$transaction(async (tx) => {
    // Create invoice
    const invoice = await tx.invoice.create({
      data: {
        customerId: data.customerId,
        amount: data.amount,
        status: 'pending',
        dueDate: data.dueDate,
      },
    });

    // Create transaction record
    await tx.transaction.create({
      data: {
        customerId: data.customerId,
        customerName: data.customerName,
        amount: data.amount,
        status: 'pending',
        date: new Date(),
      },
    });

    return invoice;
  });
}
```

## Query Optimization Strategies

1. **Select Only Needed Fields:**

```typescript
this.prisma.transaction.findMany({
  select: {
    id: true,
    customerName: true,
    amount: true,
  },
});
```

2. **Use Pagination:**

```typescript
this.prisma.transaction.findMany({
  take: 10,
  skip: 20,
});
```

3. **Add Indexes** (in Prisma schema):

```prisma
model Transaction {
  id       String @id @default(uuid())
  date     DateTime @default(now())
  status   String

  @@index([status])
  @@index([date])
}
```

4. **Batch Operations:**

```typescript
await this.prisma.transaction.createMany({
  data: transactions,
  skipDuplicates: true,
});
```

## Data Access Patterns

```mermaid
graph TB
    A[GraphQL Query] --> B{Data Access Pattern}

    B -->|Single Record| C[findUnique]
    B -->|Multiple Records| D[findMany]
    B -->|Aggregation| E[aggregate/count]
    B -->|Raw SQL| F[queryRaw]

    C --> G[(Database)]
    D --> G
    E --> G
    F --> G

    style B fill:#e8f5e9
    style G fill:#fce4ec
```

## Key Design Decisions

1. **Shared Database**: Cost-effective for MVP, simpler data consistency
2. **Neon PostgreSQL**: Serverless, auto-scaling, branching support
3. **Prisma ORM**: Type safety, migrations, excellent DX
4. **Service-Specific Schemas**: Each service has its own Prisma schema pointing to specific tables
5. **Master Schema**: Used for initial setup and seeding
6. **Connection Pooling**: Optimized per-service connection limits
7. **No ORMs in Auth Service**: Stateless, no database dependency

## Migration Strategy

```bash
# Generate Prisma Client
npx prisma generate --schema=apps/billing-service/prisma/schema.prisma

# Push schema to database (development)
DATABASE_URL="..." npx prisma db push --schema=prisma_master.prisma

# Run migrations (production)
DATABASE_URL="..." npx prisma migrate deploy
```
