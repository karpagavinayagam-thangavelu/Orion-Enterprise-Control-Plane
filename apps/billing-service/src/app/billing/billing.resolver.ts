import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { BillingService } from './billing.service';
import { Transaction, RevenueStats } from './entities/billing.entity';

@Resolver()
export class BillingResolver {
    constructor(private readonly billingService: BillingService) { }

    @Query(() => [Transaction], { name: 'transactions' })
    async getTransactions(
        @Args('limit', { type: () => Int, nullable: true }) limit?: number
    ) {
        return this.billingService.getTransactions(limit);
    }

    @Query(() => RevenueStats, { name: 'revenueStats' })
    async getRevenueStats() {
        return this.billingService.getRevenueStats();
    }
}
