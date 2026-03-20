import { Component, inject, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthActions } from '../state/auth.actions';
import * as AuthSelectors from '../state/auth.selectors';
import { AUTH_CONFIG } from '../auth.config';
import { LogoComponent } from '@orion/ui';

@Component({
  selector: 'lib-auth',
  standalone: true,
  imports: [CommonModule, LogoComponent],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements AfterViewInit {
  private store = inject(Store);
  private ngZone = inject(NgZone);
  private config = inject(AUTH_CONFIG);

  error = this.store.selectSignal(AuthSelectors.selectError);
  loading = this.store.selectSignal(AuthSelectors.selectLoading);

  ngAfterViewInit() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    if (typeof (window as any).google !== 'undefined') {
      (window as any).google.accounts.id.initialize({
        client_id: this.config.googleClientId,
        callback: (response: any) => this.handleGoogleResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: 280, text: 'signin_with' }
      );
    } else {
      setTimeout(() => this.initializeGoogleSignIn(), 100);
    }
  }

  private handleGoogleResponse(response: any) {
    this.ngZone.run(() => {
      console.log('Google Sign-In Success');
      this.store.dispatch(AuthActions.googleLoginRequest({ credential: response.credential }));
    });
  }
}
