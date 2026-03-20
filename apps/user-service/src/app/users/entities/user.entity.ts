import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
    @Field(() => ID)
    id: string;

    @Field({ nullable: true })
    bio?: string;

    @Field({ nullable: true })
    avatarUrl?: string;
}
