import { Injectable, signal, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map, catchError } from 'rxjs/operators';

export interface User {
    id: string;
    name: string;
    email?: string;
    roles: string[];
    permissions: string[];
    accessToken?: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apollo = inject(Apollo);
    private _user = signal<User | null>(null);
    readonly user = this._user.asReadonly();

    private extractErrorMessage(error: any): string {
        console.error('AuthService: raw error object', error);

        if (!error) return 'Unknown error';

        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
            return error.graphQLErrors.map((e: any) => e.message).join(', ');
        }

        if (error.networkError) {
            const netErr = error.networkError;
            if (netErr.error && typeof netErr.error === 'string' && netErr.error.includes('<html')) {
                return `Server Error: Received HTML instead of JSON (possibly Bad Gateway). Status: ${netErr.status}`;
            }
            return netErr.message || `Network Error: ${netErr.statusText || 'Connection failed'}`;
        }

        if (error.message) return error.message;

        try {
            return typeof error === 'string' ? error : JSON.stringify(error);
        } catch (_) {
            return 'An unparseable error occurred';
        }
    }

    loginWithGoogle(credential: string) {
        const mutation = gql`
            mutation GoogleLogin($credential: String!) {
              googleLogin(credential: $credential) {
                accessToken
                user {
                  id
                  name
                  email
                  roles
                }
              }
            }
        `;

        return this.apollo.mutate<any>({
            mutation,
            variables: { credential }
        }).pipe(
            map((result: any) => {
                if (result.errors && result.errors.length > 0) {
                    console.error('AuthService: GraphQL Errors', result.errors);
                    throw new Error(result.errors[0].message);
                }
                if (result.data?.googleLogin) {
                    const data = result.data.googleLogin;
                    const user: User = {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        roles: data.user.roles,
                        permissions: this.getPermissionsForRoles(data.user.roles),
                        accessToken: data.accessToken
                    };
                    this._user.set(user);
                    return user;
                }
                throw new Error('Google login failed - no data returned');
            }),
            catchError(err => {
                const message = this.extractErrorMessage(err);
                throw new Error(message);
            })
        );
    }

    private getPermissionsForRoles(roles: string[]): string[] {
        const permissions: string[] = [];
        if (roles.includes('ADMIN')) permissions.push('VIEW_BILLING', 'VIEW_ANALYTICS', 'VIEW_COMPLIANCE');
        if (roles.includes('FINANCE')) permissions.push('VIEW_BILLING');
        if (roles.includes('MANAGER')) permissions.push('VIEW_ANALYTICS');
        return Array.from(new Set(permissions));
    }

    logout() {
        this._user.set(null);
    }
}
