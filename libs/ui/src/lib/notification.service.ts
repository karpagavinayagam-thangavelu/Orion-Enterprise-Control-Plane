import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { GlobalMessagingService } from './global-messaging.service';
import { UI_CONFIG } from './ui.config';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private socket: Socket;
    private globalMsg = inject(GlobalMessagingService);
    private config = inject(UI_CONFIG);

    notifications = signal<string[]>([]);
    isConnected = signal(false);

    constructor() {
        this.socket = io(this.config.wsUrl, { transports: ['websocket'] });

        this.socket.on('connect', () => {
            console.log('Connected to Notification Service');
            this.isConnected.set(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from Notification Service');
            this.isConnected.set(false);
        });

        this.socket.on('notification', (data: { message: string, timestamp: string }) => {
            console.log('Received notification:', data);
            this.notifications.update(n => [data.message, ...n]);

            // Publish to global bus as well
            this.globalMsg.publish({
                type: 'NOTIFICATION',
                source: 'NotificationService',
                payload: data
            });
        });
    }

    sendTestMessage(msg: string) {
        this.socket.emit('msgToServer', msg);
    }
}
