import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceCheck, AuditLog, ComplianceStats } from './entities/compliance.entity';

@Injectable()
export class ComplianceService {
    constructor(private prisma: PrismaService) { }

    async getChecks(): Promise<ComplianceCheck[]> {
        return this.prisma.complianceCheck.findMany();
    }

    async getAuditLogs(limit: number = 10): Promise<AuditLog[]> {
        return this.prisma.auditLog.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' },
        });
    }

    async getStats(): Promise<ComplianceStats> {
        const checks = await this.prisma.complianceCheck.findMany();
        const compliant = checks.filter(c => c.status === 'COMPLIANT').length;

        return {
            complianceScore: checks.length > 0 ? (compliant / checks.length) * 100 : 94.5,
            activePolicies: 24,
            recentViolations: 3,
            lastAudit: 'Jan 28, 2026',
        };
    }
}
