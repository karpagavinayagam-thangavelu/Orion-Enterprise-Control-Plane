import { ErrorHandler, Injectable, Injector } from '@angular/core';

@Injectable()
export class OrionErrorHandler implements ErrorHandler {
    handleError(error: any): void {
        const chunkFailedMessage = /Loading chunk [\d]+ failed/;

        if (chunkFailedMessage.test(error.message)) {
            console.error('Remote Feature Load Failed. Attempting recovery...', error);
            // In a real app, we might force a reload or show a dedicated "Module Offline" UI
        } else {
            console.error('Orion Platform Error:', error);
        }
    }
}
