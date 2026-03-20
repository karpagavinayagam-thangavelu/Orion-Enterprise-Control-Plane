import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('@orion/auth').then(m => m.Auth)
  },
  {
    path: '',
    children: [] // Will be populated by FeatureLoaderService
  }
];
