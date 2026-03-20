import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class AnalyticsMetric {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field(() => Float)
    value: number;

    @Field()
    timestamp: Date;
}

@ObjectType()
export class ActivityLog {
    @Field(() => ID)
    id: string;

    @Field()
    userId: string;

    @Field()
    action: string;

    @Field()
    timestamp: Date;
}

@ObjectType()
export class AnalyticsStats {
    @Field(() => Int)
    activeUsers: number;

    @Field(() => Int)
    totalRequests: number;

    @Field(() => Float)
    avgResponseTime: number;

    @Field(() => Float)
    errorRate: number;
}
