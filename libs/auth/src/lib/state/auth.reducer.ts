import { createReducer, on } from '@ngrx/store';
import { User } from '../auth.service';
import { AuthActions } from './auth.actions';

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const savedUser = localStorage.getItem('orion_user');

export const initialState: AuthState = {
    user: savedUser ? JSON.parse(savedUser) : null,
    loading: false,
    error: null,
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.loginRequest, (state) => ({ ...state, loading: true, error: null })),
    on(AuthActions.loginSuccess, (state, { user }) => ({ ...state, user, loading: false })),
    on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(AuthActions.logout, () => initialState)
);
