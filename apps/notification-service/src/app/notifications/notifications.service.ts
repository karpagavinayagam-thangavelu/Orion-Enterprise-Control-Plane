import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService implements OnModuleInit {
    constructor(private readonly gateway: NotificationsGateway) { }

    onModuleInit() {
        setInterval(() => {
            const messages = [
                'System health is optimal (99.9% uptime)',
                'Snapshot backup completed successfully',
                'New deployment detected in staging environment',
                'Load balancer scaled up for high traffic',
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.sendNotification(randomMessage);
        }, 10000);
    }

    async sendNotification(message: string) {
        this.gateway.sendUpdate('notification', {
            message,
            timestamp: new Date().toISOString(),
        });
        return { success: true, message };
    }
}
