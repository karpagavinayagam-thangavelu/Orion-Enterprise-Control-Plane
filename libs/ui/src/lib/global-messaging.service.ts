import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface GlobalMessage {
    type: string;
    payload?: any;
    source: string;
}

@Injectable({
    providedIn: 'root',
})
export class GlobalMessagingService {
    private messageBus = new Subject<GlobalMessage>();
    readonly messages$ = this.messageBus.asObservable();

    private _lastMessage = signal<GlobalMessage | null>(null);
    readonly lastMessage = this._lastMessage.asReadonly();

    publish(message: GlobalMessage) {
        this._lastMessage.set(message);
        this.messageBus.next(message);
        console.log(`[GlobalBus] From ${message.source}:`, message);
    }
}
