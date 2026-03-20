import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { User } from '../auth.service';

export const AuthActions = createActionGroup({
    source: 'Auth',
    events: {
        'Login Request': props<{ role: 'ADMIN' | 'FINANCE_ADMIN' | 'MANAGER' }>(),
        'Google Login Request': props<{ credential: string }>(),
        'Login Success': props<{ user: User }>(),
        'Login Failure': props<{ error: string }>(),
        'Logout': emptyProps(),
    }
});
