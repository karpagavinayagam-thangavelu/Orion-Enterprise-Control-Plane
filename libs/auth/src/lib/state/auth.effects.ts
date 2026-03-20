import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { AuthActions } from './auth.actions';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
    private authService = inject(AuthService);
    private actions$ = inject(Actions);
    private router = inject(Router);

    googleLogin$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.googleLoginRequest),
            mergeMap(({ credential }) => {
                console.log('AuthEffects: Processing Google Login Request');
                return this.authService.loginWithGoogle(credential).pipe(
                    map(user => {
                        console.log('AuthEffects: Login Success', user);
                        return AuthActions.loginSuccess({ user });
                    }),
                    catchError(error => {
                        // The error message here is already cleaned up by AuthService.extractErrorMessage
                        console.error('AuthEffects: Login Failure State:', error.message);
                        return of(AuthActions.loginFailure({ error: error.message || 'Login failed' }));
                    })
                );
            })
        )
    );

    persistUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            map(({ user }) => {
                console.log('AuthEffects: Persisting User', user);
                localStorage.setItem('orion_user', JSON.stringify(user));
                // Navigation is now handled by AppComponent effect to avoid race conditions
                return { type: 'NO_ACTION' };
            })
        ), { dispatch: false }
    );

    clearUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            mergeMap(() => {
                localStorage.removeItem('orion_user');
                this.router.navigate(['/login']);
                return of();
            })
        ), { dispatch: false }
    );
}
