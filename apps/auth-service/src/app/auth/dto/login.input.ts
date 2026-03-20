import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput {
    @Field()
    email: string;

    @Field({ nullable: true })
    password?: string;
}
