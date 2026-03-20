# @orion/backend-shared
> **Shared Backend Logic & Microservice Utilities**

## 📖 Overview
The `libs/backend/shared` directory contains core infrastructure code and utilities shared across all NestJS microservices. It ensures that cross-cutting concerns like authentication, event handling, and data contracts are implemented consistently.

## 📁 Structure
- **auth/**: Shared NestJS guards, strategies, and decorators for JWT verification.
- **contracts/**: Common Prisma schemas or shared DTOs used for cross-service communication.
- **events/**: (Planned) Infrastructure for Event-Driven Architecture (e.g., RabbitMQ or Redis pub/sub).
- **utils/**: Common helpers for logging, error handling, and data mapping.

## 🚀 Key Patterns
- **Standardized Responses**: Core logic to ensure all microservices follow the same API response format.
- **Service-to-Service Security**: Utilities for validating internal communication between services.

## 🛠 Integration
Import modules into your NestJS Feature modules:
```typescript
import { SharedAuthModule } from '@orion/backend-shared';

@Module({
  imports: [SharedAuthModule],
})
export class MyServiceModule {}
```
