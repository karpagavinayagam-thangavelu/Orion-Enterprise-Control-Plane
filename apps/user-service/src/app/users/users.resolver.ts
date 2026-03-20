import { Resolver, ResolveReference, Query, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) { }

    @Query(() => User, { nullable: true })
    async getUserProfile(@Args('id') id: string): Promise<Partial<User> | null> {
        return await this.usersService.findOne(id);
    }

    @ResolveReference()
    async resolveReference(reference: { __typename: string; id: string }): Promise<Partial<User>> {
        return await this.usersService.findOne(reference.id);
    }
}
