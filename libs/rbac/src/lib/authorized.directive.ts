import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { RbacService } from './rbac.service';

@Directive({
    selector: '[orionAuthorized]',
    standalone: true,
})
export class AuthorizedDirective {
    private templateRef = inject(TemplateRef<any>);
    private viewContainer = inject(ViewContainerRef);
    private rbac = inject(RbacService);

    private requiredPermissions: string[] = [];
    private requiredRoles: string[] = [];
    private hasView = false;

    @Input() set orionAuthorized(permissions: string[] | string | undefined) {
        if (permissions) {
            this.requiredPermissions = typeof permissions === 'string' ? [permissions] : permissions;
        } else {
            this.requiredPermissions = [];
        }
        this.updateView();
    }

    @Input() set orionAuthorizedRoles(roles: string[] | string | undefined) {
        if (roles) {
            this.requiredRoles = typeof roles === 'string' ? [roles] : roles;
        } else {
            this.requiredRoles = [];
        }
        this.updateView();
    }

    constructor() {
        effect(() => {
            this.rbac.context();
            this.updateView();
        });
    }

    private updateView() {
        const isAuthorized = this.rbac.isAuthorized(this.requiredRoles, this.requiredPermissions);

        if (isAuthorized && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!isAuthorized && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }
}
