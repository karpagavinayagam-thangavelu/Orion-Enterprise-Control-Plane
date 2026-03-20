import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { ErrorHandler } from '@angular/core';
import { appRoutes } from './app.routes';
import { authReducer, AuthEffects, AUTH_CONFIG } from '@orion/auth';
import { UI_CONFIG } from '@orion/ui';
import { OrionErrorHandler } from './error-handler';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: ErrorHandler, useClass: OrionErrorHandler },
    {
      provide: AUTH_CONFIG,
      useValue: {
        googleClientId: environment.googleClientId
      }
    },
    {
      provide: UI_CONFIG,
      useValue: {
        wsUrl: environment.wsUrl
      }
    },
    provideHttpClient(withInterceptors([
      (req, next) => {
        const userJson = localStorage.getItem('orion_user');
        const user = userJson ? JSON.parse(userJson) : null;
        const token = user?.accessToken;
        if (token) {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        return next(req);
      }
    ])),
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: environment.apiUrl,
        }),
        cache: new InMemoryCache(),
      };
    }),
    provideRouter(appRoutes),
    provideStore({
      auth: authReducer,
    }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};
