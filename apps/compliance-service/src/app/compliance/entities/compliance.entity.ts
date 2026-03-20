import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class ComplianceCheck {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field()
    status: string;

    @Field()
    category: string;

    @Field()
    lastCheck: Date;
}

@ObjectType()
export class AuditLog {
    @Field(() => ID)
    id: string;

    @Field()
    action: string;

    @Field()
    user: string;

    @Field()
    timestamp: Date;

    @Field()
    status: string;
}

@ObjectType()
export class ComplianceStats {
    @Field(() => Float)
    complianceScore: number;

    @Field(() => Int)
    activePolicies: number;

    @Field(() => Int)
    recentViolations: number;

    @Field()
    lastAudit: string;
}
