import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Transaction {
    @Field(() => ID)
    id: string;

    @Field()
    customerId: string;

    @Field()
    customerName: string;

    @Field()
    amount: number;

    @Field()
    status: string;

    @Field()
    date: Date;
}

@ObjectType()
export class RevenueStats {
    @Field()
    totalRevenue: number;

    @Field()
    monthlyGrowth: number;

    @Field()
    pendingInvoices: number;

    @Field()
    nextPayoutDate: string;
}
