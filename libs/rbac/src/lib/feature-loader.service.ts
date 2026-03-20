import { Injectable, inject, signal } from '@angular/core';
import { Router, Route } from '@angular/router';
import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';
import { RbacService } from './rbac.service';
import { ManifestService, RemoteErrorComponent } from '@orion/ui';

interface FeatureMeta {
    displayName: string;
    icon: string;
    roles: string[];
    permissions: string[];
    enabled: boolean;
    routePath: string;
}

@Injectable({
    providedIn: 'root',
})
export class FeatureLoaderService {
    private router = inject(Router);
    private rbac = inject(RbacService);
    private manifestService = inject(ManifestService);

    isContentLoading = signal(false);

    // Metadata for features
    private featuresMeta: Record<string, FeatureMeta> = {
        billing: {
            displayName: 'Billing',
            icon: '💵',
            roles: ['ADMIN', 'FINANCE'],
            permissions: ['VIEW_BILLING'],
            enabled: true,
            routePath: 'billing',
        },
        analytics: {
            displayName: 'Analytics',
            icon: '📊',
            roles: ['ADMIN', 'ANALYST'],
            permissions: ['VIEW_ANALYTICS'],
            enabled: true,
            routePath: 'analytics',
        },
        compliance: {
            displayName: 'Compliance',
            icon: '🛡️',
            roles: ['ADMIN', 'COMPLIANCE_OFFICER'],
            permissions: ['VIEW_COMPLIANCE'],
            enabled: true,
            routePath: 'compliance',
        },
    };

    async loadAuthorizedFeatures() {
        try {
            this.isContentLoading.set(true);

            // 1. Use centralized manifest service
            const manifest = await this.manifestService.loadManifest();

            // 2. Filter and map authorized features
            const authorizedFeatures = Object.entries(this.featuresMeta)
                .filter(([key, meta]) => {
                    const remoteEntry = manifest[key];
                    return (
                        remoteEntry &&
                        meta.enabled &&
                        this.rbac.isAuthorized(meta.roles, meta.permissions)
                    );
                })
                .map(([key, meta]) => ({
                    key,
                    ...meta,
                    remoteEntry: manifest[key],
                    exposedModule: `${key}/Routes`,
                }));

            const newRoutes: Route[] = [];

            for (const feature of authorizedFeatures) {
                newRoutes.push({
                    path: feature.routePath,
                    loadChildren: () => {
                        // 3. Robust remote registration
                        registerRemotes([
                            {
                                name: feature.key,
                                entry: feature.remoteEntry,
                            },
                        ]);

                        return loadRemote<any>(feature.exposedModule)
                            .then((m) => m.remoteRoutes)
                            .catch((err) => {
                                console.error(`Error loading remote ${feature.key}:`, err);
                                // Return a route that shows the error component
                                return [
                                    {
                                        path: '',
                                        component: RemoteErrorComponent,
                                        data: { remoteName: feature.displayName }
                                    }
                                ];
                            });
                    },
                });
            }

            // 4. Update router config
            this.router.resetConfig([...this.router.config, ...newRoutes]);

            return authorizedFeatures;
        } catch (error) {
            console.error('Failed to load features:', error);
            return [];
        } finally {
            this.isContentLoading.set(false);
        }
    }
}
