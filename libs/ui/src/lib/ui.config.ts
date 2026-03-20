import { InjectionToken } from '@angular/core';

export interface UiConfig {
    wsUrl: string;
}

export const UI_CONFIG = new InjectionToken<UiConfig>('UI_CONFIG');
