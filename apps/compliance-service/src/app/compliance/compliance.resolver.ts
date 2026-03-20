import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ComplianceService } from './compliance.service';
import { ComplianceCheck, AuditLog, ComplianceStats } from './entities/compliance.entity';

@Resolver()
export class ComplianceResolver {
    constructor(private readonly complianceService: ComplianceService) { }

    @Query(() => [ComplianceCheck], { name: 'complianceChecks' })
    async getChecks() {
        return this.complianceService.getChecks();
    }

    @Query(() => [AuditLog], { name: 'auditLogs' })
    async getAuditLogs(@Args('limit', { type: () => Int, nullable: true }) limit?: number) {
        return this.complianceService.getAuditLogs(limit);
    }

    @Query(() => ComplianceStats, { name: 'complianceStats' })
    async getStats() {
        return this.complianceService.getStats();
    }
}
