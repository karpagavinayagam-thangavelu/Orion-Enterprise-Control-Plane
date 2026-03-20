import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { AnalyticsService } from './analytics.service';
import { AnalyticsMetric, AnalyticsStats, ActivityLog } from './entities/metric.entity';

@Resolver()
export class AnalyticsResolver {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Query(() => [AnalyticsMetric], { name: 'analyticsMetrics' })
    async findAll() {
        return this.analyticsService.findAll();
    }

    @Query(() => AnalyticsStats, { name: 'analyticsStats' })
    async getStats() {
        return this.analyticsService.getStats();
    }

    @Query(() => [ActivityLog], { name: 'recentActivity' })
    async getRecentActivity(@Args('limit', { type: () => Int, nullable: true }) limit?: number) {
        return this.analyticsService.getRecentActivity(limit);
    }
}
