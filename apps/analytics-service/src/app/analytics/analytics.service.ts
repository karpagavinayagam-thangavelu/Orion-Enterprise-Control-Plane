import { Injectable } from '@nestjs/common';
import { AnalyticsMetric, AnalyticsStats, ActivityLog } from './entities/metric.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<AnalyticsMetric[]> {
        return await this.prisma.metric.findMany();
    }

    async getStats(): Promise<AnalyticsStats> {
        // In a real app, these would be aggregated from metrics/logs
        return {
            activeUsers: 1240,
            totalRequests: 85600,
            avgResponseTime: 124.5,
            errorRate: 0.02
        };
    }

    async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
        return await this.prisma.activityLog.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' }
        });
    }
}
