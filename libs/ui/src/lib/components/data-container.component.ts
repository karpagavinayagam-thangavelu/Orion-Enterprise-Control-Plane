import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'orion-data-container',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="data-container">
      @if (title) {
        <div class="container-header">
          <h3>{{ title }}</h3>
          <ng-content select="[header-actions]"></ng-content>
        </div>
      }
      <div class="container-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
    styles: [`
    .data-container {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 20px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
    .container-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .container-header h3 {
      font-size: 1.25rem;
      color: #f1f5f9;
      margin: 0;
    }
  `]
})
export class DataContainerComponent {
    @Input() title?: string;
}
