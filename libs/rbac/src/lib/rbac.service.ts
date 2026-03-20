import { Injectable, signal, computed } from '@angular/core';
import { PermissionContext } from './rbac.model';

@Injectable({
    providedIn: 'root',
})
export class RbacService {
    private _context = signal<PermissionContext>({
        roles: [],
        permissions: [],
    });

    readonly context = this._context.asReadonly();

    readonly roles = computed(() => this._context().roles);
    readonly permissions = computed(() => this._context().permissions);

    setContext(context: PermissionContext) {
        this._context.set(context);
    }

    hasRole(role: string): boolean {
        return this._context().roles.includes(role);
    }

    hasPermission(permission: string): boolean {
        return this._context().permissions.includes(permission);
    }

    hasAnyRole(roles: string[]): boolean {
        if (!roles || roles.length === 0) return true;
        return roles.some((r) => this._context().roles.includes(r));
    }

    hasAnyPermission(permissions: string[]): boolean {
        if (!permissions || permissions.length === 0) return true;
        return permissions.some((p) => this._context().permissions.includes(p));
    }

    isAuthorized(requiredRoles: string[], requiredPermissions: string[]): boolean {
        const roleMatch = this.hasAnyRole(requiredRoles);
        const permissionMatch = this.hasAnyPermission(requiredPermissions);
        return roleMatch || permissionMatch;
    }
}
