import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class FeatureFlag {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field()
    enabled: boolean;

    @Field({ nullable: true })
    description?: string;
}
