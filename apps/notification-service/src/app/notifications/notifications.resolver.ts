import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { NotificationsService } from './notifications.service';

@Resolver()
export class NotificationsResolver {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Mutation(() => Boolean)
    async pushNotification(@Args('message') message: string) {
        await this.notificationsService.sendNotification(message);
        return true;
    }

    @Query(() => String)
    async healthCheck() {
        return 'Notification Service is up and running';
    }
}
