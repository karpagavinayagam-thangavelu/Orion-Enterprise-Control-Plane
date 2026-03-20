import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'orion-skeleton-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="skeleton-container" [style.height]="height" [style.width]="width">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line" *ngFor="let i of [1,2,3]"></div>
      </div>
      <div class="skeleton-grid">
        <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
      </div>
    </div>
  `,
    styles: [`
    .skeleton-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      animation: pulse 1.5s infinite ease-in-out;
    }
    .skeleton-header {
      height: 48px;
      width: 300px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
    .skeleton-line {
      height: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 4px;
      margin-bottom: 12px;
    }
    .skeleton-line:nth-child(1) { width: 100%; }
    .skeleton-line:nth-child(2) { width: 85%; }
    .skeleton-line:nth-child(3) { width: 60%; }
    
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .skeleton-card {
      height: 160px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 16px;
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class SkeletonLoaderComponent {
    @Input() height = '100%';
    @Input() width = '100%';
}
