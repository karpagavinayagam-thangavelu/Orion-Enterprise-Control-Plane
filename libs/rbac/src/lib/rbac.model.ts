import { Routes } from '@angular/router';

export interface OrionFeature {
  routes: Routes;
  permissions: string[];
}

export interface FeatureRegistryEntry {
  remoteEntry: string;
  exposedModule: string;
  displayName: string;
  icon: string;
  roles: string[];
  permissions: string[];
  enabled: boolean;
  routePath: string;
}

export type FeatureRegistry = Record<string, FeatureRegistryEntry>;

export interface PermissionContext {
  roles: string[];
  permissions: string[];
}
