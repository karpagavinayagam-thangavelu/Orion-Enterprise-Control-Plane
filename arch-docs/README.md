# Orion Enterprise - Architecture Documentation

Welcome to the comprehensive architecture documentation for the Orion Enterprise platform. This directory contains detailed diagrams, design decisions, and technical specifications for the entire system.

## 📚 Documentation Index

### 1. [System Overview (HLD)](./01-system-overview.md)

**High-Level Design | Bird's Eye View**

- System context diagram showing all major components
- Overall architecture with frontend, backend, and data layers
- Technology stack overview
- Core architectural patterns (Micro-Frontend, Microservices, API Gateway)
- Deployment architecture across Vercel, Render, and Neon
- Security architecture overview

**Key Diagrams:**

- C4 System Context
- Overall System Architecture
- Technology Stack
- Deployment Architecture
- Security Architecture

---

### 2. [Backend Microservices Architecture](./02-backend-architecture.md)

**Service Layer | Domain-Driven Design**

- Complete microservices component breakdown
- NestJS service structure and layers
- Service communication patterns with GraphQL Federation
- Detailed breakdown of each microservice:
  - Auth Service (Port 3001)
  - User Service (Port 3002)
  - Billing Service (Port 3006)
  - Analytics Service (Port 3004)
  - Compliance Service (Port 3007)
  - Notification Service (Port 3005)

**Key Diagrams:**

- Microservices Component Diagram
- Service Communication Patterns
- Service Startup Flow
- GraphQL Schema Federation
- Class Diagrams for each service

---

### 3. [Frontend Micro-Frontend Architecture](./03-frontend-architecture.md)

**MFA with Module Federation | Shell & Remotes**

- Webpack Module Federation implementation
- Shell application architecture
- Dynamic module loading with RBAC
- Feature metadata and authorization
- State management with NgRx
- Apollo GraphQL client configuration
- Component communication patterns

**Key Diagrams:**

- Micro-Frontend Architecture
- Module Federation Configuration
- Dynamic Module Loading Flow
- Shell Application Class Diagram
- NgRx Store Pattern
- Routing Strategy

---

### 4. [Database Architecture & Service Layer](./04-database-architecture.md)

**Data Layer | Prisma ORM | PostgreSQL**

- Complete database schema (ER Diagram)
- Master Prisma schema for all services
- Service-to-database mapping
- Prisma service layer architecture
- Database seeding strategy
- Connection pooling and optimization
- Transaction management

**Key Diagrams:**

- Database Overview
- Complete ER Diagram
- Service-to-Database Mapping
- Prisma Service Layer
- Query Execution Flow
- Connection Pooling

---

### 5. [Authentication & Authorization Flow](./05-authentication-flow.md)

**OAuth 2.0 | JWT | RBAC**

- Complete authentication flow with Google OAuth
- JWT token structure and lifecycle
- Role-Based Access Control (RBAC) implementation
- Feature loading with authorization
- NgRx auth state management
- Session management and logout flow
- Error handling in auth flow

**Key Diagrams:**

- Complete Authentication Sequence
- Google OAuth Integration
- JWT Token Structure
- RBAC Authorization Flow
- Feature Loading with RBAC
- Authorization Matrix
- Logout Flow

---

### 6. [API Gateway & GraphQL Federation](./06-api-gateway.md)

**Apollo Federation | Unified API | Query Planning**

- Apollo Gateway architecture
- Subgraph registration and discovery
- Query planning and execution
- Schema composition with federation directives
- Error handling strategy
- CORS configuration
- Performance optimizations and caching

**Key Diagrams:**

- API Gateway Architecture
- Query Planning & Execution
- Schema Composition
- Request Flow Through Gateway
- Error Handling Strategy
- Gateway Startup Flow

---

### 7. [Deployment Strategy & CI/CD](./07-deployment-strategy.md)

**Vercel | Render | Neon | Automation**

- Complete deployment architecture
- CI/CD pipeline flow
- Vercel configuration for frontend
- Render configuration for backend
- Environment variables management
- Database migration strategy
- Health checks and monitoring
- Rollback strategy

**Key Diagrams:**

- Deployment Architecture
- CI/CD Pipeline Flow
- Environment Variables Management
- Database Migration Strategy
- Health Monitoring
- Rollback Strategy

---

## 🎯 Quick Navigation by Use Case

### For New Developers

Start here to understand the system:

1. **System Overview** - Get the big picture
2. **Frontend Architecture** - Understand the UI layer
3. **Backend Architecture** - Understand the services
4. **Authentication Flow** - See how users login

### For Backend Developers

Deep dive into services:

1. **Backend Architecture** - Service structure
2. **API Gateway** - GraphQL federation
3. **Database Architecture** - Data layer
4. **Deployment Strategy** - How to deploy

### For Frontend Developers

Focus on UI implementation:

1. **Frontend Architecture** - Micro-frontends
2. **Authentication Flow** - Auth & RBAC
3. **API Gateway** - GraphQL queries
4. **Deployment Strategy** - Vercel deployment

### For DevOps Engineers

Infrastructure and deployment:

1. **Deployment Strategy** - Complete CI/CD
2. **Database Architecture** - Database management
3. **API Gateway** - Service orchestration
4. **System Overview** - Infrastructure overview

### For Architects

System design and patterns:

1. **System Overview** - High-level design
2. **All Documents** - Complete architecture

---

## 📊 Diagram Types Used

### Mermaid Diagrams

All diagrams are created using **Mermaid** syntax, which can be viewed in:

- **VS Code** with Mermaid Preview extension
- **GitHub** (native Mermaid support)
- **Mermaid Live Editor** (https://mermaid.live)
- **IntelliJ** with Mermaid plugin

### Diagram Categories

**Structural Diagrams:**

- Component Diagrams
- Class Diagrams
- ER (Entity-Relationship) Diagrams
- Deployment Diagrams

**Behavioral Diagrams:**

- Sequence Diagrams
- Flowcharts
- State Diagrams

**Infrastructure Diagrams:**

- Architecture Diagrams
- Network Diagrams
- CI/CD Pipelines

---

## 🏗️ Architecture Patterns Used

### Frontend Patterns

- **Micro-Frontend Architecture (MFA)** - Module Federation
- **CQRS** - Command Query Responsibility Segregation (NgRx)
- **Observer Pattern** - RxJS Observables
- **Dependency Injection** - Angular DI
- **Smart/Dumb Components** - Container/Presentational pattern

### Backend Patterns

- **Microservices Architecture** - Domain-driven services
- **API Gateway Pattern** - Single entry point
- **GraphQL Federation** - Schema composition
- **Repository Pattern** - Prisma ORM
- **Dependency Injection** - NestJS DI
- **Adapter Pattern** - Service layer abstraction

### Data Patterns

- **Shared Database** - Single PostgreSQL instance
- **Database per Service** - Logical separation via schemas
- **ORM Pattern** - Prisma Client
- **Connection Pooling** - Efficient resource usage

### Security Patterns

- **OAuth 2.0** - Delegated authentication
- **JWT** - Stateless authentication
- **RBAC** - Role-based access control
- **CORS** - Cross-origin security

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: Angular 21
- **Language**: TypeScript
- **Module Federation**: Webpack 5
- **State Management**: NgRx
- **GraphQL Client**: Apollo Client
- **Reactive Programming**: RxJS

### Backend

- **Framework**: NestJS
- **Language**: TypeScript
- **GraphQL**: Apollo Server + Federation
- **ORM**: Prisma
- **WebSocket**: Socket.IO
- **Authentication**: JWT

### Database

- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Connection Pooling**: Built-in Neon pooling

### Infrastructure

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database Hosting**: Neon
- **CI/CD**: GitHub Actions + Platform webhooks
- **Monorepo**: Nx

---

## 📈 System Metrics

### Scale

- **Frontend Apps**: 4 (Shell + 3 MFEs)
- **Backend Services**: 7 microservices
- **Database Tables**: 8 tables
- **GraphQL Types**: 30+ types
- **Lines of Code**: ~15,000 LOC

### Performance

- **Build Time**: ~3-5 minutes
- **Deploy Time**: ~1-2 minutes
- **Cold Start**: ~500ms-1s
- **Bundle Size**: ~500KB main bundle
- **API Response Time**: <200ms (P95)

---

## 🔧 Development Commands

### View Architecture Diagrams

```bash
# Install Mermaid CLI (optional)
npm install -g @mermaid-js/mermaid-cli

# Generate PNG from Mermaid
mmdc -i arch-docs/01-system-overview.md -o output.png
```

### VS Code Extensions

- **Mermaid Preview** - bierner.markdown-mermaid
- **Markdown All in One** - yzhang.markdown-all-in-one
- **Draw.io Integration** - hediet.vscode-drawio

---

## 📝 Document Maintenance

### When to Update

- **System Overview**: When adding/removing major components
- **Backend Architecture**: When adding/modifying services
- **Frontend Architecture**: When changing MFE structure
- **Database Architecture**: When modifying schema
- **Authentication Flow**: When changing auth logic
- **API Gateway**: When changing federation setup
- **Deployment Strategy**: When changing infrastructure

### How to Update

1. Edit the relevant .md file
2. Update the Mermaid diagrams inline
3. Test diagrams in Mermaid Live Editor
4. Commit changes with clear description

---

## 🎓 Learning Resources

### Micro-Frontend Architecture

- [Micro Frontends](https://micro-frontends.org/)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)

### GraphQL Federation

- [Apollo Federation Docs](https://www.apollographql.com/docs/federation/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

### NestJS & Microservices

- [NestJS Documentation](https://docs.nestjs.com/)
- [Microservices Patterns](https://microservices.io/patterns/)

### Prisma ORM

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

## 🤝 Contributing to Documentation

### Adding New Diagrams

1. Use Mermaid syntax for consistency
2. Follow existing diagram styles
3. Add descriptive titles and legends
4. Include both structural and behavioral views

### Diagram Best Practices

- **Keep it Simple**: One concept per diagram
- **Use Colors**: Consistent color coding
- **Add Legends**: Explain symbols and colors
- **Layer Diagrams**: Start high-level, add details
- **Update Regularly**: Keep in sync with code

---

## 📞 Support

For questions about the architecture:

- Review the relevant documentation file
- Check the Mermaid diagrams
- Refer to the code implementation
- Contact the architecture team

---

## 📜 License

This documentation is part of the Orion Enterprise project and follows the same license as the main codebase.

---

**Last Updated**: 2026-02-16  
**Documentation Version**: 1.0.0  
**Platform Version**: Orion Enterprise v1.0

---

## Quick Reference Card

| Component            | Port | URL (Local)           | URL (Production)                        |
| -------------------- | ---- | --------------------- | --------------------------------------- |
| Shell App            | 4200 | http://localhost:4200 | orion-shell.vercel.app                  |
| Billing MFE          | 4201 | http://localhost:4201 | orion-billing.vercel.app                |
| Analytics MFE        | 4202 | http://localhost:4202 | orion-analytics.vercel.app              |
| Compliance MFE       | 4203 | http://localhost:4203 | orion-compliance.vercel.app             |
| API Gateway          | 3000 | http://localhost:3000 | orion-api-gateway.onrender.com          |
| Auth Service         | 3001 | http://localhost:3001 | orion-auth-service.onrender.com         |
| User Service         | 3002 | http://localhost:3002 | orion-user-service.onrender.com         |
| Feature Service      | 3003 | http://localhost:3003 | orion-feature-service.onrender.com      |
| Analytics Service    | 3004 | http://localhost:3004 | orion-analytics-service.onrender.com    |
| Notification Service | 3005 | http://localhost:3005 | orion-notification-service.onrender.com |
| Billing Service      | 3006 | http://localhost:3006 | orion-billing-service.onrender.com      |
| Compliance Service   | 3007 | http://localhost:3007 | orion-compliance-service.onrender.com   |

**Database**: Neon PostgreSQL (shared across all services)
