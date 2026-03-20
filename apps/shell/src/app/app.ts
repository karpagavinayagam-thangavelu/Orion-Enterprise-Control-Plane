import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { RouterModule, Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthActions, selectUser } from '@orion/auth';
import { RbacService, FeatureLoaderService, AuthorizedDirective } from '@orion/rbac';
import { SkeletonLoaderComponent, NotificationService, LogoComponent } from '@orion/ui';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, AuthorizedDirective, SkeletonLoaderComponent, LogoComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  public router = inject(Router);
  private store = inject(Store);
  private rbac = inject(RbacService);
  public featureLoader = inject(FeatureLoaderService); // Changed to public for template access
  public notificationService = inject(NotificationService);

  user = this.store.selectSignal(selectUser);
  authorizedFeatures = signal<any[]>([]);
  isSidebarOpen = signal(true);

  constructor() {
    // Track global router navigation for the skeleton loader
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.featureLoader.isContentLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationError ||
        event instanceof NavigationCancel
      ) {
        this.featureLoader.isContentLoading.set(false);
      }
    });

    // When the user state changes in NgRx, update the RBAC service context (Signal)
    effect(() => {
      const u = this.user();
      console.log('AppComponent: User state changed:', u?.email);
      
      if (u) {
        this.rbac.setContext({
          roles: u.roles,
          permissions: u.permissions,
        });
        
        // Load authorized features (async)
        this.reloadFeatures();

        // If we are currently on the login page or have no active route, redirect to home
        // We use a small delay or check current URL to ensure we don't disrupt ongoing loads
        const currentUrl = this.router.url;
        if (currentUrl.includes('login') || currentUrl === '/') {
          console.log('AppComponent: Redirecting authenticated user to dashboard');
          this.router.navigate(['/']);
        }
      } else {
        // Only redirect to login if we are not already there
        if (!this.router.url.includes('login')) {
          console.log('AppComponent: Redirecting unauthenticated user to login');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  ngOnInit() {
    // Check if we are authenticated, if not redirec to login happens in effect
  }

  private async reloadFeatures() {
    // 2. Load Authorized Features dynamically
    const features = await this.featureLoader.loadAuthorizedFeatures();
    this.authorizedFeatures.set(features);
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
    window.location.reload();
  }
}
