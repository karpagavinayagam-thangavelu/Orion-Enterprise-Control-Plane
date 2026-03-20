import { Resolver, Query, Args, ResolveReference } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) { }

    @Query(() => [User], { name: 'users' })
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Query(() => User, { name: 'user' })
    async findOne(@Args('id') id: string): Promise<User> {
        return this.usersService.findOne(id);
    }

    @ResolveReference()
    async resolveReference(reference: { __typename: string; id: string }): Promise<User> {
        return this.usersService.findOne(reference.id);
    }
}
