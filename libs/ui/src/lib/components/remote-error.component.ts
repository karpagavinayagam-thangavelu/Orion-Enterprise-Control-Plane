import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'orion-remote-error',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>Unable to Load {{ remoteName }}</h2>
      <p>This module is currently unavailable. Please check your connection or try again later.</p>
      <button class="retry-btn" (click)="onRetry()">Retry Connection</button>
    </div>
  `,
    styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      text-align: center;
      background: rgba(244, 63, 94, 0.05);
      border: 1px dashed rgba(244, 63, 94, 0.3);
      border-radius: 24px;
      margin: 40px;
    }
    .error-icon { font-size: 3rem; margin-bottom: 24px; }
    h2 { color: #f43f5e; margin-bottom: 12px; }
    p { color: #94a3b8; max-width: 400px; line-height: 1.6; margin-bottom: 32px; }
    .retry-btn {
      padding: 12px 24px;
      background: #f43f5e;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .retry-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3); }
  `]
})
export class RemoteErrorComponent {
    private route = inject(ActivatedRoute);

    @Input() remoteName = this.route.snapshot.data['remoteName'] || 'Remote Module';
    @Output() retry = new EventEmitter<void>();

    onRetry() {
        this.retry.emit();
        window.location.reload();
    }
}
