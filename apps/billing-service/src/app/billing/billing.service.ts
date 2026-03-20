import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction, RevenueStats } from './entities/billing.entity';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    async getTransactions(limit: number = 5): Promise<Transaction[]> {
        return this.prisma.transaction.findMany({
            take: limit,
            orderBy: { date: 'desc' },
        });
    }

    async getRevenueStats(): Promise<RevenueStats> {
        const transactions = await this.prisma.transaction.findMany();
        const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        const pendingInvoices = await this.prisma.invoice.count({
            where: { status: 'PENDING' },
        });

        return {
            totalRevenue,
            monthlyGrowth: 0.12, // Mocked for now, but could be calculated
            pendingInvoices,
            nextPayoutDate: 'Feb 15, 2026',
        };
    }
}
